import { afterEach, describe, expect, test, vi } from "vitest";
import {
  ERRO_SEM_CONEXAO,
  ErroApi,
  chamarApi,
  mensagemDeErro,
  textoDoErro,
} from "@/lib/chat/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mensagemDeErro", () => {
  test("usa a mensagem do servidor quando é curta", () => {
    expect(mensagemDeErro(429, { error: "Muitas mensagens seguidas." })).toBe(
      "Muitas mensagens seguidas.",
    );
  });

  test("ignora mensagem do servidor longa demais", () => {
    expect(mensagemDeErro(500, { error: "x".repeat(200) })).toBe(
      "Algo deu errado do nosso lado. Tente de novo.",
    );
  });

  test.each([
    [429, "Muitas mensagens seguidas. Espere um pouco e tente de novo."],
    [504, "A resposta demorou demais. Tente de novo."],
    [502, "Algo deu errado do nosso lado. Tente de novo."],
    [404, "Não deu certo. Tente de novo."],
  ])("sem corpo JSON, status %i vira frase padrão", (status, esperado) => {
    expect(mensagemDeErro(status, null)).toBe(esperado);
  });

  test("501 não mostra detalhe técnico", () => {
    expect(mensagemDeErro(501, { error: "O interpretador ... (src/lib/...)" })).not.toMatch(/src/);
  });
});

describe("chamarApi", () => {
  test("falha de rede vira mensagem em português", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(chamarApi("/api/x")).rejects.toThrow(ERRO_SEM_CONEXAO);
  });

  test("resposta HTML (sem JSON) vira frase padrão pelo status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>", { status: 504 })));
    await expect(chamarApi("/api/x")).rejects.toMatchObject({
      name: "ErroApi",
      status: 504,
      message: "A resposta demorou demais. Tente de novo.",
    });
  });

  test("devolve o JSON quando dá certo", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ok: 1 })));
    await expect(chamarApi("/api/x")).resolves.toEqual({ ok: 1 });
  });
});

describe("textoDoErro", () => {
  test("erro inesperado não vaza mensagem técnica", () => {
    expect(textoDoErro(new ErroApi("Sem internet.", 0))).toBe("Sem internet.");
    expect(textoDoErro(new Error("Cannot read properties of undefined"))).toBe(
      "Algo deu errado. Tente de novo.",
    );
  });
});
