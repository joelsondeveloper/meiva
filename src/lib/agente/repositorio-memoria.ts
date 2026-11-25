import type { Lancamento } from "@/lib/interpreter/schema";
import type {
  CamposCorrecao,
  FiltroLancamentos,
  LancamentoSalvo,
  RepositorioLancamentos,
} from "@/lib/lancamentos/tipos";

/**
 * Repositório em memória com o mesmo contrato do Supabase. Usado nos testes
 * e no scripts/comparar-modelos.ts (cada cenário começa com um repositório vazio).
 * `created_at` é um relógio fictício crescente, para a ordem ser determinística.
 */
export class RepositorioMemoria implements RepositorioLancamentos {
  private linhas: LancamentoSalvo[] = [];
  private seq = 0;

  constructor(iniciais: readonly Lancamento[] = []) {
    for (const l of iniciais) this.criar(l);
  }

  /** Estado completo, incluindo anulados (para conferir o resultado de um cenário). */
  todos(): LancamentoSalvo[] {
    return this.linhas.map((l) => ({ ...l }));
  }

  private criar(l: Lancamento): LancamentoSalvo {
    this.seq++;
    const salvo: LancamentoSalvo = {
      ...l,
      id: `00000000-0000-4000-8000-${String(this.seq).padStart(12, "0")}`,
      created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, this.seq)).toISOString(),
      anulado_em: null,
    };
    this.linhas.push(salvo);
    return { ...salvo };
  }

  private ativos(): LancamentoSalvo[] {
    return this.linhas.filter((l) => !l.anulado_em);
  }

  async inserir(lancamentos: readonly Lancamento[]) {
    return lancamentos.map((l) => this.criar(l));
  }

  async listar(filtro: FiltroLancamentos = {}) {
    return this.ativos()
      .filter((l) => (!filtro.de || l.data >= filtro.de) && (!filtro.ate || l.data <= filtro.ate))
      .sort((a, b) => a.data.localeCompare(b.data) || a.created_at.localeCompare(b.created_at))
      .map((l) => ({ ...l }));
  }

  async listarFiados() {
    return this.ativos()
      .filter((l) => l.forma_pagamento === "fiado" || l.natureza === "recebimento_fiado")
      .map((l) => ({ ...l }));
  }

  async ultimos(n: number) {
    return this.ativos()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, n)
      .map((l) => ({ ...l }));
  }

  async buscarPorId(id: string) {
    const l = this.linhas.find((x) => x.id === id);
    return l ? { ...l } : null;
  }

  async anular(id: string) {
    const l = this.linhas.find((x) => x.id === id && !x.anulado_em);
    if (!l) return null;
    l.anulado_em = new Date(Date.UTC(2026, 0, 1, 1, 0, ++this.seq)).toISOString();
    return { ...l };
  }

  async atualizar(id: string, campos: CamposCorrecao) {
    const l = this.linhas.find((x) => x.id === id && !x.anulado_em);
    if (!l) return null;
    Object.assign(l, campos);
    return { ...l };
  }
}
