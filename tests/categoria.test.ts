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
    [l("aporte", "entrada", "dinheiro"), "aporte", "+"],
    [l("retirada_pessoal", "saida", "pix"), "retirada", "−"],
  ] as const)("%o → %s %s", (lancamento, categoria, sinal) => {
    expect(categoriaDo(lancamento)).toBe(categoria);
    expect(sinalDo(lancamento)).toBe(sinal);
  });

  test("fiado não tem sinal: ainda não entrou no caixa", () => {
    const fiado = l("venda", "entrada", "fiado", "Marta");
    expect(categoriaDo(fiado)).toBe("fiado");
    expect(sinalDo(fiado)).toBe("");
  });
});

describe("rotuloDoLancamento", () => {
  test.each([
    [l("venda", "entrada", "pix"), "Venda no Pix"],
    [l("despesa", "saida", "dinheiro"), "Gasto no dinheiro"],
    [l("despesa", "saida", "fiado"), "Gasto a prazo"],
    [l("aporte", "entrada", "dinheiro"), "Caixa inicial no dinheiro"],
    [l("venda", "entrada", "cartao"), "Venda no cartão"],
    [l("venda", "entrada", "outro"), "Venda por outra forma"],
  ] as const)("%o → %s", (lancamento, rotulo) => {
    expect(rotuloDoLancamento(lancamento)).toBe(rotulo);
  });

  test("sem forma de pagamento não mostra nada no lugar", () => {
    const rotulo = rotuloDoLancamento(l("retirada_pessoal", "saida", null));
    expect(rotulo).toBe("Retirada pessoal");
    expect(rotulo).not.toMatch(/informad/i);
  });

  test("fiado e recebimento citam a pessoa", () => {
    expect(rotuloDoLancamento(l("venda", "entrada", "fiado", "Marta"))).toBe("Fiado para Marta");
    expect(rotuloDoLancamento(l("venda", "entrada", "fiado"))).toBe("Fiado");
    expect(rotuloDoLancamento(l("recebimento_fiado", "entrada", "pix", "Marta"))).toBe(
      "Recebimento de Marta, no Pix",
    );
  });
});
