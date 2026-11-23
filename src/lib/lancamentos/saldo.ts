import type { Lancamento } from "@/lib/interpreter/schema";

/** Resumo do caixa. Todos os valores em centavos. */
export type Resumo = {
  entradas: number;
  saidas: number;
  /** entradas - saidas (pode ser negativo). */
  saldo: number;
  /** Vendas fiado: ainda não entraram no caixa. */
  aReceber: number;
};

type LancamentoParaSaldo = Pick<Lancamento, "tipo" | "valor_centavos" | "forma_pagamento">;

/**
 * Calcula o resumo do caixa.
 *
 * Regra: lançamento com forma_pagamento "fiado" não movimenta o caixa, então
 * não entra em entradas/saídas/saldo. Entradas fiado somam em `aReceber`.
 * Saídas fiado (compra a prazo) também ficam fora do caixa e não são "a receber".
 */
export function calcularSaldo(lancamentos: readonly LancamentoParaSaldo[]): Resumo {
  let entradas = 0;
  let saidas = 0;
  let aReceber = 0;

  for (const l of lancamentos) {
    if (l.forma_pagamento === "fiado") {
      if (l.tipo === "entrada") aReceber += l.valor_centavos;
      continue;
    }
    if (l.tipo === "entrada") entradas += l.valor_centavos;
    else saidas += l.valor_centavos;
  }

  return { entradas, saidas, saldo: entradas - saidas, aReceber };
}
