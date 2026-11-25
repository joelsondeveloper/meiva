import { describe, expect, test } from "vitest";
import { dataPorExtenso, inicioDoPeriodo, lerPeriodo, somarDias } from "@/lib/dados/periodo";
import { dadosDemo } from "@/lib/dados/repositorio";
import { calcularAReceber } from "@/lib/lancamentos/saldo";

describe("período do Resumo", () => {
  test("lerPeriodo aceita só os períodos conhecidos", () => {
    expect(lerPeriodo("semana")).toBe("semana");
    expect(lerPeriodo("mes")).toBe("mes");
    expect(lerPeriodo("ano")).toBe("hoje");
    expect(lerPeriodo(undefined)).toBe("hoje");
    expect(lerPeriodo(["mes"])).toBe("hoje");
  });

  test("somarDias atravessa mês e ano", () => {
    expect(somarDias("2026-03-01", -1)).toBe("2026-02-28");
    expect(somarDias("2026-12-31", 1)).toBe("2027-01-01");
  });

  test("início de cada período (inclusive)", () => {
    expect(inicioDoPeriodo("hoje", "2026-11-25")).toBe("2026-11-25");
    expect(inicioDoPeriodo("semana", "2026-11-25")).toBe("2026-11-19");
    expect(inicioDoPeriodo("mes", "2026-11-25")).toBe("2026-11-01");
  });

  test("data por extenso, sem depender do fuso", () => {
    expect(dataPorExtenso("2026-11-01")).toBe("1 de novembro");
  });
});

describe("dados de demonstração", () => {
  test("terminam hoje e têm fiados em aberto para as telas", () => {
    const dados = dadosDemo("2026-11-25");
    expect(dados.at(-1)?.data).toBe("2026-11-25");
    const { porPessoa } = calcularAReceber(dados);
    expect(porPessoa.map((p) => p.pessoa)).toEqual(["Marta", "João", "Dona Cida"]);
  });
});
