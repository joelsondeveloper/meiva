import type OpenAI from "openai";
import { hojeBR } from "@/lib/datas";
import { SYSTEM_PROMPT_AGENTE } from "./prompt";
import { repositorioSupabase } from "@/lib/lancamentos/repository";
import type { LancamentoSalvo, MensagemChat, RepositorioLancamentos } from "@/lib/lancamentos/tipos";
import { getOpenRouterClient, getOpenRouterModel } from "@/lib/llm/openrouter";
import { DEFINICOES_FERRAMENTAS, executarFerramenta } from "./ferramentas";

/**
 * Agente com function calling: a IA conversa e chama as ferramentas de
 * ferramentas.ts até ter uma resposta em texto para o usuário.
 */

export const MAX_ITERACOES = 6;
export const MAX_MENSAGENS = 10;

type Mensagem = OpenAI.Chat.Completions.ChatCompletionMessageParam;

/** `reasoning` é um parâmetro extra do OpenRouter que o SDK da OpenAI não conhece. */
type Params = OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
  reasoning?: { effort: "low" | "medium" | "high" };
};

export type ChamadaFerramenta = { nome: string; args: unknown; resultado: unknown };

export type EntradaAgente = {
  /** Histórico da conversa (só texto). Só as últimas MAX_MENSAGENS são usadas. */
  mensagens: readonly MensagemChat[];
  /** "Hoje" (YYYY-MM-DD). Padrão: hoje em Brasília. */
  dataReferencia?: string;
  /** Sobrescreve OPENROUTER_MODEL. */
  model?: string;
  /** Padrão: Supabase. Testes e o comparador injetam o repositório em memória. */
  repositorio?: RepositorioLancamentos;
  /** Padrão: cliente OpenRouter. Testes injetam um falso. */
  client?: Pick<OpenAI, "chat">;
};

export type SaidaAgente = {
  resposta: string;
  /** Criados nesta requisição e ainda válidos (sem os desfeitos; com as correções). */
  lancamentosCriados: LancamentoSalvo[];
  chamadas: ChamadaFerramenta[];
};

/**
 * O agente falhou no meio (ex.: OpenRouter caiu na 2ª chamada). Carrega o que
 * JÁ foi gravado, para a API não esconder do usuário lançamentos salvos.
 */
export class ErroAgente extends Error {
  constructor(
    message: string,
    readonly lancamentosCriados: LancamentoSalvo[],
    readonly chamadas: ChamadaFerramenta[],
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "ErroAgente";
  }
}

const RESPOSTA_SEM_TEXTO =
  "Não consegui concluir agora. Pode repetir o que aconteceu no caixa com o valor e a forma de pagamento?";

/** Contexto que muda a cada requisição (o SYSTEM_PROMPT_AGENTE fica fixo, bom para cache). */
export function mensagemDeContexto(dataReferencia: string): string {
  return `Data de referência (hoje): ${dataReferencia}. Valores sempre em centavos nas ferramentas.`;
}

function lerArgs(json: string): unknown {
  try {
    return json.trim() ? JSON.parse(json) : {};
  } catch {
    return json;
  }
}

export async function agente(entrada: EntradaAgente): Promise<SaidaAgente> {
  const chamadas: ChamadaFerramenta[] = [];
  const criados = new Map<string, LancamentoSalvo>();
  try {
    return await loop(entrada, chamadas, criados);
  } catch (e) {
    const detalhe = e instanceof Error ? e.message : String(e);
    throw new ErroAgente(`Falha no agente: ${detalhe}`, [...criados.values()], chamadas, { cause: e });
  }
}

async function loop(
  entrada: EntradaAgente,
  chamadas: ChamadaFerramenta[],
  criados: Map<string, LancamentoSalvo>,
): Promise<SaidaAgente> {
  const client = entrada.client ?? getOpenRouterClient();
  const model = entrada.model ?? getOpenRouterModel();
  const hoje = entrada.dataReferencia ?? hojeBR();
  const ctx = { repo: entrada.repositorio ?? repositorioSupabase, hoje };

  const mensagens: Mensagem[] = [
    { role: "system", content: SYSTEM_PROMPT_AGENTE },
    { role: "system", content: mensagemDeContexto(hoje) },
    ...entrada.mensagens.slice(-MAX_MENSAGENS).map((m) => ({ role: m.role, content: m.content })),
  ];

  const saida = (resposta: string): SaidaAgente => ({
    resposta,
    lancamentosCriados: [...criados.values()],
    chamadas,
  });

  for (let iteracao = 1; iteracao <= MAX_ITERACOES; iteracao++) {
    const ultima = iteracao === MAX_ITERACOES;
    const params: Params = {
      model,
      temperature: 0,
      max_tokens: 3000,
      reasoning: { effort: "low" },
      messages: mensagens,
      tools: DEFINICOES_FERRAMENTAS,
      // Na última volta a IA tem que responder em texto.
      tool_choice: ultima ? "none" : "auto",
    };

    const resposta = await client.chat.completions.create(params);
    const msg = resposta.choices[0]?.message;
    if (!msg) return saida(RESPOSTA_SEM_TEXTO);

    const toolCalls = (msg.tool_calls ?? []).filter((c) => c.type === "function");
    if (toolCalls.length === 0 || ultima) {
      return saida(msg.content?.trim() || RESPOSTA_SEM_TEXTO);
    }

    // Devolve a mensagem inteira (alguns provedores mandam `reasoning` junto e precisam dele de volta).
    mensagens.push({ ...msg, tool_calls: toolCalls } as Mensagem);

    for (const call of toolCalls) {
      const { name, arguments: argsJson } = call.function;
      const { resultado, efeitos } = await executarFerramenta(name, argsJson, ctx);
      chamadas.push({ nome: name, args: lerArgs(argsJson), resultado });

      for (const l of efeitos.criados ?? []) criados.set(l.id, l);
      if (efeitos.anulado) criados.delete(efeitos.anulado.id);
      if (efeitos.corrigido && criados.has(efeitos.corrigido.id)) {
        criados.set(efeitos.corrigido.id, efeitos.corrigido);
      }

      mensagens.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(resultado) });
    }
  }

  return saida(RESPOSTA_SEM_TEXTO);
}
