import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { TextoComNumeros } from "@/components/texto-com-numeros";

const html = (texto: string) => renderToStaticMarkup(createElement(TextoComNumeros, null, texto));

describe("TextoComNumeros", () => {
  test("põe só os números na fonte dos valores (Lexend)", () => {
    expect(html("Vendi 50 reais de pudim")).toBe('Vendi <span class="numero">50</span> reais de pudim');
    expect(html("Paguei 30 de luz")).toBe('Paguei <span class="numero">30</span> de luz');
  });

  test("mantém vírgula, ponto e dois-pontos dentro do mesmo número", () => {
    expect(html("12,50 e 1.200 às 9:30")).toBe(
      '<span class="numero">12,50</span> e <span class="numero">1.200</span> às <span class="numero">9:30</span>',
    );
  });

  test("frase sem número fica igual", () => {
    expect(html("Fulano me pagou")).toBe("Fulano me pagou");
  });
});
