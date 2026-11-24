import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Lancamento, Resultado } from "@/lib/interpreter/schema";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";

vi.mock("@/lib/interpreter/interpret", () => ({ interpret: vi.fn() }));
vi.mock("@/lib/lancamentos/repository", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/lancamentos/repository")>()),
  inserirLancamentos: vi.fn(),
  listarPorData: vi.fn(),
}));

const { interpret } = await import("@/lib/interpreter/interpret");
const { inserirLancamentos, listarPorData, RepositoryError } = await import(
  "@/lib/lancamentos/repository"
);
const { POST } = await import("@/app/api/interpret/route");
const { limiteInterpret } = await import("@/lib/rate-limit");

const mInterpret = vi.mocked(interpret);
const mInserir = vi.mocked(inserirLancamentos);
const mListar = vi.mocked(listarPorData);

const post = (body: unknown, ip = "203.0.113.1") =>
  POST(
    new Request("http://localhost/api/interpret", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const venda: Lancamento = {
  tipo: "entrada",
  valor_centavos: 15000,
  descricao: "3 blusas",
  forma_pagamento: "pix",
  data: "2026-11-23",
};
const salvo = (l: Lancamento, id: string): LancamentoSalvo => ({
  ...l,
  id,
  created_at: "2026-11-23T13:00:00Z",
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  limiteInterpret.reiniciar();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("POST /api/interpret", () => {
  test("registrado: salva e devolve o resumo do dia", async () => {
    mInterpret.mockResolvedValue({ lancamentos: [venda], precisa_confirmar: false });
    mInserir.mockResolvedValue([salvo(venda, "a")]);
    mListar.mockResolvedValue([
      salvo(venda, "a"),
      salvo({ ...venda, valor_centavos: 3000, forma_pagamento: "fiado" }, "b"),
    ]);

    const res = await post({ texto: "vendi 3 blusas a 50 no pix" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: "registrado",
      lancamentos: [salvo(venda, "a")],
      resumo: { entradas: 15000, saidas: 0, saldo: 15000, aReceber: 3000 },
    });
    expect(mInterpret).toHaveBeenCalledWith("vendi 3 blusas a 50 no pix");
    expect(mInserir).toHaveBeenCalledWith([venda]);
  });

  test("precisa_confirmar: devolve a pergunta e não salva", async () => {
    const resultado: Resultado = {
      lancamentos: [],
      precisa_confirmar: true,
      pergunta: "Qual foi o valor de cada blusa?",
    };
    mInterpret.mockResolvedValue(resultado);

    const res = await post({ texto: "vendi umas blusas" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: "precisa_confirmar",
      pergunta: "Qual foi o valor de cada blusa?",
    });
    expect(mInserir).not.toHaveBeenCalled();
  });

  test.each([
    ["texto vazio", { texto: "   " }],
    ["sem texto", {}],
    ["texto não-string", { texto: 42 }],
    ["texto longo demais", { texto: "a".repeat(501) }],
    ["JSON inválido", "{oops"],
  ])("400: %s", async (_nome, body) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toEqual(expect.any(String));
    expect(mInterpret).not.toHaveBeenCalled();
  });

  test("502: interpretador lança erro", async () => {
    mInterpret.mockRejectedValue(new Error("timeout do LLM"));
    const res = await post({ texto: "vendi 1 blusa a 50" });
    expect(res.status).toBe(502);
    expect(mInserir).not.toHaveBeenCalled();
  });

  test("502: interpretador devolve resultado fora do schema", async () => {
    mInterpret.mockResolvedValue({ lancamentos: [{ tipo: "venda" }], precisa_confirmar: false } as never);
    const res = await post({ texto: "vendi 1 blusa a 50" });
    expect(res.status).toBe(502);
    expect(mInserir).not.toHaveBeenCalled();
  });

  test("501: interpret ainda é o TODO", async () => {
    mInterpret.mockRejectedValue(new Error("TODO: interpret não implementado"));
    const res = await post({ texto: "vendi 1 blusa a 50" });
    expect(res.status).toBe(501);
    expect((await res.json()).error).toMatch(/não foi implementado/);
  });

  test("500: falha ao salvar", async () => {
    mInterpret.mockResolvedValue({ lancamentos: [venda], precisa_confirmar: false });
    mInserir.mockRejectedValue(new RepositoryError("Falha ao salvar lançamentos: boom"));
    const res = await post({ texto: "vendi 3 blusas a 50 no pix" });
    expect(res.status).toBe(500);
  });
});

describe("POST /api/interpret: rate limit", () => {
  const pergunta: Resultado = { lancamentos: [], precisa_confirmar: true, pergunta: "Quanto?" };

  /** Envia `n` requisições do mesmo IP e devolve a última resposta. */
  async function enviarVarias(n: number, ip: string) {
    let res: Response | undefined;
    for (let i = 0; i < n; i++) res = await post({ texto: "vendi uma saia" }, ip);
    return res!;
  }

  beforeEach(() => {
    mInterpret.mockResolvedValue(pergunta);
    vi.useFakeTimers({ toFake: ["Date"] });
    // 24/11/2026 12:00 em Brasília
    vi.setSystemTime(new Date("2026-11-24T15:00:00Z"));
  });

  test("60 por IP a cada 10 min; a 61ª recebe 429 em português", async () => {
    expect((await enviarVarias(60, "198.51.100.7")).status).toBe(200);

    const res = await post({ texto: "vendi uma saia" }, "198.51.100.7");
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("600");
    expect((await res.json()).error).toBe(
      "Muitas mensagens seguidas. Espere alguns minutos e tente de novo.",
    );
    expect(mInterpret).toHaveBeenCalledTimes(60);
  });

  test("o limite é por IP: outro IP continua passando", async () => {
    await enviarVarias(61, "198.51.100.7");
    expect((await post({ texto: "vendi uma saia" }, "198.51.100.8")).status).toBe(200);
  });

  test("usa o primeiro IP do x-forwarded-for", async () => {
    await enviarVarias(60, "198.51.100.7, 10.0.0.1");
    expect((await post({ texto: "vendi uma saia" }, "198.51.100.7, 10.0.0.2")).status).toBe(429);
  });

  test("passados 10 min o IP volta a ser aceito", async () => {
    await enviarVarias(61, "198.51.100.7");
    vi.setSystemTime(new Date("2026-11-24T15:10:00Z"));
    expect((await post({ texto: "vendi uma saia" }, "198.51.100.7")).status).toBe(200);
  });

  test("teto global de 500 por dia, somando todos os IPs", async () => {
    for (let i = 0; i < 10; i++) {
      expect((await enviarVarias(50, `198.51.100.${i}`)).status).toBe(200);
    }

    const res = await post({ texto: "vendi uma saia" }, "192.0.2.99");
    expect(res.status).toBe(429);
    // 12:00 em Brasília: faltam 12 h para a meia-noite
    expect(res.headers.get("Retry-After")).toBe(String(12 * 3600));
    expect((await res.json()).error).toBe(
      "A MEIva chegou ao limite de mensagens de hoje. Tente de novo amanhã.",
    );
    expect(mInterpret).toHaveBeenCalledTimes(500);
  });

  test("o teto global zera à meia-noite de Brasília, não à de UTC", async () => {
    for (let i = 0; i < 10; i++) await enviarVarias(50, `198.51.100.${i}`);

    // 25/11 00:30 UTC ainda é 24/11 21:30 em Brasília: continua bloqueado
    vi.setSystemTime(new Date("2026-11-25T00:30:00Z"));
    expect((await post({ texto: "vendi uma saia" }, "192.0.2.99")).status).toBe(429);

    // 25/11 03:00 UTC = 00:00 em Brasília: novo dia
    vi.setSystemTime(new Date("2026-11-25T03:00:00Z"));
    expect((await post({ texto: "vendi uma saia" }, "192.0.2.99")).status).toBe(200);
  });

  test("requisição bloqueada não chega ao interpretador nem conta no teto", async () => {
    await enviarVarias(70, "198.51.100.7");
    expect(mInterpret).toHaveBeenCalledTimes(60);
  });
});
