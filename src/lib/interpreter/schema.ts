import { z } from "zod";

/**
 * Contrato entre a IA e o resto do app. Tudo que o LLM devolver passa por
 * aqui antes de virar lançamento; se não validar, não entra no caixa.
 */

export const TipoLancamento = z.enum(["entrada", "saida"]);

export const FormaPagamento = z
  .enum(["pix", "dinheiro", "cartao", "fiado", "outro"])
  .nullable();

export const LancamentoSchema = z.object({
  tipo: TipoLancamento,
  /** Sempre em centavos para evitar erro de ponto flutuante (R$ 49,90 = 4990). */
  valor_centavos: z.number().int().positive(),
  descricao: z.string().min(1),
  forma_pagamento: FormaPagamento,
  /** Data ISO (YYYY-MM-DD), casa com a coluna `date` do Postgres. */
  data: z.iso.date(),
});

export const ResultadoSchema = z.object({
  lancamentos: z.array(LancamentoSchema),
  /** true quando a IA não tem certeza e o usuário deve revisar antes de salvar. */
  precisa_confirmar: z.boolean(),
  /** Pergunta de esclarecimento, ex.: "Qual foi o valor de cada blusa?" */
  pergunta: z.string().optional(),
});

export type Lancamento = z.infer<typeof LancamentoSchema>;
export type Resultado = z.infer<typeof ResultadoSchema>;
export type FormaPagamento = z.infer<typeof FormaPagamento>;
export type TipoLancamento = z.infer<typeof TipoLancamento>;
