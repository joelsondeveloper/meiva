import type { Mensagem } from "@/lib/chat/conversa";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";
import { IconeAlerta, IconeCerto, IconeDesfazer } from "./icones";
import { LinhaLancamento } from "./valor";

const BOLHA_MEIVA = "mr-auto w-full max-w-[92%] rounded-2xl rounded-bl-md border px-4 py-3";

type Props = {
  mensagem: Mensagem;
  /** Id do lançamento cujo "Desfazer" está em andamento (bloqueia os outros botões). */
  desfazendo?: string | null;
  onDesfazer?: (mensagemId: string, lancamento: LancamentoSalvo) => void;
};

export function BolhaMensagem({ mensagem, desfazendo = null, onDesfazer }: Props) {
  if (mensagem.autor === "usuario") {
    return (
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primaria px-4 py-3 text-sobre-primaria">
        <span className="sr-only">Você disse: </span>
        <p className="whitespace-pre-wrap break-words">{mensagem.texto}</p>
      </div>
    );
  }

  if (mensagem.tipo === "resposta") {
    const { lancamentos, desfeitos } = mensagem;
    return (
      <div className={`${BOLHA_MEIVA} border-borda bg-superficie`}>
        <p className="whitespace-pre-wrap break-words">
          <span className="sr-only">MEIva: </span>
          {mensagem.texto}
        </p>
        {lancamentos.length > 0 && (
          <div className="mt-3 border-t border-borda pt-3">
            <p className="mb-2 flex items-center gap-2 font-semibold">
              <span className="text-entrada">
                <IconeCerto />
              </span>
              {lancamentos.length === 1 ? "Anotei:" : `Anotei ${lancamentos.length} lançamentos:`}
            </p>
            <ul className="flex flex-col gap-4">
              {lancamentos.map((l) => {
                const desfeito = desfeitos.includes(l.id);
                return (
                  <li key={l.id} className="flex flex-col gap-2">
                    <LinhaLancamento lancamento={l} riscado={desfeito} />
                    {desfeito ? (
                      <p className="flex items-center gap-2 font-semibold text-texto-suave">
                        <IconeDesfazer />
                        Desfeito. Não conta mais no caixa.
                      </p>
                    ) : (
                      onDesfazer && (
                        <button
                          type="button"
                          onClick={() => onDesfazer(mensagem.id, l)}
                          disabled={desfazendo !== null}
                          aria-label={`Desfazer: ${l.descricao}`}
                          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-borda-forte bg-superficie px-4 text-lg font-semibold text-texto hover:bg-fundo disabled:cursor-wait disabled:opacity-60"
                        >
                          <IconeDesfazer />
                          {desfazendo === l.id ? "Desfazendo…" : "Desfazer"}
                        </button>
                      )
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (mensagem.tipo === "desfeito") {
    return (
      <div className={`${BOLHA_MEIVA} border-borda bg-fundo`}>
        <p className="flex items-start gap-2 text-texto-suave">
          <IconeDesfazer />
          <span>
            <span className="sr-only">MEIva: </span>
            {mensagem.texto}
          </span>
        </p>
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
        Pensando…
      </p>
    </div>
  );
}
