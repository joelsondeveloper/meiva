import type { FormaPagamento, Lancamento } from "@/lib/interpreter/schema";
import type { ResumoCaixa } from "./saldo";

/** Lançamento como está gravado no banco. */
export type LancamentoSalvo = Lancamento & {
  id: string;
  created_at: string;
  /** Preenchido quando o lançamento foi desfeito (soft delete). */
  anulado_em: string | null;
};

/** Campos que o "corrigir" pode alterar. */
export type CamposCorrecao = Partial<{
  valor_centavos: number;
  descricao: string;
  forma_pagamento: FormaPagamento;
  data: string;
  pessoa: string | null;
}>;

export type FiltroLancamentos = {
  /** Data inicial (inclusive), YYYY-MM-DD. */
  de?: string;
  /** Data final (inclusive), YYYY-MM-DD. */
  ate?: string;
};

/**
 * Acesso aos lançamentos. Implementado pelo Supabase (repository.ts) e em
 * memória (agente/repositorio-memoria.ts, para testes e comparação de modelos).
 * Todas as consultas ignoram anulados, exceto buscarPorId.
 */
export interface RepositorioLancamentos {
  inserir(lancamentos: readonly Lancamento[]): Promise<LancamentoSalvo[]>;
  listar(filtro?: FiltroLancamentos): Promise<LancamentoSalvo[]>;
  /** Vendas fiado e recebimentos de fiado (base do "a receber"). */
  listarFiados(): Promise<LancamentoSalvo[]>;
  /** Mais recentes primeiro. */
  ultimos(n: number): Promise<LancamentoSalvo[]>;
  /** Inclui anulados (para saber se já foi desfeito). */
  buscarPorId(id: string): Promise<LancamentoSalvo | null>;
  anular(id: string): Promise<LancamentoSalvo | null>;
  atualizar(id: string, campos: CamposCorrecao): Promise<LancamentoSalvo | null>;
}

/** Respostas da API (compartilhadas entre rotas e UI). */
export type RespostaListagem = {
  lancamentos: LancamentoSalvo[];
  resumo: ResumoCaixa;
};

export type MensagemChat = { role: "user" | "assistant"; content: string };

export type RespostaInterpret = {
  resposta: string;
  resumo: ResumoCaixa;
  lancamentosCriados: LancamentoSalvo[];
};

export type RespostaDesfazer = {
  lancamento: LancamentoSalvo;
  resumo: ResumoCaixa;
};

export type RespostaErro = { error: string };
