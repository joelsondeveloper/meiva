import { describe, expect, test } from "vitest";
import { normalizarPessoa, pessoaCasa } from "@/lib/lancamentos/pessoa";

describe("normalizarPessoa", () => {
  test.each([
    ["Dona Maria", "maria"],
    ["  SEU   João ", "joao"],
    ["Sra. Conceição", "conceicao"],
    ["sr josé da silva", "jose da silva"],
    ["Seu", "seu"],
  ])("%s -> %s", (entrada, saida) => {
    expect(normalizarPessoa(entrada)).toBe(saida);
  });
});

describe("pessoaCasa", () => {
  const casa = (q: string, n: string) => pessoaCasa(normalizarPessoa(q), normalizarPessoa(n));

  test("primeiro nome casa com nome completo", () => expect(casa("maria", "Maria Silva")).toBe(true));
  test("prefixo de 3+ letras casa", () => expect(casa("fer", "Fernanda")).toBe(true));
  test("uma letra errada casa", () => expect(casa("joana", "Joanna")).toBe(true));
  test("sobrenome diferente não casa", () => expect(casa("maria silva", "Maria Souza")).toBe(false));
  test("nome diferente não casa", () => expect(casa("ana", "Bia")).toBe(false));
});
