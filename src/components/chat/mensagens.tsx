import type { Mensagem } from "@/lib/chat/conversa";
import { IconeAlerta, IconeCerto, IconeDesfazer, IconePergunta } from "./icones";
import { LinhaLancamento } from "./valor";

const BOLHA_MEIVA = "mr-auto w-full max-w-[92%] rounded-2xl rounded-bl-md border px-4 py-3";

type Props = {
  mensagem: Mensagem;
  /** true enquanto o "Desfazer" desta mensagem está em andamento. */
  desfazendo?: boolean;
  onDesfazer?: (mensagemId: string, lancamentoIds: string[]) => void;
};

export function BolhaMensagem({ mensagem, desfazendo = false, onDesfazer }: Props) {
  if (mensagem.autor === "usuario") {
    return (
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primaria px-4 py-3 text-sobre-primaria">
        <span className="sr-only">Você disse: </span>
        <p className="whitespace-pre-wrap break-words">{mensagem.texto}</p>
      </div>
    );
  }

  if (mensagem.tipo === "registrado") {
    const n = mensagem.lancamentos.length;
    const descricoes = mensagem.lancamentos.map((l) => l.descricao).join(", ");
    return (
      <div className={`${BOLHA_MEIVA} border-borda bg-superficie`}>
        <p className="mb-2 flex items-center gap-2 font-semibold">
          <span className="text-entrada">
            <IconeCerto />
          </span>
          <span className="sr-only">MEIva: </span>
          {n === 1 ? "Anotei:" : `Anotei ${n} lançamentos:`}
        </p>
        <ul className="flex flex-col gap-3">
          {mensagem.lancamentos.map((l) => (
            <li key={l.id}>
              <LinhaLancamento lancamento={l} riscado={mensagem.desfeito} />
            </li>
          ))}
        </ul>
        {mensagem.desfeito ? (
          <p className="mt-3 flex items-center gap-2 font-semibold text-texto-suave">
            <IconeDesfazer />
            Desfeito. Não conta mais no caixa.
          </p>
        ) : (
          onDesfazer && (
            <button
              type="button"
              onClick={() => onDesfazer(mensagem.id, mensagem.lancamentos.map((l) => l.id))}
              disabled={desfazendo}
              aria-label={`Desfazer: ${descricoes}`}
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-borda-forte bg-superficie px-4 text-lg font-semibold text-texto hover:bg-fundo disabled:cursor-wait disabled:opacity-60"
            >
              <IconeDesfazer />
              {desfazendo ? "Desfazendo…" : "Desfazer"}
            </button>
          )
        )}
      </div>
    );
  }

  if (mensagem.tipo === "pergunta") {
    return (
      <div className={`${BOLHA_MEIVA} border-aviso bg-aviso-suave`}>
        <p className="flex items-center gap-2 font-semibold text-aviso">
          <IconePergunta />
          <span>
            <span className="sr-only">MEIva: </span>Preciso confirmar
          </span>
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words">{mensagem.texto}</p>
      </div>
    );
  }

  return (
    <div className={`${BOLHA_MEIVA} border-erro bg-erro-suave`}>
      <p className="flex items-start gap-2">
        <span className="text-erro">
          <IconeAlerta />
        </span>
        <span>
          <span className="sr-only">Erro: </span>
          {mensagem.texto}
        </span>
      </p>
    </div>
  );
}

/** Bolha "Anotando…" enquanto a resposta não chega. */
export function BolhaAnotando() {
  return (
    <div className={`${BOLHA_MEIVA} border-borda bg-superficie`} role="status">
      <p className="flex items-center gap-2 text-texto-suave">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-texto-suave motion-safe:animate-pulse" />
          <span className="size-2 rounded-full bg-texto-suave motion-safe:animate-pulse [animation-delay:200ms]" />
          <span className="size-2 rounded-full bg-texto-suave motion-safe:animate-pulse [animation-delay:400ms]" />
        </span>
        Anotando…
      </p>
    </div>
  );
}
