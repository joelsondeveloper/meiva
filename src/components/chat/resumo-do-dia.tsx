import { formatarCentavos } from "@/lib/formatacao";
import type { RespostaListagem } from "@/lib/lancamentos/tipos";
import { IconeEntrada, IconeFiado, IconeSaida, IconeSaldo, IconeSeta } from "./icones";
import { LinhaLancamento } from "./valor";

type Props = {
  dia: RespostaListagem | null;
  erro: string | null;
  onTentarDeNovo: () => void;
};

const corDoSaldo = (v: number) => (v < 0 ? "text-saida" : "text-texto");

/**
 * Saldo de hoje sempre visível no topo; ao tocar, abre o saldo do dia, o
 * saldo acumulado, quem está devendo (a receber por pessoa) e a lista de
 * lançamentos do dia. <details> já é acessível por teclado e leitor de tela.
 */
export function ResumoDoDia({ dia, erro, onTentarDeNovo }: Props) {
  if (erro && !dia) {
    return (
      <div className="flex min-h-11 items-center justify-between gap-3 pb-2">
        <p className="text-erro">{erro}</p>
        <button
          type="button"
          onClick={onTentarDeNovo}
          className="min-h-11 shrink-0 rounded-lg border border-borda-forte px-3 font-medium"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (!dia) {
    return <p className="flex min-h-11 items-center pb-2 text-texto-suave">Carregando o caixa de hoje…</p>;
  }

  const { resumo, lancamentos } = dia;
  const saldoDia = resumo.dia.saldo;
  const { aReceber } = resumo;
  return (
    <details className="group pb-2">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg [&::-webkit-details-marker]:hidden">
        <span>
          Saldo de hoje:{" "}
          <strong className={`tabular-nums ${saldoDia < 0 ? "text-saida" : ""}`}>
            {formatarCentavos(saldoDia)}
          </strong>
        </span>
        <span className="flex items-center gap-1 font-medium text-texto-suave">
          <span className="group-open:hidden">Ver detalhes</span>
          <span className="hidden group-open:inline">Fechar</span>
          <IconeSeta className="size-5 group-open:rotate-180 motion-safe:transition-transform" />
        </span>
      </summary>

      {/* Rolável e focável: quem usa teclado também consegue rolar a lista. */}
      <div
        role="region"
        aria-label="Resumo do caixa"
        tabIndex={0}
        className="flex max-h-[55dvh] flex-col gap-3 overflow-y-auto pt-2"
      >
        <dl className="grid grid-cols-2 gap-2">
          <Total rotulo="Entradas hoje" valor={resumo.dia.entradas} sinal="+" cor="text-entrada" Icone={IconeEntrada} />
          <Total rotulo="Saídas hoje" valor={resumo.dia.saidas} sinal="−" cor="text-saida" Icone={IconeSaida} />
          <Total rotulo="Saldo do dia" valor={saldoDia} cor={corDoSaldo(saldoDia)} Icone={IconeSaldo} />
          <Total
            rotulo="Saldo acumulado"
            valor={resumo.saldoAcumulado}
            cor={corDoSaldo(resumo.saldoAcumulado)}
            Icone={IconeSaldo}
          />
        </dl>

        <section aria-labelledby="a-receber-titulo" className="rounded-xl border border-borda bg-fundo p-3">
          <h2 id="a-receber-titulo" className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1 text-texto-suave">
              <span className="text-aviso">
                <IconeFiado className="size-5" />
              </span>
              A receber (fiado)
            </span>
            <span className="text-xl font-bold tabular-nums text-aviso">{formatarCentavos(aReceber.total)}</span>
          </h2>
          {aReceber.porPessoa.length === 0 ? (
            <p className="mt-1 text-texto-suave">Ninguém está devendo.</p>
          ) : (
            <ul className="mt-2 divide-y divide-borda" aria-label="A receber por pessoa">
              {aReceber.porPessoa.map((d) => (
                <li key={d.pessoa} className="flex min-h-11 items-center justify-between gap-3 py-2">
                  <span className="min-w-0 break-words">{d.pessoa}</span>
                  <span className="shrink-0 font-semibold tabular-nums">{formatarCentavos(d.valor_centavos)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {lancamentos.length === 0 ? (
          <p className="text-texto-suave">Nenhum lançamento hoje.</p>
        ) : (
          <ul className="divide-y divide-borda rounded-xl border border-borda" aria-label="Lançamentos de hoje">
            {lancamentos.map((l) => (
              <li key={l.id} className="p-3">
                <LinhaLancamento lancamento={l} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

function Total({
  rotulo,
  valor,
  sinal,
  cor,
  Icone,
}: {
  rotulo: string;
  valor: number;
  sinal?: "+" | "−";
  cor: string;
  Icone: typeof IconeEntrada;
}) {
  return (
    <div className="rounded-xl border border-borda bg-fundo p-3">
      <dt className="flex items-center gap-1 text-texto-suave">
        <span className={cor}>
          <Icone className="size-5" />
        </span>
        {rotulo}
      </dt>
      <dd className={`text-xl font-bold tabular-nums ${cor}`}>
        {sinal && valor > 0 ? sinal : ""}
        {formatarCentavos(valor)}
      </dd>
    </div>
  );
}
