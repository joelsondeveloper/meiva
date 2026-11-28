import type { ReactNode } from "react";
import { categoriaDo, rotuloDoLancamento, sinalDo, type Categoria } from "@/lib/chat/categoria";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";
import { IconeAporte, IconeEntrada, IconeFiado, IconeRetirada, IconeSaida } from "@/components/icones";
import { Valor } from "@/components/valor";
import { TextoComNumeros } from "@/components/texto-com-numeros";

type Visual = { cor: string; Icone: typeof IconeEntrada };

/** Cor e ícone por categoria. A cor nunca vem sozinha: sempre ícone + rótulo (+ sinal ou selo). */
const VISUAL: Record<Categoria, Visual> = {
  entrada: { cor: "text-entrada", Icone: IconeEntrada },
  saida: { cor: "text-saida", Icone: IconeSaida },
  fiado: { cor: "text-fiado", Icone: IconeFiado },
  aporte: { cor: "text-entrada", Icone: IconeAporte },
  retirada: { cor: "text-saida", Icone: IconeRetirada },
};

/**
 * Selo "a receber" do fiado (no lugar do sinal +). Tem contorno, além do
 * fundo: no tema escuro o fundo azul quase some sobre a superfície, e o
 * contorno mantém a forma de etiqueta.
 */
export function SeloAReceber() {
  return (
    <span className="inline-flex items-center rounded-selo border border-fiado bg-fiado-suave px-2 font-bold whitespace-nowrap text-fiado">
      a receber
    </span>
  );
}

/**
 * Uma linha de lançamento: ícone, o que foi e como, e o valor à direita.
 * `riscado` mostra o estado "Desfeito"; `acao` é um botão opcional (Desfazer),
 * que fica embaixo do valor.
 */
export function LinhaLancamento({
  lancamento: l,
  riscado = false,
  acao,
}: {
  lancamento: LancamentoSalvo;
  riscado?: boolean;
  acao?: ReactNode;
}) {
  const categoria = categoriaDo(l);
  const { cor, Icone } = VISUAL[categoria];

  return (
    <div className="flex items-start gap-3 py-3">
      <span className={`mt-0.5 transition-colors duration-200 ${riscado ? "text-texto-suave" : cor}`}>
        <Icone className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`font-bold break-words ${riscado ? "text-texto-suave line-through" : ""}`}>
          <TextoComNumeros>{l.descricao}</TextoComNumeros>
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-texto-suave">
          {riscado ? "Desfeito" : rotuloDoLancamento(l)}
          {categoria === "fiado" && !riscado && <SeloAReceber />}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <Valor
          centavos={l.valor_centavos}
          sinal={sinalDo(l)}
          className={`text-lg font-bold transition-colors duration-200 ${riscado ? "text-texto-suave line-through" : cor}`}
        />
        {acao}
      </div>
    </div>
  );
}
