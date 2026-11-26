import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { IconeEntrada, IconeFiado, IconeSaida } from "@/components/icones";
import { LinhaLancamento, SeloAReceber } from "@/components/lancamento/linha";
import { BotaoPrincipal, BotaoSecundario, Carregando, Pagina, Vazio } from "@/components/pagina";
import { inicioDoPeriodo, legendaDoPeriodo, lerPeriodo, PERIODOS, type Periodo } from "@/lib/dados/periodo";
import { repositorioDasPaginas } from "@/lib/dados/repositorio";
import { hojeBR } from "@/lib/datas";
import { formatarCentavos } from "@/lib/formatacao";
import { montarResumoCaixa } from "@/lib/lancamentos/resumo";
import { calcularSaldo } from "@/lib/lancamentos/saldo";

export const metadata: Metadata = {
  title: "Resumo",
  description: "Quanto tem no caixa, o que entrou, o que saiu e quanto falta receber.",
};

export default function PaginaResumo({ searchParams }: PageProps<"/resumo">) {
  return (
    <Pagina
      titulo="Resumo"
      descricao="Como está o dinheiro do seu negócio."
      acao={<BotaoPrincipal href="/">Anotar uma venda</BotaoPrincipal>}
    >
      <Suspense fallback={<Carregando texto="Somando o seu caixa…" />}>
        <ConteudoResumo searchParams={searchParams} />
      </Suspense>
    </Pagina>
  );
}

