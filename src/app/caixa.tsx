"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { formatarCentavos, rotuloForma } from "@/lib/formatacao";
import type { ResumoCaixa } from "@/lib/lancamentos/saldo";
import type {
  LancamentoSalvo,
  MensagemChat,
  RespostaDesfazer,
  RespostaErro,
  RespostaInterpret,
  RespostaListagem,
} from "@/lib/lancamentos/tipos";

const MAX_CARACTERES = 500;
/** Quantas mensagens do histórico vão para a API (a IA não precisa de mais). */
const HISTORICO_ENVIADO = 10;

type ItemChat = MensagemChat & {
  id: number;
  /** Lançamentos criados por esta resposta da MEIva. */
  criados?: LancamentoSalvo[];
};

async function lerJson<T>(res: Response): Promise<T> {
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok || json === null) {
    const msg =
      typeof json === "object" && json !== null && "error" in json
        ? String((json as RespostaErro).error)
        : `Erro ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

/** fetch + lerJson; falha de rede vira mensagem em português (o navegador dá "Failed to fetch"). */
async function chamarApi<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("Sem conexão com o servidor. Verifique a internet e tente de novo.");
  }
  return lerJson<T>(res);
}

const postJson = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const buscarDia = () => chamarApi<RespostaListagem>("/api/lancamentos", { cache: "no-store" });

const mensagemDe = (e: unknown, padrao: string) => (e instanceof Error ? e.message : padrao);

const descreverLancamento = (l: LancamentoSalvo) =>
  `${l.descricao} — ${formatarCentavos(l.valor_centavos)} (${rotuloForma(l.forma_pagamento)})`;

let proximoId = 1;

export function Caixa() {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [chat, setChat] = useState<ItemChat[]>([]);
  const [desfeitos, setDesfeitos] = useState<ReadonlySet<string>>(new Set());
  const [desfazendo, setDesfazendo] = useState(false);
  const [resumo, setResumo] = useState<ResumoCaixa | null>(null);
  const [erroResumo, setErroResumo] = useState<string | null>(null);
  const fimDoChat = useRef<HTMLDivElement>(null);

  // setState só nos callbacks da promise (nunca síncrono no corpo do effect).
  useEffect(() => {
    let ativo = true;
    buscarDia().then(
      (dados) => {
        if (!ativo) return;
        setResumo(dados.resumo);
        setErroResumo(null);
      },
      (e) => ativo && setErroResumo(mensagemDe(e, "Falha ao carregar.")),
    );
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    fimDoChat.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.length, enviando]);

  // Último lançamento criado (e não desfeito) na conversa: é ele que o botão desfaz.
  const ultimoCriado = (() => {
    for (let i = chat.length - 1; i >= 0; i--) {
      const vivos = (chat[i].criados ?? []).filter((l) => !desfeitos.has(l.id));
      if (vivos.length > 0) return { itemId: chat[i].id, lancamento: vivos[vivos.length - 1] };
    }
    return null;
  })();

  async function enviar(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    const frase = texto.trim();
    if (!frase || enviando) return;

    const doUsuario: ItemChat = { id: proximoId++, role: "user", content: frase };
    const historico = [...chat, doUsuario]
      .slice(-HISTORICO_ENVIADO)
      .map(({ role, content }) => ({ role, content }));

    setChat((c) => [...c, doUsuario]);
    setTexto("");
    setErroEnvio(null);
    setEnviando(true);
    try {
      const res = await chamarApi<RespostaInterpret>("/api/interpret", postJson({ mensagens: historico }));
      setChat((c) => [
        ...c,
        { id: proximoId++, role: "assistant", content: res.resposta, criados: res.lancamentosCriados },
      ]);
      setResumo(res.resumo);
      setErroResumo(null);
    } catch (err) {
      // A mensagem não foi processada: tira do chat e devolve para a caixa de texto.
      setChat((c) => c.filter((m) => m.id !== doUsuario.id));
      setTexto(frase);
      setErroEnvio(mensagemDe(err, "Erro inesperado."));
    } finally {
      setEnviando(false);
    }
  }

  async function desfazer(lancamento: LancamentoSalvo) {
    if (desfazendo) return;
    setDesfazendo(true);
    setErroEnvio(null);
    try {
      const res = await chamarApi<RespostaDesfazer>(
        `/api/lancamentos/${encodeURIComponent(lancamento.id)}/desfazer`,
        { method: "POST" },
      );
      setDesfeitos((d) => new Set(d).add(lancamento.id));
      setResumo(res.resumo);
      // Fica no histórico para a IA saber que foi desfeito.
      setChat((c) => [
        ...c,
        { id: proximoId++, role: "assistant", content: `Desfeito: ${descreverLancamento(lancamento)}.` },
      ]);
    } catch (err) {
      setErroEnvio(mensagemDe(err, "Não consegui desfazer."));
    } finally {
      setDesfazendo(false);
    }
  }

  function aoTeclar(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envia; Shift+Enter quebra linha (no celular o teclado costuma ter o botão de enviar).
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void enviar();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Conversa com a MEIva" className="flex flex-col gap-3">
        {chat.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-300 p-3 text-sm text-zinc-500 dark:border-zinc-700">
            Conte o que aconteceu no caixa, do seu jeito. Ex.: “vendi 3 blusas a 50 no pix”, “a Maria levou
            uma saia de 80 fiado”, “quanto vendi hoje?”.
          </p>
        )}
        <ol className="flex flex-col gap-2" aria-live="polite">
          {chat.map((m) => (
            <li key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <Balao
                item={m}
                desfeitos={desfeitos}
                desfazivel={ultimoCriado?.itemId === m.id ? ultimoCriado.lancamento : null}
                desfazendo={desfazendo}
                onDesfazer={desfazer}
              />
            </li>
          ))}
          {enviando && (
            <li className="flex justify-start">
              <p role="status" className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-zinc-500 shadow-sm dark:bg-zinc-900">
                MEIva está pensando…
              </p>
            </li>
          )}
        </ol>
        <div ref={fimDoChat} />

        {erroEnvio && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {erroEnvio}
          </p>
        )}

        <form onSubmit={enviar} className="flex flex-col gap-2">
          <label htmlFor="texto" className="sr-only">
            Mensagem para a MEIva
          </label>
          <textarea
            id="texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={aoTeclar}
            maxLength={MAX_CARACTERES}
            rows={2}
            placeholder="Ex.: vendi 3 blusas a 50 no pix e paguei 120 de fornecedor"
            className="w-full resize-none rounded-xl border border-zinc-300 bg-white p-3 text-base text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-500">
              {texto.length}/{MAX_CARACTERES}
            </span>
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              className="h-12 flex-1 rounded-xl bg-emerald-600 px-6 text-base font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="resumo-titulo" className="flex flex-col gap-3">
        <h2 id="resumo-titulo" className="text-lg font-semibold">
          Caixa
        </h2>
        {erroResumo && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {erroResumo}
          </p>
        )}
        {resumo ? <PainelResumo resumo={resumo} /> : !erroResumo && <p className="text-sm text-zinc-500">Carregando…</p>}
      </section>
    </div>
  );
}

function Balao({
  item,
  desfeitos,
  desfazivel,
  desfazendo,
  onDesfazer,
}: {
  item: ItemChat;
  desfeitos: ReadonlySet<string>;
  desfazivel: LancamentoSalvo | null;
  desfazendo: boolean;
  onDesfazer: (l: LancamentoSalvo) => void;
}) {
  if (item.role === "user") {
    return (
      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-emerald-600 px-3 py-2 text-sm text-white">
        {item.content}
      </p>
    );
  }
  const criados = item.criados ?? [];
  return (
    <div className="flex max-w-[85%] flex-col gap-2 rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
      <p className="whitespace-pre-wrap break-words">{item.content}</p>
      {criados.length > 0 && (
        <ul className="flex flex-col gap-1 border-t border-zinc-200 pt-2 text-xs dark:border-zinc-800">
          {criados.map((l) => (
            <li key={l.id} className={desfeitos.has(l.id) ? "text-zinc-400 line-through" : "text-zinc-600 dark:text-zinc-400"}>
              {l.tipo === "saida" ? "−" : "+"} {descreverLancamento(l)}
              {l.pessoa ? ` · ${l.pessoa}` : ""}
            </li>
          ))}
        </ul>
      )}
      {desfazivel && (
        <button
          type="button"
          onClick={() => onDesfazer(desfazivel)}
          disabled={desfazendo}
          className="h-10 self-start rounded-lg border border-zinc-300 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {desfazendo ? "Desfazendo…" : `Desfazer “${desfazivel.descricao}”`}
        </button>
      )}
    </div>
  );
}

function PainelResumo({ resumo }: { resumo: ResumoCaixa }) {
  const corSaldo = (v: number) => (v < 0 ? "text-red-700 dark:text-red-400" : "text-zinc-900 dark:text-zinc-50");
  const itens = [
    { rotulo: "Saldo do dia", valor: resumo.dia.saldo, cor: corSaldo(resumo.dia.saldo) },
    { rotulo: "Saldo acumulado", valor: resumo.saldoAcumulado, cor: corSaldo(resumo.saldoAcumulado) },
  ];
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-3">
        {itens.map((i) => (
          <div key={i.rotulo} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <dt className="text-xs text-zinc-500">{i.rotulo}</dt>
            <dd className={`text-lg font-semibold tabular-nums ${i.cor}`}>{formatarCentavos(i.valor)}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs text-zinc-500">A receber (fiado)</span>
          <span className="text-lg font-semibold tabular-nums text-amber-700 dark:text-amber-400">
            {formatarCentavos(resumo.aReceber.total)}
          </span>
        </div>
        {resumo.aReceber.porPessoa.length === 0 ? (
          <p className="mt-1 text-sm text-zinc-500">Ninguém está devendo.</p>
        ) : (
          <ul className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
            {resumo.aReceber.porPessoa.map((d) => (
              <li key={d.pessoa} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate">{d.pessoa}</span>
                <span className="shrink-0 font-medium tabular-nums">{formatarCentavos(d.valor_centavos)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
