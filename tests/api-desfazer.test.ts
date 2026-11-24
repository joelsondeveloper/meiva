import { beforeEach, describe, expect, test, vi } from "vitest";
import { RepositorioMemoria } from "@/lib/agente/repositorio-memoria";

// O Supabase é trocado pelo repositório em memória.
const estado = vi.hoisted(() => ({ repo: null as unknown as RepositorioMemoria }));
vi.mock("@/lib/lancamentos/repository", () => ({
  get repositorioSupabase() {
    return estado.repo;
  },
}));

const { rateLimitDesfazer } = await import("@/lib/rate-limit");
const { POST } = await import("@/app/api/lancamentos/[id]/desfazer/route");

const post = (id: string, ip = "1.2.3.4") =>
  POST(new Request(`http://localhost/api/lancamentos/${id}/desfazer`, { method: "POST", headers: { "x-forwarded-for": ip } }), {
    params: Promise.resolve({ id }),
  });

let id: string;

beforeEach(async () => {
  rateLimitDesfazer.limpar();
  estado.repo = new RepositorioMemoria();
  [{ id }] = await estado.repo.inserir([
    {
      tipo: "entrada",
      natureza: "venda",
      valor_centavos: 5000,
      descricao: "blusa",
      forma_pagamento: "pix",
      pessoa: null,
      data: "2026-03-10",
    },
  ]);
});

describe("POST /api/lancamentos/:id/desfazer", () => {
  test("200: anula e devolve o resumo; 404 na segunda vez", async () => {
    const res = await post(id);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lancamento).toMatchObject({ id, anulado_em: expect.any(String) });
    expect(body.resumo.saldoAcumulado).toBe(0);

    expect((await post(id)).status).toBe(404);
  });

  test("400: id inválido", async () => {
    expect((await post("nao-e-uuid")).status).toBe(400);
  });

  test("429 em português depois de 30 em 10 minutos, por IP", async () => {
    for (let i = 0; i < 30; i++) expect((await post("nao-e-uuid")).status).toBe(400);

    const bloqueada = await post(id);
    expect(bloqueada.status).toBe(429);
    expect(bloqueada.headers.get("retry-after")).toMatch(/^\d+$/);
    expect((await bloqueada.json()).error).toMatch(/^Muitas requisições em pouco tempo/);
    expect(estado.repo.todos()[0].anulado_em).toBeNull();

    expect((await post(id, "5.6.7.8")).status).toBe(200);
  });
});
