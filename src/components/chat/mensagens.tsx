import type { Mensagem } from "@/lib/chat/conversa";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";
import { IconeAlerta, IconeDesfazer } from "@/components/icones";
import { LinhaLancamento } from "@/components/lancamento/linha";

const BOLHA_MEIVA = "mr-auto w-full max-w-[36rem] rounded-3xl rounded-bl-lg px-5 py-4";

type Props = {
  mensagem: Mensagem;
  /** Id do lançamento cujo "Desfazer" está em andamento (bloqueia os outros botões). */
  desfazendo?: string | null;
  onDesfazer?: (mensagemId: string, lancamento: LancamentoSalvo) => void;
};

export function BolhaMensagem({ mensagem, desfazendo = null, onDesfazer }: Props) {
  if (mensagem.autor === "usuario") {
    return (
      <div className="ml-auto max-w-[85%] rounded-3xl rounded-br-lg bg-primaria px-5 py-3 text-sobre-primaria sm:max-w-[28rem]">
        <span className="sr-only">Você: </span>
        <p className="whitespace-pre-wrap break-words">{mensagem.texto}</p>
      </div>
    );
  }

  if (mensagem.tipo === "resposta") {
    const { lancamentos, desfeitos } = mensagem;
    return (
      <div className={`${BOLHA_MEIVA} border border-borda bg-superficie`}>
        <p className="whitespace-pre-wrap break-words">
          <span className="sr-only">MEIva: </span>
          {mensagem.texto}
        </p>
        {lancamentos.length > 0 && (
          <ul
            className="mt-3 divide-y divide-borda border-t border-borda"
            aria-label={lancamentos.length === 1 ? "Anotado" : `${lancamentos.length} anotações`}
          >
            {lancamentos.map((l) => {
              const desfeito = desfeitos.includes(l.id);
              return (
                <li key={l.id} className="motion-safe:animate-entrar">
                  <LinhaLancamento
                    lancamento={l}
                    riscado={desfeito}
                    acao={
                      !desfeito &&
                      onDesfazer && (
                        <button
                          type="button"
                          onClick={() => onDesfazer(mensagem.id, l)}
                          disabled={desfazendo !== null}
                          aria-label={`Desfazer: ${l.descricao}`}
                          className="-mr-2 flex min-h-12 items-center gap-1 rounded-lg px-2 text-texto-suave underline-offset-4 hover:text-texto hover:underline disabled:cursor-wait"
                        >
                          <IconeDesfazer className="size-5" />
                          {desfazendo === l.id ? "Desfazendo…" : "Desfazer"}
                        </button>
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  if (mensagem.tipo === "desfeito") {
    return (
      <p className="mr-auto flex max-w-[36rem] items-start gap-2 px-2 text-texto-suave">
        <IconeDesfazer className="mt-0.5 size-5" />
        <span>
          <span className="sr-only">MEIva: </span>
          {mensagem.texto}
        </span>
      </p>
    );
  }

  return (
    <div className={`${BOLHA_MEIVA} border border-erro bg-erro-suave`}>
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

/** Bolha enquanto a resposta não chega. */
export function BolhaAnotando() {
  return (
    <div className={`${BOLHA_MEIVA} border border-borda bg-superficie`} role="status">
      <p className="flex items-center gap-3 text-texto-suave">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse" />
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse [animation-delay:200ms]" />
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse [animation-delay:400ms]" />
        </span>
        Anotando…
      </p>
    </div>
  );
}
