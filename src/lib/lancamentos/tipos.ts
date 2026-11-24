import type { Lancamento } from "@/lib/interpreter/schema";
import type { Resumo } from "./saldo";

/** Lançamento como está gravado no banco. */
export type LancamentoSalvo = Lancamento & {
  id: string;
  created_at: string;
};

/** Respostas da API (compartilhadas entre rotas e UI). */
export type RespostaRegistrado = {
  status: "registrado";
  lancamentos: LancamentoSalvo[];
  resumo: Resumo;
};

export type RespostaPrecisaConfirmar = {
  status: "precisa_confirmar";
  pergunta: string;
};

export type RespostaInterpret = RespostaRegistrado | RespostaPrecisaConfirmar;

export type RespostaListagem = {
  lancamentos: LancamentoSalvo[];
  resumo: Resumo;
};

export type RespostaDesfazer = {
  /** Quantos lançamentos foram apagados (0 se já tinham sido desfeitos). */
  removidos: number;
  resumo: Resumo;
};

export type RespostaErro = { error: string };