async function ConteudoResumo({ searchParams }: Pick<PageProps<"/resumo">, "searchParams">) {
  await connection();
  const periodo = lerPeriodo((await searchParams).periodo);
  const repo = repositorioDasPaginas();
  const hoje = hojeBR();

  const [caixa, doPeriodo, ultimos] = await Promise.all([
    montarResumoCaixa(repo, hoje),
    repo.listar({ de: inicioDoPeriodo(periodo, hoje), ate: hoje }),
    repo.ultimos(6),
  ]);

  if (ultimos.length === 0) {
    return (
      <Vazio
        titulo="Nada anotado ainda"
        texto="Conte a sua primeira venda na Conversa. O resumo aparece aqui na hora."
        acao={<BotaoSecundario href="/">Ir para a Conversa</BotaoSecundario>}
      />
    );
  }

  const periodoSaldo = calcularSaldo(doPeriodo);
  const pessoas = caixa.aReceber.porPessoa.length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8">
      <div className="flex flex-col gap-6">
        <section
          aria-labelledby="caixa-titulo"
          className="flex flex-wrap gap-x-12 gap-y-6 rounded-3xl bg-primaria-suave p-5 sm:p-8"
        >
          <div className="min-w-[min(100%,16rem)] flex-[3_1_0]">
            <h2 id="caixa-titulo" className="text-lg font-bold text-primaria">
              Dinheiro no caixa
            </h2>
            <p
              className={`text-4xl font-bold tabular-nums sm:text-5xl ${caixa.saldoAcumulado < 0 ? "text-saida" : "text-texto"}`}
            >
              {formatarCentavos(caixa.saldoAcumulado)}
            </p>
            <p className="mt-1 text-texto-suave">Tudo que entrou menos tudo que saiu, desde o começo.</p>
          </div>
          <div className="min-w-[min(100%,13rem)] flex-[2_1_0]">
            <h2 className="text-lg font-bold text-primaria">Saldo de hoje</h2>
            <p className={`text-3xl font-bold tabular-nums sm:text-4xl ${caixa.dia.saldo < 0 ? "text-saida" : "text-texto"}`}>
              {formatarCentavos(caixa.dia.saldo)}
            </p>
            <p className="mt-1 text-texto-suave">O que entrou menos o que saiu hoje.</p>
          </div>
        </section>

        <EntrouSaiu periodo={periodo} entradas={periodoSaldo.entradas} saidas={periodoSaldo.saidas} />
      </div>

      <div className="flex flex-col gap-6">
        <section aria-labelledby="receber-titulo" className="rounded-3xl border border-borda bg-superficie p-6">
          <h2 id="receber-titulo" className="flex items-center gap-2 text-lg font-bold">
            <IconeFiado className="size-5 text-fiado" />
            Fiados para receber
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-4xl font-bold tabular-nums text-fiado">
              {formatarCentavos(caixa.aReceber.total)}
            </span>
            {caixa.aReceber.total > 0 && <SeloAReceber />}
          </p>
          <p className="mt-1 text-texto-suave">
            {pessoas === 0
              ? "Ninguém está devendo."
              : pessoas === 1
                ? "1 pessoa está devendo."
                : `${pessoas} pessoas estão devendo.`}
          </p>
          {pessoas > 0 && (
            <Link
              href="/fiados"
              className="mt-3 inline-flex min-h-12 items-center font-bold text-primaria underline underline-offset-4"
            >
              Ver quem deve
            </Link>
          )}
        </section>

        <section aria-labelledby="ultimos-titulo" className="rounded-3xl border border-borda bg-superficie p-6">
          <h2 id="ultimos-titulo" className="text-lg font-bold">
            Últimas anotações
          </h2>
          <ul className="mt-2 divide-y divide-borda">
            {ultimos.map((l) => (
              <li key={l.id}>
                <LinhaLancamento lancamento={l} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/**
 * Entrou e saiu no período, com barras simples. Os valores estão sempre
 * escritos ao lado: a barra só ajuda a comparar, não é a única informação.
 */
function EntrouSaiu({ periodo, entradas, saidas }: { periodo: Periodo; entradas: number; saidas: number }) {
  const maior = Math.max(entradas, saidas, 1);
  const sobra = entradas - saidas;
  const legenda = legendaDoPeriodo(periodo);

  return (
    <section aria-labelledby="periodo-titulo" className="rounded-3xl border border-borda bg-superficie p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="periodo-titulo" className="text-xl font-bold">
          Entrou e saiu
        </h2>
        <nav aria-label="Período" className="flex rounded-2xl bg-fundo p-1">
          {PERIODOS.map((p) => {
            const atual = p.id === periodo;
            return (
              <Link
                key={p.id}
                href={p.id === "hoje" ? "/resumo" : `/resumo?periodo=${p.id}`}
                aria-current={atual ? "true" : undefined}
                scroll={false}
                className={`flex min-h-12 flex-1 items-center justify-center rounded-xl px-2 whitespace-nowrap sm:px-4 transition-colors duration-150 ${
                  atual ? "bg-superficie font-bold text-primaria shadow-[0_0_0_1px_var(--cor-borda-forte)]" : "text-texto-suave hover:text-texto"
                }`}
              >
                {p.rotulo}
              </Link>
            );
          })}
        </nav>
      </div>

      <dl className="mt-6 flex flex-col gap-5">
        <Barra rotulo="Entrou" valor={entradas} sinal="+" proporcao={entradas / maior} cor="bg-entrada" texto="text-entrada" Icone={IconeEntrada} />
        <Barra rotulo="Saiu" valor={saidas} sinal="−" proporcao={saidas / maior} cor="bg-saida" texto="text-saida" Icone={IconeSaida} />
      </dl>

      <p className="mt-6 border-t border-borda pt-4 text-lg">
        {sobra >= 0 ? "Sobrou " : "Faltou "}
        <strong className={`tabular-nums ${sobra < 0 ? "text-saida" : ""}`}>{formatarCentavos(Math.abs(sobra))}</strong>{" "}
        {legenda}.
        <span className="block text-base text-texto-suave">Fiado só conta quando a pessoa paga.</span>
      </p>
    </section>
  );
}

function Barra({
  rotulo,
  valor,
  sinal,
  proporcao,
  cor,
  texto,
  Icone,
}: {
  rotulo: string;
  valor: number;
  sinal: "+" | "−";
  proporcao: number;
  cor: string;
  texto: string;
  Icone: typeof IconeEntrada;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <dt className="flex items-center gap-2">
          <Icone className={`size-5 ${texto}`} />
          {rotulo}
        </dt>
        <dd className={`text-2xl font-bold tabular-nums ${texto}`}>
          {valor > 0 ? sinal : ""}
          {formatarCentavos(valor)}
        </dd>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-fundo" aria-hidden="true">
        <div
          className={`h-full rounded-full ${cor} motion-safe:transition-[width] motion-safe:duration-300`}
          style={{ width: `${Math.round(proporcao * 100)}%` }}
        />
      </div>
    </div>
  );
}
