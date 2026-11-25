import { RepositorioMemoria } from "@/lib/agente/repositorio-memoria";
import { hojeBR } from "@/lib/datas";
import type { Lancamento } from "@/lib/interpreter/schema";
import { repositorioSupabase } from "@/lib/lancamentos/repository";
import type { RepositorioLancamentos } from "@/lib/lancamentos/tipos";
import { somarDias } from "./periodo";

/**
 * Repositório usado pelas páginas Resumo e Fiados (server components).
 *
 * Normalmente é o Supabase. Só em desenvolvimento, com MEIVA_DADOS_DEMO=1,
 * usa um repositório em memória com dados fictícios: serve para tirar os
 * screenshots de docs/ sem expor dados reais. Em produção isso nunca liga.
 */
export function repositorioDasPaginas(): RepositorioLancamentos {
  if (process.env.NODE_ENV !== "production" && process.env.MEIVA_DADOS_DEMO === "1") {
    demo ??= new RepositorioMemoria(dadosDemo(hojeBR()));
    return demo;
  }
  return repositorioSupabase;
}

let demo: RepositorioMemoria | undefined;

/** Uma semana de uma doceria pequena, terminando em `hoje`. Nomes fictícios. */
export function dadosDemo(hoje: string): Lancamento[] {
  const dia = (n: number) => somarDias(hoje, -n);
  const l = (
    n: number,
    natureza: Lancamento["natureza"],
    valor: number,
    descricao: string,
    forma: Lancamento["forma_pagamento"],
    pessoa: string | null = null,
  ): Lancamento => ({
    natureza,
    tipo: natureza === "despesa" || natureza === "retirada_pessoal" ? "saida" : "entrada",
    valor_centavos: valor * 100,
    descricao,
    forma_pagamento: forma,
    data: dia(n),
    pessoa,
  });

  return [
    l(12, "aporte", 300, "troco para começar", "dinheiro"),
    l(9, "venda", 180, "encomenda de bolo de aniversário", "pix"),
    l(9, "despesa", 95, "farinha, açúcar e ovos", "dinheiro"),
    l(8, "venda", 60, "2 bolos de pote", "fiado", "Marta"),
    l(6, "venda", 120, "40 brigadeiros", "pix"),
    l(5, "venda", 80, "torta de limão", "fiado", "João"),
    l(4, "retirada_pessoal", 100, "mercado de casa", null),
    l(4, "venda", 75, "5 fatias de bolo", "cartao"),
    l(3, "venda", 25, "pudim pequeno", "fiado", "Dona Cida"),
    l(3, "despesa", 42, "embalagens", "pix"),
    l(2, "recebimento_fiado", 20, "Marta pagou parte", "pix", "Marta"),
    l(1, "venda", 90, "3 pudins", "dinheiro"),
    l(1, "despesa", 30, "conta de luz", "pix"),
    l(0, "venda", 50, "pudim", "pix"),
    l(0, "venda", 36, "12 brigadeiros", "dinheiro"),
    l(0, "despesa", 18, "leite condensado", "dinheiro"),
    l(0, "venda", 40, "bolo de cenoura", "fiado", "Marta"),
  ];
}
