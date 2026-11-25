"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { IconeEnviar, IconeSaldo } from "@/components/icones";
import { Marca } from "@/components/marca";
import { buscarDia, desfazerLancamento, enviarMensagens, textoDoErro } from "@/lib/chat/api";
import {
  adicionarMensagem as adicionar,
  assinarConversa,
  atualizarConversa,
  conversaNoServidor,
  historicoParaApi,
  lerConversa,
  limparConversa,
  marcarDesfeito,
  novoId,
} from "@/lib/chat/conversa";
import { formatarCentavos } from "@/lib/formatacao";
import type { ResumoCaixa } from "@/lib/lancamentos/saldo";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";
import { BoasVindas } from "./boas-vindas";
import { BolhaAnotando, BolhaMensagem } from "./mensagens";
import { PainelCaixa } from "./painel-caixa";

const MAX_CARACTERES = 500;
/** O contador só aparece perto do limite, para não poluir a tela. */
const MOSTRAR_CONTADOR_A_PARTIR_DE = 400;

export function Chat() {
  // Conversa vem do sessionStorage (vazia no servidor e na hidratação).
  const mensagens = useSyncExternalStore(assinarConversa, lerConversa, conversaNoServidor);
  const [texto, setTexto] = useState("");
  const [anotando, setAnotando] = useState(false);
  const [resumo, setResumo] = useState<ResumoCaixa | null>(null);
  const [erroResumo, setErroResumo] = useState<string | null>(null);
  /** Id do lançamento cujo "Desfazer" está em andamento. */
  const [desfazendo, setDesfazendo] = useState<string | null>(null);

  const campoRef = useRef<HTMLTextAreaElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  function mostrarResumo(novo: ResumoCaixa) {
    setResumo(novo);
    setErroResumo(null);
  }

  async function recarregarResumo() {
    try {
      mostrarResumo((await buscarDia()).resumo);
    } catch (e) {
      setErroResumo(textoDoErro(e));
    }
  }

  // setState só nos callbacks da promise (nunca síncrono no corpo do effect).
  useEffect(() => {
    let ativo = true;
    buscarDia().then(
      (dados) => ativo && mostrarResumo(dados.resumo),
      (e) => ativo && setErroResumo(textoDoErro(e)),
    );
    return () => {
      ativo = false;
    };
  }, []);

  // Mantém a última mensagem (ou o "Anotando…") à vista. Usa o id da última
  // mensagem, e não o tamanho da lista: com o limite de 10, o tamanho para de mudar.
  const ultimaId = mensagens.at(-1)?.id;
  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: "end" });
  }, [ultimaId, anotando]);

  function preencher(frase: string) {
    setTexto(frase);
    const campo = campoRef.current;
    if (!campo) return;
    campo.focus();
    // Cursor no fim, para a pessoa completar a frase (ex.: "Marta pagou ").
    requestAnimationFrame(() => campo.setSelectionRange(frase.length, frase.length));
  }

  async function enviar(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    const frase = texto.trim();
    if (!frase || anotando) return;

    const doUsuario = { id: novoId(), autor: "usuario", texto: frase } as const;
    adicionar(doUsuario);
    setTexto("");
    setAnotando(true);
    try {
      const res = await enviarMensagens(historicoParaApi(lerConversa()));
      adicionar({
        id: novoId(),
        autor: "meiva",
        tipo: "resposta",
        texto: res.resposta,
        lancamentos: res.lancamentosCriados,
        desfeitos: [],
      });
      mostrarResumo(res.resumo);
    } catch (err) {
      // Não foi processada: sai do histórico (senão iria duas vezes ao reenviar).
      atualizarConversa((atual) => atual.filter((m) => m.id !== doUsuario.id));
      adicionar({ id: novoId(), autor: "meiva", tipo: "erro", texto: textoDoErro(err) });
      // Devolve a frase ao campo para tentar de novo com um toque.
      setTexto((atual) => atual || frase);
    } finally {
      setAnotando(false);
    }
  }

  async function desfazer(mensagemId: string, lancamento: LancamentoSalvo) {
    if (desfazendo) return;
    setDesfazendo(lancamento.id);
    try {
      const res = await desfazerLancamento(lancamento.id);
      marcarDesfeito(mensagemId, lancamento.id);
      adicionar({
        id: novoId(),
        autor: "meiva",
        tipo: "desfeito",
        texto: `Desfeito: ${lancamento.descricao} (${formatarCentavos(lancamento.valor_centavos)}). Não conta mais no caixa.`,
      });
      mostrarResumo(res.resumo);
    } catch (err) {
      adicionar({ id: novoId(), autor: "meiva", tipo: "erro", texto: textoDoErro(err) });
    } finally {
      setDesfazendo(null);
    }
  }

  function novaConversa() {
    limparConversa();
    setTexto("");
    campoRef.current?.focus();
  }

  function aoTeclar(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envia; Shift+Enter quebra a linha. Não envia no meio de uma composição (IME).
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void enviar();
    }
  }

  const vazio = mensagens.length === 0 && !anotando;

  return (
    <div className="mx-auto flex h-[calc(100dvh-var(--altura-abas))] w-full max-w-[75rem] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] lg:h-dvh">
      <Suspense fallback={null}>
        <FraseDaUrl onFrase={preencher} />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-borda bg-superficie px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-3 sm:px-6 lg:px-8 lg:pt-8 lg:pb-5">
          <div className="flex min-h-12 items-center justify-between gap-3 lg:hidden">
            <Marca />
            <Link
              href="/resumo"
              className="flex min-h-12 items-center gap-2 rounded-full border border-borda-forte px-4"
            >
              <IconeSaldo className="size-5 text-primaria" />
              <span>
                Hoje{" "}
                <strong className={`tabular-nums ${resumo && resumo.dia.saldo < 0 ? "text-saida" : ""}`}>
                  {resumo ? formatarCentavos(resumo.dia.saldo) : "…"}
                </strong>
              </span>
            </Link>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">Conversa</h1>
              <p className={`text-texto-suave ${vazio ? "" : "hidden lg:block"}`}>
                Conte o que vendeu, gastou ou recebeu.
              </p>
            </div>
            {mensagens.length > 0 && (
              <button
                type="button"
                onClick={novaConversa}
                disabled={anotando || desfazendo !== null}
                className="min-h-12 shrink-0 rounded-2xl px-3 font-bold text-primaria hover:bg-primaria-suave disabled:opacity-60"
              >
                Nova conversa
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 lg:px-8">
          {vazio ? (
            <BoasVindas onEscolher={preencher} />
          ) : (
            <div role="log" aria-label="Conversa">
              <ol className="flex flex-col gap-4">
                {mensagens.map((m) => (
                  <li key={m.id} className="flex motion-safe:animate-entrar">
                    <BolhaMensagem mensagem={m} desfazendo={desfazendo} onDesfazer={desfazer} />
                  </li>
                ))}
                {anotando && (
                  <li className="flex motion-safe:animate-entrar">
                    <BolhaAnotando />
                  </li>
                )}
              </ol>
            </div>
          )}
          <div ref={fimRef} />
        </main>

        <form
          onSubmit={enviar}
          aria-label="Escrever mensagem"
          className="border-t border-borda bg-superficie px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pb-6"
        >
          <label htmlFor="mensagem" className="sr-only">
            O que aconteceu no caixa?
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="mensagem"
              ref={campoRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={aoTeclar}
              maxLength={MAX_CARACTERES}
              rows={1}
              enterKeyHint="send"
              autoComplete="off"
              placeholder="Escreva aqui…"
              className="max-h-40 min-h-14 flex-1 resize-none rounded-2xl border border-borda-forte bg-fundo px-4 py-3 text-lg text-texto [field-sizing:content] placeholder:text-texto-suave"
            />
            <button
              type="submit"
              disabled={anotando || !texto.trim()}
              className="flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-2xl bg-acento px-5 text-lg font-bold text-sobre-acento transition-[background-color,scale] duration-150 hover:bg-acento-forte active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconeEnviar className="size-5" />
              Enviar
            </button>
          </div>
          {texto.length >= MOSTRAR_CONTADOR_A_PARTIR_DE && (
            <p className="mt-1 text-right text-texto-suave" aria-live="polite">
              {texto.length} de {MAX_CARACTERES} letras
            </p>
          )}
        </form>
      </div>

      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-borda bg-superficie lg:block xl:w-96">
        <PainelCaixa resumo={resumo} erro={erroResumo} onTentarDeNovo={() => void recarregarResumo()} />
      </aside>
    </div>
  );
}

/**
 * Preenche o campo com ?frase= (ex.: o botão "Registrar pagamento" dos Fiados
 * leva para "/?frase=Marta pagou "). Só preenche: quem envia é a pessoa.
 */
function FraseDaUrl({ onFrase }: { onFrase: (frase: string) => void }) {
  const frase = useSearchParams().get("frase");
  const aplicada = useRef<string | null>(null);
  useEffect(() => {
    if (!frase || aplicada.current === frase) return;
    aplicada.current = frase;
    onFrase(frase.slice(0, MAX_CARACTERES));
  }, [frase, onFrase]);
  return null;
}
