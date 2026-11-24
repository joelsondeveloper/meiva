import type OpenAI from "openai";
import { z } from "zod";
import { hojeBR } from "@/lib/datas";
import { getOpenRouterClient, getOpenRouterModel } from "@/lib/llm/openrouter";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompt";
import { ResultadoSchema, type Resultado } from "./schema";

/**
 * Schema enviado ao modelo. No modo estrito (strict) todo campo precisa ser
 * obrigatório, então aqui `pergunta` é "string ou null" em vez de opcional.
 * Depois a gente converte null de volta para "sem pergunta".
 */
const ResultadoParaLLM = ResultadoSchema.extend({ pergunta: z.string().nullable() });
const jsonSchema = z.toJSONSchema(ResultadoParaLLM) as Record<string, unknown>;
delete jsonSchema.$schema;

/** `reasoning` é um parâmetro extra do OpenRouter que o SDK da OpenAI não conhece. */
type Params = OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
  reasoning?: { effort: "low" | "medium" | "high" };
};

export type OpcoesInterpret = {
  /** Sobrescreve OPENROUTER_MODEL (usado para comparar modelos). */
  model?: string;
  /** Sobrescreve "hoje" (usado nos testes, para a data ser previsível). */
  dataReferencia?: string;
};

/**
 * Transforma uma frase livre do MEI em lançamentos de caixa.
 *
 * Tentativa 1: pede saída estruturada (JSON Schema) ao modelo.
 * Tentativa 2 (plano B): sem response_format, confiando só no prompt, caso o
 * modelo ou o provedor não suporte saída estruturada.
 * Em ambas, o que voltar passa pelo Zod antes de sair daqui.
 */
export async function interpret(texto: string, opcoes: OpcoesInterpret = {}): Promise<Resultado> {
  const client = getOpenRouterClient();
  const model = opcoes.model ?? getOpenRouterModel();
  const dataReferencia = opcoes.dataReferencia ?? hojeBR();

  const base: Params = {
    model,
    temperature: 0,
    max_tokens: 3000,
    // Tarefa simples: se o modelo raciocina, que seja pouco. Ignorado por quem não raciocina.
    reasoning: { effort: "low" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(texto, dataReferencia) },
    ],
  };

  let ultimoErro: unknown;
  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    try {
      const params: Params =
        tentativa === 1
          ? {
              ...base,
              response_format: {
                type: "json_schema",
                json_schema: { name: "resultado", strict: true, schema: jsonSchema },
              },
            }
          : base;

      const resposta = await client.chat.completions.create(params);
      const conteudo = resposta.choices[0]?.message?.content;
      if (!conteudo) {
        const motivo = resposta.choices[0]?.finish_reason ?? "desconhecido";
        throw new Error(`Resposta vazia do modelo (finish_reason: ${motivo}).`);
      }
      return validar(conteudo);
    } catch (erro) {
      ultimoErro = erro;
    }
  }

  const detalhe = ultimoErro instanceof Error ? ultimoErro.message : String(ultimoErro);
  throw new Error(`Não consegui interpretar a mensagem (${model}): ${detalhe}`);
}

/** Pega o JSON do texto (alguns modelos cercam com ```), converte e valida com o Zod. */
function validar(conteudo: string): Resultado {
  const inicio = conteudo.indexOf("{");
  const fim = conteudo.lastIndexOf("}");
  if (inicio === -1 || fim <= inicio) throw new Error("O modelo não devolveu JSON.");

  const bruto = JSON.parse(conteudo.slice(inicio, fim + 1)) as Record<string, unknown>;
  return ResultadoSchema.parse({ ...bruto, pergunta: bruto.pergunta ?? undefined });
}
