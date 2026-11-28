import { afterEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { ARQUIVOS_PUBLICOS, config, proxy, senhaDoHeader } from "@/proxy";

const basic = (usuario: string, senha: string) =>
  `Basic ${Buffer.from(`${usuario}:${senha}`).toString("base64")}`;

const req = (path: string, authorization?: string) =>
  new NextRequest(`http://localhost${path}`, authorization ? { headers: { authorization } } : undefined);

/** NextResponse.next() sinaliza "segue" com este header. */
const passou = (res: Response) => res.headers.get("x-middleware-next") === "1";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("proxy (Basic Auth)", () => {
  test("sem APP_PASSWORD não bloqueia (dev local)", () => {
    vi.stubEnv("APP_PASSWORD", "");
    expect(passou(proxy(req("/")))).toBe(true);
    expect(passou(proxy(req("/api/interpret")))).toBe(true);
  });

  test.each(["/", "/api/interpret", "/api/lancamentos"])("com APP_PASSWORD, %s sem credencial dá 401", async (path) => {
    vi.stubEnv("APP_PASSWORD", "segredo");
    const res = proxy(req(path));
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toMatch(/^Basic realm="MEIva"/);
    expect(await res.text()).toMatch(/Acesso restrito/);
  });

  test("senha certa passa, com qualquer usuário (e senha com ':')", () => {
    vi.stubEnv("APP_PASSWORD", "seg:redo");
    expect(passou(proxy(req("/", basic("qualquer", "seg:redo"))))).toBe(true);
    expect(passou(proxy(req("/api/interpret", basic("", "seg:redo"))))).toBe(true);
  });

  test("senha errada ou esquema errado dá 401", () => {
    vi.stubEnv("APP_PASSWORD", "segredo");
    expect(proxy(req("/", basic("u", "errada"))).status).toBe(401);
    expect(proxy(req("/", "Bearer segredo")).status).toBe(401);
    expect(proxy(req("/", "Basic !!!")).status).toBe(401);
  });

  test("senhaDoHeader", () => {
    expect(senhaDoHeader(basic("u", "abc"))).toBe("abc");
    expect(senhaDoHeader(null)).toBeNull();
    expect(senhaDoHeader(`Basic ${Buffer.from("semdoispontos").toString("base64")}`)).toBeNull();
  });

  describe("arquivos públicos da marca", () => {
    test.each([...ARQUIVOS_PUBLICOS])("%s passa sem senha, mesmo com APP_PASSWORD", (path) => {
      vi.stubEnv("APP_PASSWORD", "segredo");
      expect(passou(proxy(req(path)))).toBe(true);
    });

    test("com query string (o Next põe ?<hash> no ícone) também passa", () => {
      vi.stubEnv("APP_PASSWORD", "segredo");
      expect(passou(proxy(req("/icon.svg?f3a2b1c0")))).toBe(true);
    });

    test.each(["/", "/resumo", "/fiados", "/api", "/api/interpret", "/api/lancamentos", "/api/transcrever"])(
      "%s continua pedindo senha",
      (path) => {
        vi.stubEnv("APP_PASSWORD", "segredo");
        expect(proxy(req(path)).status).toBe(401);
      },
    );

    test.each([
      "/og-image.png/qualquer",
      "/og-image.pngx",
      "/OG-IMAGE.PNG",
      "/api/og-image.png",
      "/resumo/icon.svg",
      "/icon-192.png.map",
      "/manifest.webmanifest/../api/interpret",
    ])("parecido não é igual: %s pede senha", (path) => {
      vi.stubEnv("APP_PASSWORD", "segredo");
      expect(proxy(req(path)).status).toBe(401);
    });

    test("a lista só tem arquivos (com extensão), nunca uma página ou /api", () => {
      for (const path of ARQUIVOS_PUBLICOS) {
        expect(path).toMatch(/^\/[\w-]+\.(ico|svg|png|webmanifest)$/);
        expect(path.startsWith("/api")).toBe(false);
      }
    });
  });

  test("matcher cobre páginas e /api, mas não os estáticos do Next", () => {
    const re = new RegExp(`^${config.matcher[0]}$`);
    expect(re.test("/")).toBe(true);
    expect(re.test("/api/interpret")).toBe(true);
    expect(re.test("/_next/static/chunks/app.js")).toBe(false);
    expect(re.test("/favicon.ico")).toBe(false);
  });
});
