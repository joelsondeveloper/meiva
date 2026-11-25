import { beforeEach, describe, expect, test, vi } from "vitest";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";
import type { ResumoCaixa } from "@/lib/lancamentos/saldo";

vi.mock("@/lib/agente/agente", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/agente/agente")>()),
  agente: vi.fn(),
}));
vi.mock("@/lib/lancamentos/resumo", () => ({ montarResumoCaixa: vi.fn() }));

const { agente, ErroAgente } = await import("@/lib/agente/agente");
const { montarResumoCaixa } = await import("@/lib/lancamentos/resumo");
const { rateLimitInterpret, tetoDiarioInterpret } = await import("@/lib/rate-limit");
const { POST, maxDuration } = await import("@/app/api/interpret/route");

const mAgente = vi.mocked(agente);
const mResumo = vi.mocked(montarResumoCaixa);

const post = (body: unknown, ip = "1.2.3.4") =>
  POST(
    new Request("http://localhost/api/interpret", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const salvo: LancamentoSalvo = {
  id: "00000000-0000-4000-8000-000000000001",
  tipo: "entrada",
  natureza: "venda",
  valor_centavos: 15000,
  descricao: "3 blusas",
  forma_pagamento: "pix",
  pessoa: null,
  data: "2026-11-23",
  created_at: "2026-11-23T13:00:00Z",
  anulado_em: null,
};

const resumo = { data: "2026-11-23", saldoAcumulado: 15000 } as ResumoCaixa;
const user = (content: string) => ({ role: "user" as const, content });

beforeEach(() => {
  vi.resetAllMocks();
  rateLimitInterpret.limpar();
  tetoDiarioInterpret.limpar();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/interpret", () => {
  test("200: devolve resposta, resumo e criados", async () => {
    mAgente.mockResolvedValue({ resposta: "Registrei.", lancamentosCriados: [salvo], chamadas: [] });
    mResumo.mockResolvedValue(resumo);

    const res = await post({ mensagens: [user("vendi 3 blusas a 50 no pix")] });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ resposta: "Registrei.", resumo, lancamentosCriados: [salvo] });
    expect(mAgente).toHaveBeenCalledWith({ mensagens: [user("vendi 3 blusas a 50 no pix")] });
  });

  test("manda só as últimas 10 mensagens", async () => {
    mAgente.mockResolvedValue({ resposta: "ok", lancamentosCriados: [], chamadas: [] });
    mResumo.mockResolvedValue(resumo);
    const mensagens = Array.from({ length: 13 }, (_, i) =>
      i % 2 === 0 ? user(`u${i}`) : { role: "assistant" as const, content: `a${i}` },
    );

    await post({ mensagens });
    expect(mAgente.mock.calls[0][0].mensagens).toEqual(mensagens.slice(-10));
  });

  test.each([
    ["sem mensagens", {}],
    ["lista vazia", { mensagens: [] }],
    ["mensagem vazia", { mensagens: [user("   ")] }],
    ["mensagem longa demais", { mensagens: [user("a".repeat(501))] }],
    ["role inválido", { mensagens: [{ role: "system", content: "x" }] }],
    ["última não é do usuário", { mensagens: [user("oi"), { role: "assistant", content: "olá" }] }],
    ["JSON inválido", "{oops"],
  ])("400: %s", async (_nome, body) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toEqual(expect.any(String));
    expect(mAgente).not.toHaveBeenCalled();
  });

  test("502: agente lança erro (ex.: OpenRouter fora)", async () => {
    mAgente.mockRejectedValue(new Error("timeout do LLM"));
    const res = await post({ mensagens: [user("vendi 1 blusa a 50")] });
    expect(res.status).toBe(502);
  });

  test("502: ErroAgente sem nada gravado", async () => {
    mAgente.mockRejectedValue(new ErroAgente("caiu", [], []));
    expect((await post({ mensagens: [user("vendi 1 blusa a 50")] })).status).toBe(502);
  });

  test("200 com resposta fixa: agente falhou depois de gravar", async () => {
    mAgente.mockRejectedValue(new ErroAgente("caiu na 2ª chamada", [salvo], []));
    mResumo.mockResolvedValue(resumo);

    const res = await post({ mensagens: [user("vendi 3 blusas a 50 no pix")] });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      resposta: "Registrei, mas não consegui montar a resposta. Confira a lista abaixo.",
      resumo,
      lancamentosCriados: [salvo],
    });
  });

  test("maxDuration = 60", () => {
    expect(maxDuration).toBe(60);
  });

  test("500: falha ao montar o resumo", async () => {
    mAgente.mockResolvedValue({ resposta: "ok", lancamentosCriados: [], chamadas: [] });
    mResumo.mockRejectedValue(new Error("banco fora"));
    const res = await post({ mensagens: [user("vendi 1 blusa a 50")] });
    expect(res.status).toBe(500);
  });

  test("429 em português depois de 60 requisições em 10 minutos, por IP", async () => {
    mAgente.mockResolvedValue({ resposta: "ok", lancamentosCriados: [], chamadas: [] });
    mResumo.mockResolvedValue(resumo);
    for (let i = 0; i < 60; i++) expect((await post({ mensagens: [user("oi")] })).status).toBe(200);

    const bloqueada = await post({ mensagens: [user("oi")] });
    expect(bloqueada.status).toBe(429);
    expect(bloqueada.headers.get("retry-after")).toMatch(/^\d+$/);
    expect((await bloqueada.json()).error).toMatch(/Muitas mensagens/);

    expect((await post({ mensagens: [user("oi")] }, "5.6.7.8")).status).toBe(200);
  });

  test("429 em português no teto global de 500 por dia, mesmo trocando de IP", async () => {
    mAgente.mockResolvedValue({ resposta: "ok", lancamentosCriados: [], chamadas: [] });
    mResumo.mockResolvedValue(resumo);
    for (let i = 0; i < 499; i++) tetoDiarioInterpret.registrar();

    expect((await post({ mensagens: [user("oi")] }, "10.0.0.1")).status).toBe(200);
    const bloqueada = await post({ mensagens: [user("oi")] }, "10.0.0.2");
    expect(bloqueada.status).toBe(429);
    expect((await bloqueada.json()).error).toMatch(/limite de mensagens de hoje.*meia-noite/);
    expect(Number(bloqueada.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(mAgente).toHaveBeenCalledTimes(1);

    // Barrado pelo teto não gasta a cota do IP.
    expect(rateLimitInterpret.consultar("10.0.0.2")).toEqual({ ok: true, tenteEmSegundos: 0 });
  });
});
