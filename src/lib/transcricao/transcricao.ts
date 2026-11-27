import { toFile } from "openai";
import { getOpenRouterClient } from "@/lib/llm/openrouter";

/**
 * Transcrição de áudio (fala → texto) via OpenRouter, endpoint
 * /audio/transcriptions. Só no servidor: usa a OPENROUTER_API_KEY.
 *
 * Privacidade: o áudio fica só na memória durante a chamada. Nada aqui grava
 * em disco, banco ou log; quando a função termina, o buffer é descartado.
 *
 * Modelo escolhido na comparação de 27/11/2026 (scripts/comparar-transcricao.ts):
 * whisper-large-v3-turbo acertou o mesmo que o gpt-4o-mini-transcribe, custa
 * ~5x menos e, no silêncio, devolve vazio em vez de repetir o prompt.
 */

export const MODELO_TRANSCRICAO_PADRAO = "openai/whisper-large-v3-turbo";

/**
 * Contexto de vocabulário, não instrução. Lista curta de palavras de
 * propósito: frases de exemplo no prompt viram "fala" quando o áudio é mudo.
 */
export const PROMPT_VOCABULARIO = "pix, fiado, pila, conto, reais";

/** O campo de texto aceita no máximo isso (mesmo limite do /api/interpret). */
export const MAX_CARACTERES_TRANSCRICAO = 500;

/**
 * Frases que modelos tipo Whisper "inventam" em silêncio ou barulho (vêm de
 * legendas de vídeo do treino). Comparadas com o texto normalizado inteiro.
 */
const ALUCINACOES = [
  /legendas? (pela|por) comunidade/,
  /amara\.?org/,
  /^(obrigad[oa] por assistir|inscreva se no canal|e ai)$/,
  /^(tchau|obrigad[oa])$/,
];

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}.\s]/gu, " ")
    .replace(/\s+/g, " ")
    .replace(/\.(?=\s|$)/g, "")
    .trim();
}

/**
 * Limpa a saída do modelo. Devolve "" quando não sobra fala de verdade:
 * vazio, só pontuação, eco do prompt ou alucinação conhecida.
 */
export function limparTranscricao(bruto: string): string {
  const texto = bruto.replace(/\s+/g, " ").trim();
  const norm = normalizar(texto);
  if (!/[\p{L}\p{N}]/u.test(norm)) return "";
  if (norm === normalizar(PROMPT_VOCABULARIO)) return "";
  if (ALUCINACOES.some((re) => re.test(norm))) return "";
  return texto.slice(0, MAX_CARACTERES_TRANSCRICAO).trim();
}

export function modeloTranscricao(): string {
  return process.env.OPENROUTER_MODEL_TRANSCRICAO?.trim() || MODELO_TRANSCRICAO_PADRAO;
}

/** Transcreve o áudio em pt-BR. Devolve "" quando não entendeu nada. */
export async function transcrever(audio: Blob, nomeArquivo: string): Promise<string> {
  const file = await toFile(audio, nomeArquivo, { type: audio.type });
  const resposta = await getOpenRouterClient().audio.transcriptions.create({
    model: modeloTranscricao(),
    file,
    language: "pt",
    prompt: PROMPT_VOCABULARIO,
  });
  return limparTranscricao(resposta.text ?? "");
}
