import { describe, expect, test } from "vitest";
import { LancamentoSchema, ResultadoSchema } from "@/lib/interpreter/schema";
import { frases } from "./fixtures/frases";

describe("interpret", () => {
  // TODO: trocar cada test.todo por um teste real quando interpret() existir.
  for (const { frase } of frases) {
    test.todo(`interpreta: "${frase}"`);
  }
});

describe("schemas Zod", () => {
  test("aceita um resultado válido", () => {
    const bom = {
      lancamentos: [
        { tipo: "entrada", valor_centavos: 15000, descricao: "3 blusas", forma_pagamento: "pix", data: "2026-03-10" },
      ],
      precisa_confirmar: false,
    };
    expect(ResultadoSchema.safeParse(bom).success).toBe(true);
  });

  test("rejeita um lançamento inválido", () => {
    const ruim = {
      tipo: "venda", // não é "entrada" nem "saida"
      valor_centavos: 49.9, // não é inteiro
      descricao: "blusa",
      forma_pagamento: "boleto", // fora do enum
      data: "10/03/2026", // não é ISO
    };
    const result = LancamentoSchema.safeParse(ruim);
    expect(result.success).toBe(false);
    const campos = result.error?.issues.map((i) => i.path[0]);
    expect(campos).toEqual(
      expect.arrayContaining(["tipo", "valor_centavos", "forma_pagamento", "data"]),
    );
  });

  test("todas as fixtures seguem o schema", () => {
    for (const { esperado } of frases) {
      expect(ResultadoSchema.safeParse(esperado).success).toBe(true);
    }
  });
});
