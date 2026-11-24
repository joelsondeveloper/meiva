import type { Lancamento } from "@/lib/interpreter/schema";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CamposCorrecao,
  FiltroLancamentos,
  LancamentoSalvo,
  RepositorioLancamentos,
} from "./tipos";

const TABELA = "lancamentos";
const COLUNAS =
  "id, tipo, natureza, valor_centavos, descricao, forma_pagamento, pessoa, data, created_at, anulado_em";

/** Falha de leitura/escrita no banco. */
export class RepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "RepositoryError";
  }
}

const db = () => getSupabaseServerClient().from(TABELA);

function falha(acao: string, error: { message: string }): never {
  throw new RepositoryError(`Falha ao ${acao}: ${error.message}`, { cause: error });
}

/** Repositório real (Supabase). Consultas sempre com `anulado_em is null`. */
export const repositorioSupabase: RepositorioLancamentos = {
  async inserir(lancamentos: readonly Lancamento[]) {
    if (lancamentos.length === 0) return [];
    const linhas = lancamentos.map((l) => ({
      tipo: l.tipo,
      natureza: l.natureza,
      valor_centavos: l.valor_centavos,
      descricao: l.descricao,
      forma_pagamento: l.forma_pagamento,
      pessoa: l.pessoa,
      data: l.data,
    }));
    const { data, error } = await db().insert(linhas).select(COLUNAS);
    if (error) falha("salvar lançamentos", error);
    return (data ?? []) as LancamentoSalvo[];
  },

  async listar(filtro: FiltroLancamentos = {}) {
    let q = db().select(COLUNAS).is("anulado_em", null);
    if (filtro.de) q = q.gte("data", filtro.de);
    if (filtro.ate) q = q.lte("data", filtro.ate);
    const { data, error } = await q
      .order("data", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) falha("listar lançamentos", error);
    return (data ?? []) as LancamentoSalvo[];
  },

  async listarFiados() {
    const { data, error } = await db()
      .select(COLUNAS)
      .is("anulado_em", null)
      .or("forma_pagamento.eq.fiado,natureza.eq.recebimento_fiado")
      .order("created_at", { ascending: true });
    if (error) falha("listar fiados", error);
    return (data ?? []) as LancamentoSalvo[];
  },

  async ultimos(n: number) {
    const { data, error } = await db()
      .select(COLUNAS)
      .is("anulado_em", null)
      .order("created_at", { ascending: false })
      .limit(n);
    if (error) falha("listar últimos lançamentos", error);
    return (data ?? []) as LancamentoSalvo[];
  },

  async buscarPorId(id: string) {
    const { data, error } = await db().select(COLUNAS).eq("id", id).maybeSingle();
    if (error) falha("buscar lançamento", error);
    return (data ?? null) as LancamentoSalvo | null;
  },

  async anular(id: string) {
    const { data, error } = await db()
      .update({ anulado_em: new Date().toISOString() })
      .eq("id", id)
      .is("anulado_em", null)
      .select(COLUNAS)
      .maybeSingle();
    if (error) falha("desfazer lançamento", error);
    return (data ?? null) as LancamentoSalvo | null;
  },

  async atualizar(id: string, campos: CamposCorrecao) {
    const { data, error } = await db()
      .update(campos)
      .eq("id", id)
      .is("anulado_em", null)
      .select(COLUNAS)
      .maybeSingle();
    if (error) falha("corrigir lançamento", error);
    return (data ?? null) as LancamentoSalvo | null;
  },
};
