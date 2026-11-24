import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Mensagem } from "@/lib/chat/conversa";

/** sessionStorage falso em memória. */
function storageFalso(inicial: Record<string, string> = {}) {
  const dados = new Map(Object.entries(inicial));
  return {
    dados,
    getItem: vi.fn((k: string) => dados.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => void dados.set(k, v)),
    removeItem: vi.fn((k: string) => void dados.delete(k)),
  };
}

/** Cada teste importa o módulo do zero (o cache é estado do módulo). */
async function carregarModulo(storage: unknown) {
  vi.stubGlobal("window", { sessionStorage: storage });
  vi.resetModules();
  return import("@/lib/chat/conversa");
}

const usuario = (i: number): Mensagem => ({ id: `u${i}`, autor: "usuario", texto: `frase ${i}` });
const registrado: Mensagem = {
  id: "r1",
  autor: "meiva",
  tipo: "registrado",
  desfeito: false,
  lancamentos: [
    {
      id: "6f1c1d2e-3b4a-4c5d-8e9f-0a1b2c3d4e5f",
      tipo: "entrada",
      valor_centavos: 15000,
      descricao: "3 blusas",
      forma_pagamento: "pix",
      data: "2026-11-24",
      created_at: "2026-11-24T13:00:00Z",
    },
  ],
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("conversa no sessionStorage", () => {
  test("recarregar a página recupera a conversa salva", async () => {
    const storage = storageFalso();
    const a = await carregarModulo(storage);
    a.adicionarMensagem(usuario(1));
    a.adicionarMensagem(registrado);

    const b = await carregarModulo(storageFalso(Object.fromEntries(storage.dados)));
    expect(b.lerConversa()).toEqual([usuario(1), registrado]);
  });

  test("guarda só as últimas 10 mensagens", async () => {
    const storage = storageFalso();
    const c = await carregarModulo(storage);
    for (let i = 1; i <= 13; i++) c.adicionarMensagem(usuario(i));

    expect(c.lerConversa().map((m) => m.id)).toEqual(
      Array.from({ length: 10 }, (_, i) => `u${i + 4}`),
    );
    const salvo = JSON.parse(storage.dados.get(c.CHAVE_STORAGE)!);
    expect(salvo).toHaveLength(10);
  });

  test("mensagens de erro não são guardadas", async () => {
    const storage = storageFalso();
    const c = await carregarModulo(storage);
    c.adicionarMensagem(usuario(1));
    c.adicionarMensagem({ id: "e1", autor: "meiva", tipo: "erro", texto: "Sem internet." });

    expect(c.lerConversa()).toHaveLength(2);
    expect(JSON.parse(storage.dados.get(c.CHAVE_STORAGE)!)).toEqual([usuario(1)]);
  });

  test("Nova conversa limpa a tela e o storage", async () => {
    const storage = storageFalso();
    const c = await carregarModulo(storage);
    const ouvinte = vi.fn();
    c.assinarConversa(ouvinte);
    c.adicionarMensagem(usuario(1));
    c.limparConversa();

    expect(c.lerConversa()).toEqual([]);
    expect(storage.dados.has(c.CHAVE_STORAGE)).toBe(false);
    expect(ouvinte).toHaveBeenCalledTimes(2);
  });

  test("snapshot estável: mesma referência enquanto nada muda", async () => {
    const c = await carregarModulo(storageFalso());
    expect(c.lerConversa()).toBe(c.lerConversa());
    expect(c.conversaNoServidor()).toEqual([]);
  });

  test("storage bloqueado (getItem/setItem lançam) não quebra: fica em memória", async () => {
    const quebrado = {
      getItem: () => {
        throw new DOMException("bloqueado", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("cheio", "QuotaExceededError");
      },
      removeItem: () => {
        throw new DOMException("bloqueado", "SecurityError");
      },
    };
    const c = await carregarModulo(quebrado);
    expect(c.lerConversa()).toEqual([]);
    c.adicionarMensagem(usuario(1));
    expect(c.lerConversa()).toEqual([usuario(1)]);
    expect(() => c.limparConversa()).not.toThrow();
  });

  test("conteúdo corrompido no storage é ignorado", async () => {
    const c = await carregarModulo(storageFalso({ "meiva:conversa:v1": "{não é json" }));
    expect(c.lerConversa()).toEqual([]);
  });
});

describe("validarConversa", () => {
  test("descarta itens fora do formato e mantém os válidos", async () => {
    const { validarConversa } = await carregarModulo(storageFalso());
    const lancamentoRuim = {
      ...registrado,
      id: "r2",
      lancamentos: [{ ...(registrado as { lancamentos: object[] }).lancamentos[0], valor_centavos: 49.9 }],
    };
    expect(
      validarConversa([usuario(1), { id: "x", autor: "hacker" }, lancamentoRuim, registrado, 42]),
    ).toEqual([usuario(1), registrado]);
    expect(validarConversa({ nao: "array" })).toEqual([]);
  });
});
