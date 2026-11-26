import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { IconeAvancar, IconeVoltar } from "@/components/icones";
import { LinhaLancamento } from "@/components/lancamento/linha";
import { BotaoPrincipal, BotaoSecundario, Carregando, Pagina, Vazio } from "@/components/pagina";
import { Valor } from "@/components/valor";
import { dataPorExtenso } from "@/lib/dados/periodo";
import { repositorioDasPaginas } from "@/lib/dados/repositorio";
import { normalizarPessoa } from "@/lib/lancamentos/pessoa";
import { calcularAReceber, type DevedorResumo } from "@/lib/lancamentos/saldo";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";

export const metadata: Metadata = {
  title: "Fiados",
  description: "Quem comprou fiado e quanto falta receber de cada pessoa.",
};

export default function PaginaFiados({ searchParams }: PageProps<"/fiados">) {
  return (
    <Pagina titulo="Fiados" descricao="Quem comprou fiado e quanto falta receber.">
      <Suspense fallback={<Carregando texto="Procurando quem deve…" />}>
        <ConteudoFiados searchParams={searchParams} />
      </Suspense>
    </Pagina>
  );
}

/** Mesmo agrupamento do calcularAReceber: fiado sem pessoa vira "Sem nome". */
const chaveDe = (nome: string | null) => normalizarPessoa(nome?.trim() || "Sem nome");

type Devedor = DevedorResumo & { chave: string; historico: LancamentoSalvo[]; compras: number };

async function ConteudoFiados({ searchParams }: Pick<PageProps<"/fiados">, "searchParams">) {
  await connection();
  const param = (await searchParams).pessoa;
  const escolhida = typeof param === "string" ? param : null;

  const fiados = await repositorioDasPaginas().listarFiados();
  const { total, porPessoa } = calcularAReceber(fiados);

  if (porPessoa.length === 0) {
    return (
      <Vazio
        titulo="Ninguém está devendo. Que bom!"
        texto="Quando alguém levar algo fiado, a pessoa aparece aqui com o valor que falta receber."
        acao={<BotaoSecundario href="/">Ir para a Conversa</BotaoSecundario>}
      />
    );
  }

  // Já vem ordenado da maior dívida para a menor.
  const devedores: Devedor[] = porPessoa.map((d) => {
    const chave = chaveDe(d.pessoa);
    const historico = fiados
      .filter((l) => chaveDe(l.pessoa) === chave)
      .sort((a, b) => b.data.localeCompare(a.data) || b.created_at.localeCompare(a.created_at));
    return { ...d, chave, historico, compras: historico.filter((l) => l.natureza === "venda").length };
  });
  const selecionado = escolhida ? devedores.find((d) => d.chave === escolhida) : undefined;
  // No computador, sem ninguém escolhido, o detalhe já abre na maior dívida (nada de painel vazio).
  const mostrado = escolhida ? selecionado : devedores[0];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
      {/* No celular, com uma pessoa aberta, a lista sai e fica só o detalhe. */}
      <section aria-labelledby="lista-titulo" className={escolhida ? "hidden lg:block" : ""}>
        <h2 id="lista-titulo" className="text-xl font-bold">
          {devedores.length === 1 ? "1 pessoa deve" : `${devedores.length} pessoas devem`}
        </h2>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-texto-suave">Falta receber, ao todo:</span>
          <Valor centavos={total} className="text-2xl font-bold text-fiado" />
        </p>
        <ul className="mt-4 divide-y divide-borda border-y border-borda">
          {devedores.map((d) => {
            const atual = d.chave === selecionado?.chave;
            const implicito = !escolhida && d.chave === mostrado?.chave;
            return (
              <li key={d.chave}>
                <Link
                  href={`/fiados?pessoa=${encodeURIComponent(d.chave)}`}
                  aria-current={atual ? "true" : undefined}
                  scroll={false}
                  className={`-mx-2 my-1 flex min-h-18 items-center gap-4 rounded-controle px-2 py-2 transition-[background-color,scale] duration-150 active:scale-[0.99] ${
                    atual ? "bg-primaria-suave" : implicito ? "hover:bg-superficie lg:bg-primaria-suave" : "hover:bg-superficie"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-controle bg-fiado-suave text-xl font-bold text-fiado"
                  >
                    {d.pessoa.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold break-words">{d.pessoa}</span>
                    <span className="block text-texto-suave">
                      {d.compras === 1 ? "1 fiado" : `${d.compras} fiados`}
                    </span>
                  </span>
                  <span className="flex flex-col items-end">
                    <Valor centavos={d.valor_centavos} className="text-xl font-bold text-fiado" />
                    <span className="text-texto-suave">a receber</span>
                  </span>
                  <IconeAvancar className="size-5 text-texto-suave" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className={escolhida ? "" : "hidden lg:block"}>
        {mostrado ? (
          <DetalhePessoa key={mostrado.chave} devedor={mostrado} />
        ) : (
          <Vazio
            titulo="Essa pessoa não deve mais nada"
            texto="Ou o fiado já foi pago, ou o nome mudou. Veja a lista de quem ainda deve."
            acao={<BotaoSecundario href="/fiados">Ver todos os fiados</BotaoSecundario>}
          />
        )}
      </div>
    </div>
  );
}

function DetalhePessoa({ devedor: d }: { devedor: Devedor }) {
  const porData = Map.groupBy(d.historico, (l) => l.data);

  return (
    <section aria-labelledby="pessoa-titulo" className="flex flex-col gap-8 animate-entrar">
      <Link
        href="/fiados"
        scroll={false}
        className="-ml-2 inline-flex min-h-12 items-center gap-1 self-start rounded-controle px-2 font-bold text-primaria lg:hidden"
      >
        <IconeVoltar className="size-5" />
        Todos os fiados
      </Link>

      {/* Conta em aberto: a faixa azul do fiado marca o bloco, o valor vem escrito e com selo. */}
      <div className="rounded-bloco rounded-l-md border border-l-[6px] border-borda border-l-fiado bg-superficie p-5 sm:p-8">
        <h2 id="pessoa-titulo" className="text-2xl font-bold break-words">
          {d.pessoa}
        </h2>
        <p className="mt-3 text-texto-suave">Falta receber</p>
        <p className="text-5xl font-bold text-fiado">
          <Valor centavos={d.valor_centavos} destaque />
        </p>
        <div className="mt-6">
          <BotaoPrincipal href={`/?frase=${encodeURIComponent(`${d.pessoa} pagou `)}`}>
            Registrar pagamento
          </BotaoPrincipal>
        </div>
        <p className="mt-2 text-texto-suave">Abre a Conversa com a frase pronta. Você só completa o valor.</p>
      </div>

      <div>
        <h3 className="text-xl font-bold">O que levou e o que pagou</h3>
        {[...porData].map(([data, itens]) => (
          <div key={data} className="mt-5">
            <p className="font-bold text-texto-suave">{dataPorExtenso(data)}</p>
            <ul className="divide-y divide-borda border-t border-borda">
              {itens.map((l) => (
                <li key={l.id}>
                  <LinhaLancamento lancamento={l} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
