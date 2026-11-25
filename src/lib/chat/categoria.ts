import { rotuloForma } from "@/lib/formatacao";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";

/**
 * Como um lançamento aparece na tela. Cada categoria tem sinal, ícone e
 * rótulo próprios (nunca só a cor):
 *  - entrada: venda à vista ou recebimento de fiado
 *  - saida: despesa
 *  - fiado: venda fiado (ainda não entrou no caixa)
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

/** Sinal pelo sentido do dinheiro (o fiado é + porque é a receber). */
export const sinalDo = (l: Pick<LancamentoSalvo, "tipo">): "+" | "−" => (l.tipo === "saida" ? "−" : "+");

const ROTULO_NATUREZA: Record<LancamentoSalvo["natureza"], string> = {
  venda: "Venda",
  despesa: "Despesa",
  recebimento_fiado: "Recebeu fiado",
  aporte: "Caixa inicial",
  retirada_pessoal: "Retirada pessoal",
};

/**
 * Linha de apoio: natureza, forma e pessoa, separadas por " · ".
 * Sem forma de pagamento, nada aparece no lugar.
 */
export function rotuloDoLancamento(l: ParaCategoria & Pick<LancamentoSalvo, "pessoa">): string {
  const partes =
    categoriaDo(l) === "fiado"
      ? ["Fiado (a receber)"]
      : [ROTULO_NATUREZA[l.natureza], l.forma_pagamento ? rotuloForma(l.forma_pagamento) : null];
  if (l.pessoa) partes.push(l.pessoa);
  return partes.filter(Boolean).join(" · ");
}
