import type { Lancamento } from "@/lib/interpreter/schema";
import { normalizarPessoa } from "./pessoa";

/** Resumo do caixa num período. Todos os valores em centavos. */
export type Resumo = {
  /** Dinheiro que entrou no caixa (vendas à vista + recebimentos de fiado + aportes). */
  entradas: number;
  /** Dinheiro que saiu do caixa (despesas pagas + retiradas pessoais). */
  saidas: number;
  /** entradas - saidas (pode ser negativo). */
  saldo: number;
  /** Vendas à vista (entraram no caixa). */
  vendas: number;
  /** Vendas fiado (vendidas no período, mas ainda não entraram no caixa). */
  vendasFiado: number;
  /** Recebimentos de fiado (entram no caixa no dia do recebimento). */
  recebimentosFiado: number;
  /** Dinheiro do dono colocado no caixa: entra no saldo, mas NÃO é venda. */
  aportes: number;
  despesas: number;
  retiradas: number;
};

export type DevedorResumo = { pessoa: string; valor_centavos: number };

export type AReceber = { total: number; porPessoa: DevedorResumo[] };

/** Resumo completo mostrado na tela e devolvido pela API. */
export type ResumoCaixa = {
  data: string;
  dia: Resumo;
  /** Saldo de todos os lançamentos até a data (inclusive). */
  saldoAcumulado: number;
  /** Global, não por dia. */
  aReceber: AReceber;
};

type LancamentoParaSaldo = Pick<Lancamento, "tipo" | "natureza" | "valor_centavos" | "forma_pagamento"> & {
  anulado_em?: string | null;
};

type LancamentoParaAReceber = Pick<Lancamento, "natureza" | "valor_centavos" | "forma_pagamento" | "pessoa"> & {
  anulado_em?: string | null;
};

/**
 * Calcula o resumo do caixa.
 *
 * Regras:
 *  - anulados (desfeitos) não contam;
 *  - forma_pagamento "fiado" não movimenta o caixa: venda fiado soma em
 *    vendasFiado (e no "a receber"); despesa fiado (compra a prazo) fica fora;
 *  - aporte entra no saldo, mas não é venda;
 *  - recebimento de fiado entra no saldo no dia do recebimento.
 */
export function calcularSaldo(lancamentos: readonly LancamentoParaSaldo[]): Resumo {
  const r: Resumo = {
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

  for (const l of lancamentos) {
    if (l.anulado_em) continue;
    const v = l.valor_centavos;
    if (l.forma_pagamento === "fiado") {
      if (l.natureza === "venda") r.vendasFiado += v;
      continue;
    }
    if (l.tipo === "entrada") r.entradas += v;
    else r.saidas += v;

    if (l.natureza === "venda") r.vendas += v;
    else if (l.natureza === "recebimento_fiado") r.recebimentosFiado += v;
    else if (l.natureza === "aporte") r.aportes += v;
    else if (l.natureza === "despesa") r.despesas += v;
    else r.retiradas += v;
  }

  r.saldo = r.entradas - r.saidas;
  return r;
}

/**
 * "A receber" por pessoa: vendas fiado da pessoa menos recebimentos dela.
 * Nomes são agrupados pelo nome normalizado; o nome exibido é o mais recente.
 * Só aparece quem ainda deve (> 0). Fiado sem pessoa vira "Sem nome".
 */
export function calcularAReceber(lancamentos: readonly LancamentoParaAReceber[]): AReceber {
  const porChave = new Map<string, DevedorResumo>();

  for (const l of lancamentos) {
    if (l.anulado_em) continue;
    let sinal = 0;
    if (l.natureza === "venda" && l.forma_pagamento === "fiado") sinal = 1;
    else if (l.natureza === "recebimento_fiado") sinal = -1;
    if (sinal === 0) continue;

    const nome = l.pessoa?.trim() || "Sem nome";
    const chave = normalizarPessoa(nome);
    const atual = porChave.get(chave) ?? { pessoa: nome, valor_centavos: 0 };
    atual.pessoa = nome;
    atual.valor_centavos += sinal * l.valor_centavos;
    porChave.set(chave, atual);
  }

  const porPessoa = [...porChave.values()]
    .filter((d) => d.valor_centavos > 0)
    .sort((a, b) => b.valor_centavos - a.valor_centavos);
  return { total: porPessoa.reduce((s, d) => s + d.valor_centavos, 0), porPessoa };
}
