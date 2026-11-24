import { hojeBR } from "@/lib/datas";

/**
 * Rate limits em memória.
 *
 * Limitação conhecida: em serverless cada instância tem seu próprio contador,
 * então o limite real pode ser maior. Para produção com várias instâncias,
 * trocar por um contador compartilhado (ex.: tabela no Supabase ou Upstash).
 */

export type Verificacao = { ok: boolean; tenteEmSegundos: number };

/**
 * Limite por chave (IP), janela deslizante.
 * `consultar` não gasta cota; `registrar` gasta; `verificar` faz os dois
 * (só registra se estiver liberado).
 */
export function criarRateLimit({ limite, janelaMs }: { limite: number; janelaMs: number }) {
  const acessos = new Map<string, number[]>();

  const recentesDe = (chave: string, agora: number) => {
    const recentes = (acessos.get(chave) ?? []).filter((t) => agora - t < janelaMs);
    acessos.set(chave, recentes);
    return recentes;
  };

  const consultar = (chave: string, agora: number = Date.now()): Verificacao => {
    const recentes = recentesDe(chave, agora);
    return recentes.length >= limite
      ? { ok: false, tenteEmSegundos: Math.ceil((recentes[0] + janelaMs - agora) / 1000) }
      : { ok: true, tenteEmSegundos: 0 };
  };

  const registrar = (chave: string, agora: number = Date.now()) => {
    recentesDe(chave, agora).push(agora);
    // Faxina ocasional para o Map não crescer para sempre.
    if (acessos.size > 10_000) {
      for (const [k, ts] of acessos) if (ts.every((t) => agora - t >= janelaMs)) acessos.delete(k);
    }
  };

  return {
    consultar,
    registrar,
    verificar(chave: string, agora: number = Date.now()): Verificacao {
      const v = consultar(chave, agora);
      if (v.ok) registrar(chave, agora);
      return v;
    },
    limpar() {
      acessos.clear();
    },
  };
}

/** Segundos de `agora` até a próxima meia-noite de Brasília. */
export function segundosAteMeiaNoiteBR(agora: number = Date.now()): number {
  const [ano, mes, dia] = hojeBR(new Date(agora)).split("-").map(Number);
  // Brasília é UTC-3 o ano todo (sem horário de verão desde 2019): 00:00 BRT = 03:00 UTC.
  const meiaNoite = Date.UTC(ano, mes - 1, dia + 1, 3, 0, 0);
  return Math.max(1, Math.ceil((meiaNoite - agora) / 1000));
}

/** Teto global por dia (todas as pessoas juntas), zerando à meia-noite de Brasília. */
export function criarTetoDiario({ limite }: { limite: number }) {
  let dia = "";
  let usados = 0;

  const atualizar = (agora: number) => {
    const hoje = hojeBR(new Date(agora));
    if (hoje !== dia) {
      dia = hoje;
      usados = 0;
    }
  };

  const consultar = (agora: number = Date.now()): Verificacao => {
    atualizar(agora);
    return usados >= limite
      ? { ok: false, tenteEmSegundos: segundosAteMeiaNoiteBR(agora) }
      : { ok: true, tenteEmSegundos: 0 };
  };

  return {
    consultar,
    registrar(agora: number = Date.now()) {
      atualizar(agora);
      usados++;
    },
    limpar() {
      dia = "";
      usados = 0;
    },
  };
}

/** IP do cliente atrás de proxy (Vercel preenche x-forwarded-for). */
export function ipDaRequisicao(request: Request): string {
  const encaminhado = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return encaminhado || request.headers.get("x-real-ip")?.trim() || "desconhecido";
}

/** POST /api/interpret: 60 mensagens a cada 10 minutos por IP... */
export const rateLimitInterpret = criarRateLimit({ limite: 60, janelaMs: 10 * 60 * 1000 });
/** ...e no máximo 500 por dia no total (protege o gasto com o modelo). */
export const tetoDiarioInterpret = criarTetoDiario({ limite: 500 });

/** POST /api/lancamentos/:id/desfazer: 30 a cada 10 minutos por IP. */
export const rateLimitDesfazer = criarRateLimit({ limite: 30, janelaMs: 10 * 60 * 1000 });

const json429 = (mensagem: string, tenteEmSegundos: number) =>
  Response.json(
    { error: mensagem },
    { status: 429, headers: { "retry-after": String(tenteEmSegundos) } },
  );

/** 429 do limite por IP, em português, com Retry-After. */
export function respostaLimiteExcedido(tenteEmSegundos: number, oQue = "requisições"): Response {
  const minutos = Math.max(1, Math.ceil(tenteEmSegundos / 60));
  return json429(
    `Muitas ${oQue} em pouco tempo. Espere ${minutos} minuto${minutos > 1 ? "s" : ""} e tente de novo.`,
    tenteEmSegundos,
  );
}

/** 429 do teto diário global, em português, com Retry-After até a meia-noite. */
export function respostaTetoDiario(tenteEmSegundos: number): Response {
  return json429(
    "A MEIva atingiu o limite de mensagens de hoje. Volta a funcionar à meia-noite (horário de Brasília).",
    tenteEmSegundos,
  );
}
