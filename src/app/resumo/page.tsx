import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { IconeAvancar, IconeEntrada, IconeFiado, IconeSaida } from "@/components/icones";
import { LinhaLancamento, SeloAReceber } from "@/components/lancamento/linha";
import { BotaoPrincipal, BotaoSecundario, Carregando, Pagina, Vazio } from "@/components/pagina";
import { Valor } from "@/components/valor";
import { inicioDoPeriodo, legendaDoPeriodo, lerPeriodo, PERIODOS, type Periodo } from "@/lib/dados/periodo";
import { repositorioDasPaginas } from "@/lib/dados/repositorio";
import { hojeBR } from "@/lib/datas";
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
      acao={
        <div className="hidden sm:block">
          <BotaoPrincipal href="/">Anotar uma venda</BotaoPrincipal>
        </div>
      }
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
      <div className="flex flex-col gap-8">
        {/* O único bloco de cor cheia do app: o dinheiro que a pessoa tem. */}
        <section aria-labelledby="caixa-titulo" className="rounded-bloco bg-heroi p-6 text-sobre-heroi sm:p-8">
          <h2 id="caixa-titulo" className="text-lg font-bold text-heroi-suave">
            Dinheiro no caixa
          </h2>
          <p className="mt-1 text-5xl font-bold lg:text-[3rem]">
            <Valor centavos={Math.abs(caixa.saldoAcumulado)} sinal={caixa.saldoAcumulado < 0 ? "−" : ""} destaque />
          </p>
          <p className="mt-2 text-heroi-suave">Tudo que entrou menos tudo que saiu, desde o começo.</p>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-3 border-t border-heroi-suave/40 pt-4 text-lg">
            <span>Saldo de hoje</span>
            <Valor
              centavos={Math.abs(caixa.dia.saldo)}
              sinal={caixa.dia.saldo > 0 ? "+" : caixa.dia.saldo < 0 ? "−" : ""}
              className="text-2xl font-bold"
            />
          </p>
        </section>

        {/* No celular o botão vem depois do saldo: primeiro a pessoa vê quanto tem. */}
        <div className="sm:hidden [&>a]:w-full">
          <BotaoPrincipal href="/">Anotar uma venda</BotaoPrincipal>
        </div>

        <EntrouSaiu periodo={periodo} entradas={periodoSaldo.entradas} saidas={periodoSaldo.saidas} />
      </div>

      <div className="flex flex-col gap-8">
        <section aria-labelledby="receber-titulo">
          <h2 id="receber-titulo" className="flex items-center gap-2 text-xl font-bold">
            <IconeFiado className="size-6 text-fiado" />
            Fiados para receber
          </h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Valor centavos={caixa.aReceber.total} className="text-4xl font-bold text-fiado" />
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
              className="mt-1 -ml-2 inline-flex min-h-12 items-center gap-1 rounded-controle px-2 font-bold text-primaria underline underline-offset-4 transition-colors duration-150 hover:bg-primaria-suave"
            >
              Ver quem deve
              <IconeAvancar className="size-5" />
            </Link>
          )}
        </section>

        <section aria-labelledby="ultimos-titulo" className="border-t border-borda pt-6">
          <h2 id="ultimos-titulo" className="text-xl font-bold">
            Últimas anotações
          </h2>
          <ul className="mt-1 divide-y divide-borda">
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
    <section aria-labelledby="periodo-titulo">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="periodo-titulo" className="text-xl font-bold">
          Entrou e saiu
        </h2>
        <nav aria-label="Período" className="flex border-b border-borda">
          {PERIODOS.map((p) => {
            const atual = p.id === periodo;
            return (
              <Link
                key={p.id}
                href={p.id === "hoje" ? "/resumo" : `/resumo?periodo=${p.id}`}
                aria-current={atual ? "true" : undefined}
                scroll={false}
                className={`-mb-px flex min-h-12 flex-1 items-center justify-center border-b-[3px] px-3 whitespace-nowrap transition-colors duration-150 sm:flex-none sm:px-4 ${
                  atual ? "border-primaria font-bold text-primaria" : "border-transparent text-texto-suave hover:text-texto"
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
        <Valor centavos={Math.abs(sobra)} className={`font-bold ${sobra < 0 ? "text-saida" : ""}`} />{" "}
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
        <dd className={`text-2xl font-bold ${texto}`}>
          <Valor centavos={valor} sinal={valor > 0 ? sinal : ""} />
        </dd>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-borda" aria-hidden="true">
        {/* Escala em vez de largura: anima só transform (mais leve) ao trocar o período. */}
        <div
          data-sem-movimento-reduzido
          className={`h-full origin-left rounded-full ${cor} transition-[scale] duration-[250ms] ease-[var(--ease-movimento)]`}
          style={{ scale: `${Math.round(proporcao * 1000) / 1000} 1` }}
        />
      </div>
    </div>
  );
}
