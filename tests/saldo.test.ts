import { describe, expect, test } from "vitest";
import { calcularSaldo } from "@/lib/lancamentos/saldo";
import type { Lancamento } from "@/lib/interpreter/schema";

const l = (
  tipo: Lancamento["tipo"],
  valor_centavos: number,
  forma_pagamento: Lancamento["forma_pagamento"] = "pix",
) => ({ tipo, valor_centavos, forma_pagamento });

describe("calcularSaldo", () => {
  test("lista vazia zera tudo", () => {
    expect(calcularSaldo([])).toEqual({ entradas: 0, saidas: 0, saldo: 0, aReceber: 0 });
  });

  test("soma entradas e saídas", () => {
    const r = calcularSaldo([l("entrada", 15000), l("entrada", 4990, "dinheiro"), l("saida", 12000, null)]);
    expect(r).toEqual({ entradas: 19990, saidas: 12000, saldo: 7990, aReceber: 0 });
  });

  test("fiado fica fora do saldo e vai para aReceber", () => {
    const r = calcularSaldo([l("entrada", 10000, "pix"), l("entrada", 8000, "fiado"), l("entrada", 2000, "fiado")]);
    expect(r).toEqual({ entradas: 10000, saidas: 0, saldo: 10000, aReceber: 10000 });
  });

  test("só saídas deixa saldo negativo", () => {
    const r = calcularSaldo([l("saida", 3000), l("saida", 4500, "cartao")]);
    expect(r).toEqual({ entradas: 0, saidas: 7500, saldo: -7500, aReceber: 0 });
  });

  test("saída fiado não mexe no caixa nem em aReceber", () => {
    const r = calcularSaldo([l("saida", 5000, "fiado")]);
    expect(r).toEqual({ entradas: 0, saidas: 0, saldo: 0, aReceber: 0 });
  });
});
