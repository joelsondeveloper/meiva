import Link from "next/link";
import type { ResumoCaixa } from "@/lib/lancamentos/saldo";
import { IconeEntrada, IconeFiado, IconeSaida, IconeSaldo } from "@/components/icones";
import { SeloAReceber } from "@/components/lancamento/linha";
import { Valor } from "@/components/valor";

type Props = {
  resumo: ResumoCaixa | null;
  erro: string | null;
  onTentarDeNovo: () => void;
};

/** Painel "Caixa de hoje", ao lado da conversa nas telas largas. */
export function PainelCaixa({ resumo, erro, onTentarDeNovo }: Props) {
  return (
    <section aria-labelledby="caixa-titulo" className="flex flex-col gap-5 p-6">
      <h2 id="caixa-titulo" className="text-xl font-bold">
        Caixa de hoje
      </h2>

      {erro && !resumo ? (
        <div className="flex flex-col gap-3">
          <p>{erro}</p>
          <button
            type="button"
            onClick={onTentarDeNovo}
            className="min-h-12 rounded-controle border border-borda-forte px-4 font-bold hover:bg-fundo"
          >
            Tentar de novo
          </button>
        </div>
      ) : !resumo ? (
        <p className="text-texto-suave" role="status">
          Carregando o caixa…
        </p>
      ) : (
        <>
          <div>
            <p className="text-texto-suave">Saldo de hoje</p>
            <p className={`text-3xl font-bold ${resumo.dia.saldo < 0 ? "text-saida" : ""}`}>
              <Valor centavos={resumo.dia.saldo} destaque />
            </p>
            <p className="text-texto-suave">O que entrou menos o que saiu hoje.</p>
          </div>

          <dl className="flex flex-col divide-y divide-borda border-y border-borda">
            <Linha rotulo="Entrou" Icone={IconeEntrada} cor="text-entrada">
              <Valor centavos={resumo.dia.entradas} sinal={resumo.dia.entradas > 0 ? "+" : ""} />
            </Linha>
            <Linha rotulo="Saiu" Icone={IconeSaida} cor="text-saida">
              <Valor centavos={resumo.dia.saidas} sinal={resumo.dia.saidas > 0 ? "−" : ""} />
            </Linha>
            <Linha rotulo="Dinheiro no caixa" Icone={IconeSaldo} cor="text-texto">
              <Valor centavos={resumo.saldoAcumulado} />
            </Linha>
            <Linha rotulo="Fiados" Icone={IconeFiado} cor="text-fiado" selo>
              <Valor centavos={resumo.aReceber.total} />
            </Linha>
          </dl>

          <Link
            href="/resumo"
            className="flex min-h-12 items-center justify-center rounded-controle border border-borda-forte px-4 font-bold hover:bg-fundo"
          >
            Ver o resumo completo
          </Link>
        </>
      )}
    </section>
  );
}

function Linha({
  rotulo,
  Icone,
  cor,
  selo = false,
  children,
}: {
  rotulo: string;
  Icone: typeof IconeEntrada;
  cor: string;
  selo?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="flex items-center gap-2">
        <span className={cor}>
          <Icone className="size-5" />
        </span>
        {rotulo}
      </dt>
      <dd className={`flex flex-col items-end gap-1 font-bold ${cor}`}>
        {children}
        {selo && <SeloAReceber />}
      </dd>
    </div>
  );
}
