import OpenAI from "openai";

/**
 * Cliente LLM via OpenRouter (API compatível com OpenAI).
 *
 * É uma factory em vez de um `new OpenAI()` no topo do módulo de propósito:
 * assim o `next build` não quebra quando as variáveis de ambiente ainda não
 * existem, e o erro só aparece quando alguém realmente tenta usar o cliente.
 *
 * Use apenas no servidor (route handlers / server actions): a chave não
 * pode ir para o navegador.
 */

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

let client: OpenAI | null = null;

export function getOpenRouterClient(): OpenAI {
  if (client) return client;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY não definida (veja .env.example).");
  }

  client = new OpenAI({ apiKey, baseURL: OPENROUTER_BASE_URL });
  return client;
}

export function getOpenRouterModel(): string {
  const model = process.env.OPENROUTER_MODEL;
  if (!model) {
    throw new Error("OPENROUTER_MODEL não definida (veja .env.example).");
  }
  return model;
}
