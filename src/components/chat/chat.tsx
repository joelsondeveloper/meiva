"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
} from "react";
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
import type { LancamentoSalvo, RespostaListagem } from "@/lib/lancamentos/tipos";
import { BoasVindas } from "./boas-vindas";
import { IconeEnviar } from "./icones";
import { BolhaAnotando, BolhaMensagem } from "./mensagens";
import { ResumoDoDia } from "./resumo-do-dia";

const MAX_CARACTERES = 500;
/** O contador só aparece perto do limite, para não poluir a tela. */
const MOSTRAR_CONTADOR_A_PARTIR_DE = 400;

export function Chat() {
  // Conversa vem do sessionStorage (vazia no servidor e na hidratação).
  const mensagens = useSyncExternalStore(assinarConversa, lerConversa, conversaNoServidor);
  const [texto, setTexto] = useState("");
  const [anotando, setAnotando] = useState(false);
  const [dia, setDia] = useState<RespostaListagem | null>(null);
  const [erroDia, setErroDia] = useState<string | null>(null);
  /** Id do lançamento cujo "Desfazer" está em andamento. */
  const [desfazendo, setDesfazendo] = useState<string | null>(null);

  const campoRef = useRef<HTMLTextAreaElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  /** O resumo chega junto com cada resposta; a lista do dia vem depois, no GET. */
  function atualizarResumo(resumo: ResumoCaixa) {
    setDia((atual) => (atual ? { ...atual, resumo } : atual));
  }

  async function recarregarDia() {
    try {
      setDia(await buscarDia());
      setErroDia(null);
    } catch (e) {
      setErroDia(textoDoErro(e));
    }
  }

  // setState só nos callbacks da promise (nunca síncrono no corpo do effect).
  useEffect(() => {
    let ativo = true;
    buscarDia().then(
      (dados) => {
        if (!ativo) return;
        setDia(dados);
        setErroDia(null);
      },
      (e) => ativo && setErroDia(textoDoErro(e)),
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

  function preencherExemplo(frase: string) {
    setTexto(frase);
    campoRef.current?.focus();
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
      atualizarResumo(res.resumo);
      // A IA também pode ter corrigido ou desfeito algo: recarrega a lista do dia.
      void recarregarDia();
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
      atualizarResumo(res.resumo);
      void recarregarDia();
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
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <header className="border-b border-borda bg-superficie px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="flex min-h-12 items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">MEIva</h1>
          {mensagens.length > 0 && (
            <button
              type="button"
              onClick={novaConversa}
              disabled={anotando || desfazendo !== null}
              className="min-h-11 rounded-lg border border-borda-forte px-3 font-medium hover:bg-fundo disabled:opacity-60"
            >
              Nova conversa
            </button>
          )}
        </div>
        <ResumoDoDia dia={dia} erro={erroDia} onTentarDeNovo={() => void recarregarDia()} />
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {vazio ? (
          <BoasVindas onEscolher={preencherExemplo} />
        ) : (
          <div role="log" aria-label="Conversa">
            <ol className="flex flex-col gap-3">
              {mensagens.map((m) => (
                <li key={m.id} className="flex">
                  <BolhaMensagem mensagem={m} desfazendo={desfazendo} onDesfazer={desfazer} />
                </li>
              ))}
              {anotando && (
                <li className="flex">
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
        className="border-t border-borda bg-superficie px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
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
            className="max-h-40 min-h-12 flex-1 resize-none rounded-xl border border-borda-forte bg-superficie px-3 py-2.5 text-lg text-texto [field-sizing:content] placeholder:text-texto-suave"
          />
          <button
            type="submit"
            disabled={anotando || !texto.trim()}
            className="flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl bg-primaria px-4 text-lg font-semibold text-sobre-primaria hover:bg-primaria-forte disabled:cursor-not-allowed disabled:opacity-60"
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
  );
}
