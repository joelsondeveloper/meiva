import type { LancamentoSalvo, MensagemChat } from "@/lib/lancamentos/tipos";

/** Uma mensagem do chat (do usuário ou da MEIva). */
export type Mensagem =
  | { id: string; autor: "usuario"; texto: string }
  | {
      id: string;
      autor: "meiva";
      tipo: "resposta";
      /** Texto escrito pela IA. */
      texto: string;
      /** Lançamentos gravados nesta resposta (vazio numa pergunta ou consulta). */
      lancamentos: LancamentoSalvo[];
      /** Ids desfeitos pelo botão "Desfazer". */
      desfeitos: string[];
    }
  /** Aviso de que o usuário desfez um lançamento pela tela. Vai no histórico para a IA saber. */
  | { id: string; autor: "meiva"; tipo: "desfeito"; texto: string }
  | { id: string; autor: "meiva"; tipo: "erro"; texto: string };

let contador = 0;

/** Id único para a key do React (randomUUID só existe em HTTPS/localhost). */
export function novoId(): string {
  contador++;
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${contador}`;
}

/*
 * Histórico da conversa guardado no sessionStorage da aba, para não perder a
 * conversa ao recarregar a página. Guarda só as últimas MAX_MENSAGENS.
 *
 * É um "store" externo para usar com useSyncExternalStore: no servidor (e na
 * hidratação) a conversa é vazia; no navegador, lida do sessionStorage. Todo
 * acesso ao storage fica em try/catch (modo privado, storage cheio ou
 * bloqueado): se falhar, a conversa só fica em memória.
 */

/** Tamanho do histórico guardado e enviado ao agente (o agente também usa só 10). */
export const MAX_MENSAGENS = 10;
/** v2: formato do agente (texto da IA + lançamentos). O v1, do interpretador antigo, é ignorado. */
export const CHAVE_STORAGE = "meiva:conversa:v2";

const VAZIA: Mensagem[] = [];
let cache: Mensagem[] | null = null;
const ouvintes = new Set<() => void>();

const FORMAS = new Set(["pix", "dinheiro", "cartao", "fiado", "outro", null]);
const NATUREZAS = new Set(["venda", "despesa", "recebimento_fiado", "aporte", "retirada_pessoal"]);

const ehTexto = (v: unknown): v is string => typeof v === "string";
const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function ehLancamento(v: unknown): boolean {
  return (
    ehObjeto(v) &&
    ehTexto(v.id) &&
    (v.tipo === "entrada" || v.tipo === "saida") &&
    NATUREZAS.has(v.natureza as string) &&
    Number.isInteger(v.valor_centavos) &&
    (v.valor_centavos as number) > 0 &&
    ehTexto(v.descricao) &&
    FORMAS.has(v.forma_pagamento as string | null) &&
    (v.pessoa === null || ehTexto(v.pessoa)) &&
    ehTexto(v.data)
  );
}

function ehMensagem(v: unknown): v is Mensagem {
  if (!ehObjeto(v) || !ehTexto(v.id)) return false;
  if (v.autor === "usuario") return ehTexto(v.texto);
  if (v.autor !== "meiva") return false;
  if (v.tipo === "desfeito" || v.tipo === "erro") return ehTexto(v.texto);
  return (
    v.tipo === "resposta" &&
    ehTexto(v.texto) &&
    Array.isArray(v.desfeitos) &&
    v.desfeitos.every(ehTexto) &&
    Array.isArray(v.lancamentos) &&
    v.lancamentos.every(ehLancamento)
  );
}

/** Lê o que veio do storage descartando o que estiver fora do formato. */
export function validarConversa(bruto: unknown): Mensagem[] {
  if (!Array.isArray(bruto)) return VAZIA;
  return bruto.filter(ehMensagem).slice(-MAX_MENSAGENS);
}

const ehErro = (m: Mensagem) => m.autor === "meiva" && m.tipo === "erro";

/**
 * Histórico enviado ao agente: só o texto, sem os erros da tela, nas últimas
 * MAX_MENSAGENS. A API exige que a última seja do usuário.
 */
export function historicoParaApi(mensagens: readonly Mensagem[]): MensagemChat[] {
  return mensagens
    .filter((m) => !ehErro(m) && m.texto.trim() !== "")
    .slice(-MAX_MENSAGENS)
    .map((m) => ({ role: m.autor === "usuario" ? "user" : "assistant", content: m.texto }));
}

/** Erros (ex.: "sem internet") não fazem sentido depois de recarregar. */
const paraGuardar = (mensagens: Mensagem[]) =>
  mensagens.filter((m) => !ehErro(m)).slice(-MAX_MENSAGENS);

function carregar(): Mensagem[] {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE_STORAGE);
    return bruto ? validarConversa(JSON.parse(bruto)) : VAZIA;
  } catch {
    return VAZIA;
  }
}

function avisar() {
  for (const ouvinte of ouvintes) ouvinte();
}

/** Snapshot do navegador (mesma referência enquanto nada muda). */
export function lerConversa(): Mensagem[] {
  if (cache === null) cache = carregar();
  return cache;
}

/** Snapshot do servidor e da hidratação: sempre vazio. */
export const conversaNoServidor = (): Mensagem[] => VAZIA;

export function assinarConversa(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function atualizarConversa(mudar: (atual: Mensagem[]) => Mensagem[]): void {
  cache = mudar(lerConversa()).slice(-MAX_MENSAGENS);
  try {
    window.sessionStorage.setItem(CHAVE_STORAGE, JSON.stringify(paraGuardar(cache)));
  } catch {
    // Sem storage: a conversa continua em memória até fechar a aba.
  }
  avisar();
}

export const adicionarMensagem = (mensagem: Mensagem) =>
  atualizarConversa((atual) => [...atual, mensagem]);

/** Marca um lançamento como desfeito na mensagem que o criou. */
export const marcarDesfeito = (mensagemId: string, lancamentoId: string) =>
  atualizarConversa((atual) =>
    atual.map((m) =>
      m.id === mensagemId && m.autor === "meiva" && m.tipo === "resposta" && !m.desfeitos.includes(lancamentoId)
        ? { ...m, desfeitos: [...m.desfeitos, lancamentoId] }
        : m,
    ),
  );

/** "Nova conversa": limpa a tela e o storage (não apaga lançamentos). */
export function limparConversa(): void {
  cache = VAZIA;
  try {
    window.sessionStorage.removeItem(CHAVE_STORAGE);
  } catch {
    // ignora
  }
  avisar();
}
