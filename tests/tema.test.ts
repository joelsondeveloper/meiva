import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Guarda dos design tokens (src/app/globals.css).
 * Quando a paleta da marca for trocada, estes testes conferem se ela ainda
 * tem contraste suficiente e se nenhum componente voltou a ter cor fixa.
 */

const RAIZ = join(__dirname, "..");
const css = readFileSync(join(RAIZ, "src/app/globals.css"), "utf8");

function tokensDe(bloco: string): Record<string, string> {
  return Object.fromEntries(
    [...bloco.matchAll(/--cor-([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2].toLowerCase()]),
  );
}

const blocoClaro = css.match(/^:root\s*\{([^}]*)\}/m)?.[1] ?? "";
const blocoEscuro =
  css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]*)\}/)?.[1] ?? "";

const TEMAS = { claro: tokensDe(blocoClaro), escuro: tokensDe(blocoEscuro) };

/** Razão de contraste WCAG 2.x entre duas cores #rrggbb. */
function contraste(a: string, b: string): number {
  const luminancia = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

const TOKENS = [
  "fundo", "superficie", "texto", "texto-suave", "borda", "borda-forte",
  "primaria", "primaria-forte", "sobre-primaria", "foco",
  "entrada", "entrada-suave", "saida", "saida-suave",
  "aviso", "aviso-suave", "erro", "erro-suave",
];

/** [frente, fundo] de texto que aparece na tela: precisa de 4.5:1. */
const PARES_TEXTO: [string, string][] = [
  ...["fundo", "superficie"].flatMap((f): [string, string][] =>
    ["texto", "texto-suave", "entrada", "saida", "aviso", "erro"].map((t) => [t, f]),
  ),
  ["sobre-primaria", "primaria"],
  ["sobre-primaria", "primaria-forte"],
  ...["entrada", "saida", "aviso", "erro"].flatMap((s): [string, string][] => [
    [s, `${s}-suave`],
    ["texto", `${s}-suave`],
    ["texto-suave", `${s}-suave`],
  ]),
];

/** Elementos que não são texto (contorno de campo, anel de foco): 3:1. */
const PARES_NAO_TEXTO: [string, string][] = [
  ["borda-forte", "fundo"],
  ["borda-forte", "superficie"],
  ["foco", "fundo"],
  ["foco", "superficie"],
];

describe.each(Object.entries(TEMAS))("tokens do tema %s", (_tema, cores) => {
  test("todos os tokens estão definidos", () => {
    expect(Object.keys(cores).sort()).toEqual([...TOKENS].sort());
  });

  test.each(PARES_TEXTO)("texto %s sobre %s tem contraste ≥ 4.5:1", (frente, fundo) => {
    expect(contraste(cores[frente], cores[fundo])).toBeGreaterThanOrEqual(4.5);
  });

  test.each(PARES_NAO_TEXTO)("%s sobre %s tem contraste ≥ 3:1", (frente, fundo) => {
    expect(contraste(cores[frente], cores[fundo])).toBeGreaterThanOrEqual(3);
  });
});

function arquivosTsx(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const caminho = join(dir, e.name);
    if (e.isDirectory()) return arquivosTsx(caminho);
    return /\.tsx?$/.test(e.name) ? [caminho] : [];
  });
}

const PALETA_TAILWIND =
  /\b(?:bg|text|border|ring|outline|divide|fill|stroke|from|via|to|shadow|accent|caret|decoration|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)\b/;
const COR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch)\(/;

/** Texto abaixo de 16px ou entrelinha abaixo de 1.4. */
const TEXTO_PEQUENO =
  /\btext-(?:xs|sm)\b|\btext-\[(?:\d|1[0-5])(?:\.\d+)?px\]|\bleading-(?:none|tight|snug|[1-5])\b/;

describe("acessibilidade: texto de no mínimo 16px e entrelinha ≥ 1.4", () => {
  const arquivos = arquivosTsx(join(RAIZ, "src"));

  test.each(arquivos.map((a) => [a.slice(RAIZ.length + 1), a]))("%s", (_nome, caminho) => {
    const ofensas = readFileSync(caminho, "utf8")
      .split("\n")
      .map((linha, i) => ({ linha: i + 1, texto: linha.trim() }))
      .filter(({ texto }) => TEXTO_PEQUENO.test(texto));
    expect(ofensas).toEqual([]);
  });

  test("o tema desliga text-xs/text-sm e sobe a entrelinha dos títulos", () => {
    expect(css).toMatch(/--text-xs:\s*initial;/);
    expect(css).toMatch(/--text-sm:\s*initial;/);
    expect(css).toMatch(/--text-2xl--line-height:\s*1\.4;/);
  });
});

describe("componentes sem cor fixa", () => {
  const arquivos = arquivosTsx(join(RAIZ, "src"));

  test.each(arquivos.map((a) => [a.slice(RAIZ.length + 1), a]))("%s", (_nome, caminho) => {
    const linhas = readFileSync(caminho, "utf8").split("\n");
    const ofensas = linhas
      .map((linha, i) => ({ linha: i + 1, texto: linha.trim() }))
      .filter(({ texto }) => PALETA_TAILWIND.test(texto) || COR_LITERAL.test(texto));
    expect(ofensas).toEqual([]);
  });
});
