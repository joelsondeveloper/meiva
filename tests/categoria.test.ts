import { describe, expect, test } from "vitest";
import { categoriaDo, rotuloDoLancamento, sinalDo } from "@/lib/chat/categoria";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";

type L = Pick<LancamentoSalvo, "tipo" | "natureza" | "forma_pagamento" | "pessoa">;
const l = (natureza: L["natureza"], tipo: L["tipo"], forma: L["forma_pagamento"], pessoa: string | null = null): L => ({
  natureza,
  tipo,
  forma_pagamento: forma,
  pessoa,
});

describe("categoriaDo e sinalDo", () => {
  test.each([
    [l("venda", "entrada", "pix"), "entrada", "+"],
    [l("recebimento_fiado", "entrada", "dinheiro", "Marta"), "entrada", "+"],
    [l("despesa", "saida", "pix"), "saida", "−"],
    [l("despesa", "saida", "fiado"), "saida", "−"],
    [l("venda", "entrada", "fiado", "Marta"), "fiado", "+"],
    [l("aporte", "entrada", "dinheiro"), "aporte", "+"],
    [l("retirada_pessoal", "saida", "pix"), "retirada", "−"],
  ] as const)("%o → %s %s", (lancamento, categoria, sinal) => {
    expect(categoriaDo(lancamento)).toBe(categoria);
    expect(sinalDo(lancamento)).toBe(sinal);
  });
});

describe("rotuloDoLancamento", () => {
  test("natureza e forma", () => {
    expect(rotuloDoLancamento(l("venda", "entrada", "pix"))).toBe("Venda · Pix");
    expect(rotuloDoLancamento(l("aporte", "entrada", "dinheiro"))).toBe("Caixa inicial · Dinheiro");
  });

  test("sem forma de pagamento não mostra nada no lugar", () => {
    const rotulo = rotuloDoLancamento(l("retirada_pessoal", "saida", null));
    expect(rotulo).toBe("Retirada pessoal");
    expect(rotulo).not.toMatch(/informad/i);
  });

  test("fiado mostra a pessoa e que é a receber", () => {
    expect(rotuloDoLancamento(l("venda", "entrada", "fiado", "Marta"))).toBe("Fiado (a receber) · Marta");
    expect(rotuloDoLancamento(l("recebimento_fiado", "entrada", "pix", "Marta"))).toBe(
      "Recebeu fiado · Pix · Marta",
    );
  });
});
