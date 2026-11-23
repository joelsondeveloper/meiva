import type { Resultado } from "./schema";

/**
 * Transforma uma frase livre do MEI em lançamentos de caixa.
 *
 * TODO: implementar. Passos sugeridos:
 * 1. Montar as mensagens com SYSTEM_PROMPT e buildUserMessage (prompt.ts).
 * 2. Chamar getOpenRouterClient().chat.completions.create(...) com
 *    getOpenRouterModel() e resposta em JSON (llm/openrouter.ts).
 * 3. Fazer JSON.parse do conteúdo e validar com ResultadoSchema.safeParse.
 * 4. Se não validar, decidir: tentar de novo ou devolver precisa_confirmar.
 */
export async function interpret(texto: string): Promise<Resultado> {
  void texto;
  throw new Error("TODO: interpret não implementado");
}
