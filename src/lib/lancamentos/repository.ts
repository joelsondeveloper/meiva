import type { Lancamento } from "@/lib/interpreter/schema";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { LancamentoSalvo } from "./tipos";

const TABELA = "lancamentos";
const COLUNAS = "id, tipo, valor_centavos, descricao, forma_pagamento, data, created_at";

/** Falha de leitura/escrita no banco. */
export class RepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "RepositoryError";
  }
}

/** Insere os lançamentos (valores em centavos) e devolve as linhas gravadas. */
export async function inserirLancamentos(
  lancamentos: readonly Lancamento[],
): Promise<LancamentoSalvo[]> {
  if (lancamentos.length === 0) return [];

  const linhas = lancamentos.map((l) => ({
    tipo: l.tipo,
    valor_centavos: l.valor_centavos,
    descricao: l.descricao,
    forma_pagamento: l.forma_pagamento,
    data: l.data,
  }));

  const { data, error } = await getSupabaseServerClient()
    .from(TABELA)
    .insert(linhas)
    .select(COLUNAS);

  if (error) {
    throw new RepositoryError(`Falha ao salvar lançamentos: ${error.message}`, { cause: error });
  }
  return (data ?? []) as LancamentoSalvo[];
}

/** Lista os lançamentos de uma data (YYYY-MM-DD), em ordem de criação. */
export async function listarPorData(data: string): Promise<LancamentoSalvo[]> {
  const { data: linhas, error } = await getSupabaseServerClient()
    .from(TABELA)
    .select(COLUNAS)
    .eq("data", data)
    .order("created_at", { ascending: true });

  if (error) {
    throw new RepositoryError(
      `Falha ao listar lançamentos de ${data}: ${error.message}`,
      { cause: error },
    );
  }
  return (linhas ?? []) as LancamentoSalvo[];
}
