import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";

/** Uma mensagem do chat (do usuário ou da MEIva). */
export type Mensagem =
  | { id: string; autor: "usuario"; texto: string }
  | {
      id: string;
      autor: "meiva";
      tipo: "registrado";
      lancamentos: LancamentoSalvo[];
      /** true depois que o usuário tocou em "Desfazer". */
      desfeito: boolean;
    }
  | { id: string; autor: "meiva"; tipo: "pergunta" | "erro"; texto: string };

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

export const MAX_MENSAGENS = 10;
export const CHAVE_STORAGE = "meiva:conversa:v1";

const VAZIA: Mensagem[] = [];
let cache: Mensagem[] | null = null;
const ouvintes = new Set<() => void>();

const FORMAS = new Set(["pix", "dinheiro", "cartao", "fiado", "outro", null]);

const ehTexto = (v: unknown): v is string => typeof v === "string";
const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function ehLancamento(v: unknown): boolean {
  return (
    ehObjeto(v) &&
    ehTexto(v.id) &&
    (v.tipo === "entrada" || v.tipo === "saida") &&
    Number.isInteger(v.valor_centavos) &&
    (v.valor_centavos as number) > 0 &&
    ehTexto(v.descricao) &&
    FORMAS.has(v.forma_pagamento as string | null) &&
    ehTexto(v.data)
  );
}

function ehMensagem(v: unknown): v is Mensagem {
  if (!ehObjeto(v) || !ehTexto(v.id)) return false;
  if (v.autor === "usuario") return ehTexto(v.texto);
  if (v.autor !== "meiva") return false;
  if (v.tipo === "pergunta" || v.tipo === "erro") return ehTexto(v.texto);
  return (
    v.tipo === "registrado" &&
    typeof v.desfeito === "boolean" &&
    Array.isArray(v.lancamentos) &&
    v.lancamentos.every(ehLancamento)
  );
}

/** Lê o que veio do storage descartando o que estiver fora do formato. */
export function validarConversa(bruto: unknown): Mensagem[] {
  if (!Array.isArray(bruto)) return VAZIA;
  return bruto.filter(ehMensagem).slice(-MAX_MENSAGENS);
}

/** Erros (ex.: "sem internet") não fazem sentido depois de recarregar. */
const paraGuardar = (mensagens: Mensagem[]) =>
  mensagens.filter((m) => !(m.autor === "meiva" && m.tipo === "erro")).slice(-MAX_MENSAGENS);

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
