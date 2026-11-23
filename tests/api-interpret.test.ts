import { beforeEach, describe, expect, test, vi } from "vitest";
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

const mInterpret = vi.mocked(interpret);
const mInserir = vi.mocked(inserirLancamentos);
const mListar = vi.mocked(listarPorData);

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/interpret", {
      method: "POST",
      headers: { "content-type": "application/json" },
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
