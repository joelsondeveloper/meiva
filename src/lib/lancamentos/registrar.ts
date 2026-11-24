import { hojeBR } from "@/lib/datas";
import { interpret } from "@/lib/interpreter/interpret";
import { ResultadoSchema, type Resultado } from "@/lib/interpreter/schema";
import { excluirLancamentos, inserirLancamentos, listarPorData } from "./repository";
import { calcularSaldo } from "./saldo";
import type { RespostaDesfazer, RespostaInterpret, RespostaListagem } from "./tipos";

/** interpret() ainda é o stub com TODO. */
export class InterpretadorNaoImplementadoError extends Error {
  constructor() {
    super("O interpretador ainda não foi implementado (src/lib/interpreter/interpret.ts).");
    this.name = "InterpretadorNaoImplementadoError";
  }
}

/** interpret() falhou ou devolveu algo fora do contrato. */
export class InterpretadorError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "InterpretadorError";
  }
}

const PERGUNTA_PADRAO =
  "Não consegui identificar nenhum lançamento. Pode repetir com o valor e se foi venda ou despesa?";

function ehTodo(erro: unknown): boolean {
  return erro instanceof Error && erro.message.startsWith("TODO");
}

async function interpretarComSeguranca(texto: string): Promise<Resultado> {
  let bruto: unknown;
  try {
    bruto = await interpret(texto);
  } catch (erro) {
    if (ehTodo(erro)) throw new InterpretadorNaoImplementadoError();
    throw new InterpretadorError("Falha ao interpretar o texto.", { cause: erro });
  }

  const validado = ResultadoSchema.safeParse(bruto);
  if (!validado.success) {
    throw new InterpretadorError("O interpretador devolveu um resultado inválido.", {
      cause: validado.error,
    });
  }
  return validado.data;
}

/** Lançamentos e resumo de uma data. */
export async function resumoDoDia(data: string = hojeBR()): Promise<RespostaListagem> {
  const lancamentos = await listarPorData(data);
  return { lancamentos, resumo: calcularSaldo(lancamentos) };
}

/**
 * Interpreta o texto e, se não houver dúvida, grava os lançamentos.
 * O resumo devolvido é o do dia de hoje (fuso de Brasília).
 */
export async function registrarTexto(texto: string): Promise<RespostaInterpret> {
  const resultado = await interpretarComSeguranca(texto);

  if (resultado.precisa_confirmar || resultado.lancamentos.length === 0) {
    return {
      status: "precisa_confirmar",
      pergunta: resultado.pergunta?.trim() || PERGUNTA_PADRAO,
    };
  }

  const lancamentos = await inserirLancamentos(resultado.lancamentos);
  const { resumo } = await resumoDoDia();
  return { status: "registrado", lancamentos, resumo };
}

/** Desfaz um registro: apaga os lançamentos e devolve o resumo de hoje atualizado. */
export async function desfazerLancamentos(ids: readonly string[]): Promise<RespostaDesfazer> {
  const removidos = await excluirLancamentos(ids);
  const { resumo } = await resumoDoDia();
  return { removidos, resumo };
}
