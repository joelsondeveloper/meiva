import type {
  MensagemChat,
  RespostaDesfazer,
  RespostaInterpret,
  RespostaListagem,
} from "@/lib/lancamentos/tipos";

/**
 * Chamadas do navegador para a API, com erro sempre em português e curto.
 * Usado só em componentes "use client".
 */

export const ERRO_SEM_CONEXAO = "Sem internet. Confira a conexão e tente de novo.";

/** Erro já com a mensagem pronta para mostrar na tela. */
export class ErroApi extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ErroApi";
  }
}

const MAX_CARACTERES_MENSAGEM = 140;

/**
 * Mensagem para o usuário a partir do status e do corpo da resposta.
 * Usa o `error` do servidor (que já é em português) quando ele existe e é
 * curto; senão, uma frase padrão pelo status (ex.: página HTML de erro da
 * Vercel, que não tem JSON).
 */
export function mensagemDeErro(status: number, corpo: unknown): string {
  if (status === 501) return "A MEIva ainda não está pronta para anotar. Tente mais tarde.";

  const doServidor =
    typeof corpo === "object" && corpo !== null && "error" in corpo ? corpo.error : undefined;
  if (
    typeof doServidor === "string" &&
    doServidor.trim() &&
    doServidor.length <= MAX_CARACTERES_MENSAGEM
  ) {
    return doServidor.trim();
  }

  if (status === 429) return "Muitas mensagens seguidas. Espere um pouco e tente de novo.";
  if (status === 408 || status === 504) return "A resposta demorou demais. Tente de novo.";
  if (status >= 500) return "Algo deu errado do nosso lado. Tente de novo.";
  return "Não deu certo. Tente de novo.";
}

export async function chamarApi<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    // O navegador só diz "Failed to fetch" (em inglês).
    throw new ErroApi(ERRO_SEM_CONEXAO, 0);
  }

  const corpo: unknown = await res.json().catch(() => null);
  if (!res.ok || corpo === null) {
    throw new ErroApi(mensagemDeErro(res.status, corpo), res.status);
  }
  return corpo as T;
}

/** Mensagem de qualquer erro (ErroApi ou inesperado) para mostrar na tela. */
export const textoDoErro = (erro: unknown): string =>
  erro instanceof ErroApi ? erro.message : "Algo deu errado. Tente de novo.";

const json = (method: string, corpo: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(corpo),
});

/** Manda as últimas mensagens da conversa para o agente (a última é do usuário). */
export const enviarMensagens = (mensagens: readonly MensagemChat[]) =>
  chamarApi<RespostaInterpret>("/api/interpret", json("POST", { mensagens }));

export const buscarDia = () =>
  chamarApi<RespostaListagem>("/api/lancamentos", { cache: "no-store" });

/** Desfaz um lançamento. No servidor é soft delete: a linha fica, marcada como anulada. */
export const desfazerLancamento = (id: string) =>
  chamarApi<RespostaDesfazer>(`/api/lancamentos/${encodeURIComponent(id)}/desfazer`, {
    method: "POST",
  });
