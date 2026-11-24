import { beforeEach, describe, expect, test, vi } from "vitest";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";

vi.mock("@/lib/lancamentos/repository", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/lancamentos/repository")>()),
  excluirLancamentos: vi.fn(),
  listarPorData: vi.fn(),
}));

const { excluirLancamentos, listarPorData, RepositoryError } = await import(
  "@/lib/lancamentos/repository"
);
const { DELETE, GET } = await import("@/app/api/lancamentos/route");

const mExcluir = vi.mocked(excluirLancamentos);
const mListar = vi.mocked(listarPorData);

const ID_A = "6f1c1d2e-3b4a-4c5d-8e9f-0a1b2c3d4e5f";
const ID_B = "7a2b3c4d-5e6f-4a1b-9c2d-3e4f5a6b7c8d";

const del = (body: unknown) =>
  DELETE(
    new Request("http://localhost/api/lancamentos", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const saida: LancamentoSalvo = {
  id: ID_B,
  tipo: "saida",
  valor_centavos: 12000,
  descricao: "fornecedor",
  forma_pagamento: "pix",
  data: "2026-11-24",
  created_at: "2026-11-24T13:00:00Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("DELETE /api/lancamentos (Desfazer)", () => {
  test("apaga os ids e devolve o resumo de hoje", async () => {
    mExcluir.mockResolvedValue(1);
    mListar.mockResolvedValue([saida]);

    const res = await del({ ids: [ID_A] });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      removidos: 1,
      resumo: { entradas: 0, saidas: 12000, saldo: -12000, aReceber: 0 },
    });
    expect(mExcluir).toHaveBeenCalledWith([ID_A]);
  });

  test("já desfeito: 200 com removidos 0", async () => {
    mExcluir.mockResolvedValue(0);
    mListar.mockResolvedValue([]);
    const res = await del({ ids: [ID_A, ID_B] });
    expect(res.status).toBe(200);
    expect((await res.json()).removidos).toBe(0);
  });

  test.each([
    ["sem ids", {}],
    ["lista vazia", { ids: [] }],
    ["id que não é uuid", { ids: ["1; drop table"] }],
    ["mais de 20", { ids: Array.from({ length: 21 }, () => ID_A) }],
    ["JSON inválido", "{oops"],
  ])("400: %s", async (_nome, body) => {
    const res = await del(body);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toEqual(expect.any(String));
    expect(mExcluir).not.toHaveBeenCalled();
  });

  test("500: falha no banco, com mensagem curta em português", async () => {
    mExcluir.mockRejectedValue(new RepositoryError("boom"));
    const res = await del({ ids: [ID_A] });
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Não consegui desfazer. Tente de novo.");
  });
});

describe("GET /api/lancamentos", () => {
  test("400: data inválida", async () => {
    const res = await GET(new Request("http://localhost/api/lancamentos?data=24/11/2026"));
    expect(res.status).toBe(400);
  });

  test("200: lista e resumo da data pedida", async () => {
    mListar.mockResolvedValue([saida]);
    const res = await GET(new Request("http://localhost/api/lancamentos?data=2026-11-24"));
    expect(res.status).toBe(200);
    expect(mListar).toHaveBeenCalledWith("2026-11-24");
    expect((await res.json()).lancamentos).toEqual([saida]);
  });
});
