import { describe, expect, test } from "vitest";
import { formatarCentavos, rotuloForma, rotuloTipo } from "@/lib/formatacao";

// O Intl usa espaço não separável (U+00A0) entre "R$" e o número.
const normaliza = (s: string) => s.replace(/\s/g, " ");

describe("formatarCentavos", () => {
  test.each([
    [4990, "R$ 49,90"],
    [15000, "R$ 150,00"],
    [0, "R$ 0,00"],
    [5, "R$ 0,05"],
    [123456789, "R$ 1.234.567,89"],
    [-7500, "-R$ 75,00"],
  ])("%i -> %s", (centavos, esperado) => {
    expect(normaliza(formatarCentavos(centavos))).toBe(esperado);
  });

  test("rejeita valor não inteiro", () => {
    expect(() => formatarCentavos(49.9)).toThrow(TypeError);
  });
});

describe("rótulos", () => {
  test("tipo e forma em português", () => {
    expect(rotuloTipo("saida")).toBe("Saída");
    expect(rotuloForma("cartao")).toBe("Cartão");
    expect(rotuloForma(null)).toBe("Não informada");
  });
});
