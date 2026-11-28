import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (o antigo middleware.ts; renomeado no Next 16): HTTP Basic Auth com a
 * senha em APP_PASSWORD, qualquer usuário. Cobre páginas e /api/*.
 * Sem APP_PASSWORD (dev local), não bloqueia nada. Exceção: os arquivos
 * públicos da marca (ARQUIVOS_PUBLICOS), que nunca pedem senha.
 *
 * Solução provisória até o login de verdade (Supabase Auth).
 */

const hash = (s: string) => createHash("sha256").update(s).digest();

/** Comparação em tempo constante (hash antes, para tamanhos iguais). */
function senhaConfere(recebida: string, esperada: string): boolean {
  return timingSafeEqual(hash(recebida), hash(esperada));
}

/** Senha do header "Authorization: Basic base64(usuario:senha)", ou null. */
export function senhaDoHeader(authorization: string | null): string | null {
  const [esquema, credenciais] = authorization?.trim().split(/\s+/) ?? [];
  if (esquema?.toLowerCase() !== "basic" || !credenciais) return null;
  let decodificado: string;
  try {
    decodificado = Buffer.from(credenciais, "base64").toString("utf8");
  } catch {
    return null;
  }
  const separador = decodificado.indexOf(":");
  return separador === -1 ? null : decodificado.slice(separador + 1);
}

/**
 * Arquivos públicos da marca, liberados SEM senha: o navegador busca o favicon,
 * o manifesto e os ícones sem credenciais, e o WhatsApp/as redes buscam a
 * imagem de compartilhamento sem credenciais. Lista de caminhos exatos (sem
 * prefixo nem curinga): nenhuma página e nenhuma rota /api pode entrar aqui.
 * Os três primeiros são convenções de src/app; os demais estão em public/.
 */
export const ARQUIVOS_PUBLICOS: ReadonlySet<string> = new Set([
  "/favicon.ico",
  "/icon.svg",
  "/apple-icon.png",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
  "/og-image.png",
]);

export function proxy(request: NextRequest) {
  if (ARQUIVOS_PUBLICOS.has(request.nextUrl.pathname)) return NextResponse.next();

  const esperada = process.env.APP_PASSWORD;
  if (!esperada) return NextResponse.next();

  const recebida = senhaDoHeader(request.headers.get("authorization"));
  if (recebida !== null && senhaConfere(recebida, esperada)) return NextResponse.next();

  return new NextResponse("Acesso restrito. Informe a senha do MEIva.", {
    status: 401,
    headers: {
      "www-authenticate": 'Basic realm="MEIva", charset="UTF-8"',
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

export const config = {
  // Tudo, menos os arquivos estáticos do Next e o favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
