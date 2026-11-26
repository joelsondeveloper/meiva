import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";

/**
 * Como um lançamento aparece na tela. Cada categoria tem ícone e rótulo
 * próprios (nunca só a cor):
 *  - entrada: venda à vista ou recebimento de fiado
 *  - saida: gasto
 *  - fiado: venda fiado (ainda não entrou no caixa; aparece com o selo "a receber")
 *  - aporte: caixa inicial / dinheiro do dono colocado no caixa
 *  - retirada: retirada pessoal do dono
 */
export type Categoria = "entrada" | "saida" | "fiado" | "aporte" | "retirada";

type ParaCategoria = Pick<LancamentoSalvo, "tipo" | "natureza" | "forma_pagamento">;

export function categoriaDo(l: ParaCategoria): Categoria {
  if (l.natureza === "aporte") return "aporte";
  if (l.natureza === "retirada_pessoal") return "retirada";
  if (l.natureza === "venda" && l.forma_pagamento === "fiado") return "fiado";
  return l.tipo === "saida" ? "saida" : "entrada";
}

/**
 * Sinal pelo sentido do dinheiro no caixa. Fiado não tem sinal: ainda não
 * entrou no caixa, e a tela mostra o selo "a receber" no lugar.
 */
export function sinalDo(l: ParaCategoria): "+" | "−" | "" {
  if (categoriaDo(l) === "fiado") return "";
  return l.tipo === "saida" ? "−" : "+";
}

const ROTULO: Record<LancamentoSalvo["natureza"], string> = {
  venda: "Venda",
  despesa: "Gasto",
  recebimento_fiado: "Recebimento",
  aporte: "Caixa inicial",
  retirada_pessoal: "Retirada pessoal",
};

/**
 * Linha de apoio em português simples, ex.: "Venda no Pix", "Fiado para Marta",
 * "Recebimento de Marta, no dinheiro", "Gasto a prazo".
 * Sem forma de pagamento, nada aparece no lugar.
 */
export function rotuloDoLancamento(l: ParaCategoria & Pick<LancamentoSalvo, "pessoa">): string {
  const pessoa = l.pessoa?.trim();
  if (categoriaDo(l) === "fiado") return pessoa ? `Fiado para ${pessoa}` : "Fiado";

  let base = ROTULO[l.natureza];
  if (l.natureza === "recebimento_fiado" && pessoa) base += ` de ${pessoa}`;

  if (!l.forma_pagamento) return base;
  const separador = l.natureza === "recebimento_fiado" && pessoa ? ", " : " ";
  return `${base}${separador}${COMO_PAGOU[l.forma_pagamento]}`;
}

const COMO_PAGOU: Record<NonNullable<LancamentoSalvo["forma_pagamento"]>, string> = {
  pix: "no Pix",
  dinheiro: "no dinheiro",
  cartao: "no cartão",
  fiado: "a prazo",
  outro: "por outra forma",
};
