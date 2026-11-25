import { describe, expect, test } from "vitest";
import { calcularAReceber, calcularSaldo } from "@/lib/lancamentos/saldo";
import { TIPO_DA_NATUREZA, type Lancamento, type Natureza } from "@/lib/interpreter/schema";

const l = (
  natureza: Natureza,
  valor_centavos: number,
  forma_pagamento: Lancamento["forma_pagamento"] = "pix",
  extra: { pessoa?: string; anulado_em?: string } = {},
) => ({
  tipo: TIPO_DA_NATUREZA[natureza],
  natureza,
  valor_centavos,
  forma_pagamento,
  pessoa: extra.pessoa ?? null,
  anulado_em: extra.anulado_em ?? null,
});

const zerado = {
  entradas: 0,
  saidas: 0,
  saldo: 0,
  vendas: 0,
  vendasFiado: 0,
  recebimentosFiado: 0,
  aportes: 0,
  despesas: 0,
  retiradas: 0,
};

describe("calcularSaldo", () => {
  test("lista vazia zera tudo", () => {
    expect(calcularSaldo([])).toEqual(zerado);
  });

  test("soma vendas e despesas", () => {
    const r = calcularSaldo([l("venda", 15000), l("venda", 4990, "dinheiro"), l("despesa", 12000, null)]);
    expect(r).toEqual({ ...zerado, entradas: 19990, saidas: 12000, saldo: 7990, vendas: 19990, despesas: 12000 });
  });

  test("venda fiado fica fora do saldo", () => {
    const r = calcularSaldo([l("venda", 10000), l("venda", 8000, "fiado", { pessoa: "Ana" })]);
    expect(r).toEqual({ ...zerado, entradas: 10000, saldo: 10000, vendas: 10000, vendasFiado: 8000 });
  });

  test("aporte entra no saldo mas não é venda", () => {
    const r = calcularSaldo([l("aporte", 50000, "dinheiro"), l("venda", 1000)]);
    expect(r.saldo).toBe(51000);
    expect(r.vendas).toBe(1000);
    expect(r.aportes).toBe(50000);
  });

  test("recebimento de fiado entra no saldo, não como venda", () => {
    const r = calcularSaldo([l("recebimento_fiado", 3000, "pix", { pessoa: "Ana" })]);
    expect(r).toEqual({ ...zerado, entradas: 3000, saldo: 3000, recebimentosFiado: 3000 });
  });

  test("retirada pessoal sai do saldo", () => {
    const r = calcularSaldo([l("venda", 10000), l("retirada_pessoal", 4000, "dinheiro")]);
    expect(r).toMatchObject({ saldo: 6000, saidas: 4000, retiradas: 4000 });
  });

  test("despesa fiado (compra a prazo) não mexe no caixa", () => {
    expect(calcularSaldo([l("despesa", 5000, "fiado")])).toEqual(zerado);
  });

  test("anulados não contam", () => {
    const r = calcularSaldo([l("venda", 10000), l("venda", 999, "pix", { anulado_em: "2026-03-10T12:00:00Z" })]);
    expect(r.saldo).toBe(10000);
  });
});

describe("calcularAReceber", () => {
  test("fiados menos recebimentos, agrupando nomes parecidos", () => {
    const r = calcularAReceber([
      l("venda", 12000, "fiado", { pessoa: "Dona Maria" }),
      l("venda", 3000, "fiado", { pessoa: "joão" }),
      l("recebimento_fiado", 5000, "pix", { pessoa: "maria" }),
    ]);
    expect(r).toEqual({
      total: 10000,
      porPessoa: [
        { pessoa: "maria", valor_centavos: 7000 },
        { pessoa: "joão", valor_centavos: 3000 },
      ],
    });
  });

  test("quem quitou some da lista; anulados não contam; venda à vista não conta", () => {
    const r = calcularAReceber([
      l("venda", 5000, "fiado", { pessoa: "Ana" }),
      l("recebimento_fiado", 5000, "dinheiro", { pessoa: "Ana" }),
      l("venda", 2000, "fiado", { pessoa: "Bia", anulado_em: "2026-03-10T12:00:00Z" }),
      l("venda", 9000, "pix", { pessoa: "Caio" }),
    ]);
    expect(r).toEqual({ total: 0, porPessoa: [] });
  });
});
