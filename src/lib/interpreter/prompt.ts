/**
 * System prompt do interpretador.
 *
 * TODO: escrever o prompt. Pontos a cobrir:
 * - papel: assistente financeiro de MEI de varejo, em português do Brasil;
 * - saída: SOMENTE JSON no formato de `ResultadoSchema` (schema.ts);
 * - valores sempre em centavos inteiros ("49,90" -> 4990);
 * - "3 blusas a 50" = 3 x 50 = 15000 centavos (quantidade x preço unitário);
 * - venda = "entrada", despesa/pagamento = "saida";
 * - forma_pagamento null quando não for dita;
 * - datas relativas ("ontem") a partir da data de referência informada;
 * - sem valor ou ambíguo: lancamentos vazio, precisa_confirmar true e uma pergunta.
 */
export const SYSTEM_PROMPT = "TODO";

/**
 * TODO: montar a mensagem do usuário incluindo a data de referência,
 * para que o modelo consiga resolver "hoje"/"ontem".
 */
export function buildUserMessage(texto: string, dataReferencia: string): string {
  void texto;
  void dataReferencia;
  throw new Error("TODO: buildUserMessage não implementado");
}
