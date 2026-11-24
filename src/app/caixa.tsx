"use client";

import { useEffect, useState, type FormEvent } from "react";
import { formatarCentavos, rotuloForma, rotuloTipo } from "@/lib/formatacao";
import type { Resumo } from "@/lib/lancamentos/saldo";
import type {
  LancamentoSalvo,
  RespostaErro,
  RespostaInterpret,
  RespostaListagem,
} from "@/lib/lancamentos/tipos";

const MAX_CARACTERES = 500;

type Retorno =
  | { tipo: "registrado"; lancamentos: LancamentoSalvo[] }
  | { tipo: "pergunta"; texto: string }
  | { tipo: "erro"; texto: string };

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

const buscarDia = () => chamarApi<RespostaListagem>("/api/lancamentos", { cache: "no-store" });

const mensagemDe = (e: unknown, padrao: string) => (e instanceof Error ? e.message : padrao);

export function Caixa() {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [retorno, setRetorno] = useState<Retorno | null>(null);
  const [dia, setDia] = useState<RespostaListagem | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);

  // setState só nos callbacks da promise (nunca síncrono no corpo do effect).
  useEffect(() => {
    let ativo = true;
    buscarDia().then(
      (dados) => {
        if (!ativo) return;
        setDia(dados);
        setErroLista(null);
      },
      (e) => ativo && setErroLista(mensagemDe(e, "Falha ao carregar.")),
    );
    return () => {
      ativo = false;
    };
  }, []);

  async function recarregarDia() {
    try {
      setDia(await buscarDia());
      setErroLista(null);
    } catch (e) {
      setErroLista(mensagemDe(e, "Falha ao carregar."));
    }
  }

  async function registrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const frase = texto.trim();
    if (!frase || enviando) return;

    setEnviando(true);
    setRetorno(null);
    try {
      const res = await chamarApi<RespostaInterpret>("/api/interpret", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ texto: frase }),
      });
      if (res.status === "precisa_confirmar") {
        setRetorno({ tipo: "pergunta", texto: res.pergunta });
      } else {
        setRetorno({ tipo: "registrado", lancamentos: res.lancamentos });
        setTexto("");
        await recarregarDia();
      }
    } catch (err) {
      setRetorno({ tipo: "erro", texto: mensagemDe(err, "Erro inesperado.") });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={registrar} className="flex flex-col gap-3">
        <label htmlFor="texto" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          O que aconteceu no caixa?
        </label>
        <textarea
          id="texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={MAX_CARACTERES}
          rows={3}
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
            {enviando ? "Registrando…" : "Registrar"}
          </button>
        </div>
      </form>

      {retorno && <MensagemRetorno retorno={retorno} />}

      <section aria-labelledby="resumo-titulo" className="flex flex-col gap-3">
        <h2 id="resumo-titulo" className="text-lg font-semibold">
          Hoje
        </h2>
        {erroLista && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {erroLista}
          </p>
        )}
        {dia ? (
          <>
            <PainelResumo resumo={dia.resumo} />
            <ListaLancamentos lancamentos={dia.lancamentos} />
          </>
        ) : (
          !erroLista && <p className="text-sm text-zinc-500">Carregando…</p>
        )}
      </section>
    </div>
  );
}

function MensagemRetorno({ retorno }: { retorno: Retorno }) {
  if (retorno.tipo === "erro") {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
        {retorno.texto}
      </p>
    );
  }
  if (retorno.tipo === "pergunta") {
    return (
      <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
        <strong className="font-semibold">Preciso confirmar: </strong>
        {retorno.texto}
      </p>
    );
  }
  return (
    <div role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
      <p className="font-semibold">
        {retorno.lancamentos.length === 1 ? "Registrado:" : `${retorno.lancamentos.length} lançamentos registrados:`}
      </p>
      <ul className="mt-1 list-disc pl-5">
        {retorno.lancamentos.map((l) => (
          <li key={l.id}>
            {rotuloTipo(l.tipo)} de {formatarCentavos(l.valor_centavos)} — {l.descricao} ({rotuloForma(l.forma_pagamento)})
          </li>
        ))}
      </ul>
    </div>
  );
}

function PainelResumo({ resumo }: { resumo: Resumo }) {
  const itens = [
    { rotulo: "Saldo", valor: resumo.saldo, cor: resumo.saldo < 0 ? "text-red-700 dark:text-red-400" : "text-zinc-900 dark:text-zinc-50" },
    { rotulo: "Entradas", valor: resumo.entradas, cor: "text-emerald-700 dark:text-emerald-400" },
    { rotulo: "Saídas", valor: resumo.saidas, cor: "text-red-700 dark:text-red-400" },
    { rotulo: "A receber", valor: resumo.aReceber, cor: "text-amber-700 dark:text-amber-400" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3">
      {itens.map((i) => (
        <div key={i.rotulo} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <dt className="text-xs text-zinc-500">{i.rotulo}</dt>
          <dd className={`text-lg font-semibold tabular-nums ${i.cor}`}>{formatarCentavos(i.valor)}</dd>
        </div>
      ))}
    </dl>
  );
}

function ListaLancamentos({ lancamentos }: { lancamentos: LancamentoSalvo[] }) {
  if (lancamentos.length === 0) {
    return <p className="text-sm text-zinc-500">Nenhum lançamento hoje.</p>;
  }
  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {lancamentos.map((l) => (
        <li key={l.id} className="flex items-start justify-between gap-3 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{l.descricao}</p>
            <p className="text-xs text-zinc-500">
              {rotuloTipo(l.tipo)} · {rotuloForma(l.forma_pagamento)}
            </p>
          </div>
          <span
            className={`shrink-0 text-sm font-semibold tabular-nums ${
              l.forma_pagamento === "fiado"
                ? "text-amber-700 dark:text-amber-400"
                : l.tipo === "entrada"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-700 dark:text-red-400"
            }`}
          >
            {l.tipo === "saida" ? "−" : "+"}
            {formatarCentavos(l.valor_centavos)}
          </span>
        </li>
      ))}
    </ul>
  );
}
