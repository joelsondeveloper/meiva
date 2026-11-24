import { z } from "zod";

/**
 * Contrato entre a IA e o resto do app. Tudo que o LLM devolver passa por
 * aqui antes de virar lançamento; se não validar, não entra no caixa.
 */

export const TipoLancamento = z.enum(["entrada", "saida"]);

export const FormaPagamento = z
  .enum(["pix", "dinheiro", "cartao", "fiado", "outro"])
  .nullable();

/** O que o lançamento é (o tipo só diz se entra ou sai do caixa). */
export const Natureza = z.enum(["venda", "despesa", "recebimento_fiado", "aporte", "retirada_pessoal"]);

/** Natureza -> tipo obrigatório. */
export const TIPO_DA_NATUREZA: Record<z.infer<typeof Natureza>, z.infer<typeof TipoLancamento>> = {
  venda: "entrada",
  recebimento_fiado: "entrada",
  aporte: "entrada",
  despesa: "saida",
  retirada_pessoal: "saida",
};

/**
 * Lançamento do interpretador antigo (uma chamada, JSON). Mantido só enquanto
 * interpret.ts e tests/fixtures/frases.ts existirem.
 */
export const LancamentoBaseSchema = z.object({
  tipo: TipoLancamento,
  /** Sempre em centavos para evitar erro de ponto flutuante (R$ 49,90 = 4990). */
  valor_centavos: z.number().int().positive(),
  descricao: z.string().min(1),
  forma_pagamento: FormaPagamento,
  /** Data ISO (YYYY-MM-DD), casa com a coluna `date` do Postgres. */
  data: z.iso.date(),
});

export const LancamentoSchema = LancamentoBaseSchema.extend({
  natureza: Natureza,
  /** Cliente do fiado / do recebimento. null quando não se aplica. */
  pessoa: z.string().trim().min(1).max(80).nullable(),
});

export const ResultadoSchema = z.object({
  lancamentos: z.array(LancamentoBaseSchema),
  /** true quando a IA não tem certeza e o usuário deve revisar antes de salvar. */
  precisa_confirmar: z.boolean(),
  /** Pergunta de esclarecimento, ex.: "Qual foi o valor de cada blusa?" */
  pergunta: z.string().optional(),
});

export type LancamentoBase = z.infer<typeof LancamentoBaseSchema>;
export type Lancamento = z.infer<typeof LancamentoSchema>;
export type Resultado = z.infer<typeof ResultadoSchema>;
export type FormaPagamento = z.infer<typeof FormaPagamento>;
export type TipoLancamento = z.infer<typeof TipoLancamento>;
export type Natureza = z.infer<typeof Natureza>;
