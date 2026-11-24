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
