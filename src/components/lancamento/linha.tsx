import type { ReactNode } from "react";
import { categoriaDo, rotuloDoLancamento, sinalDo, type Categoria } from "@/lib/chat/categoria";
import { formatarCentavos } from "@/lib/formatacao";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";
import { IconeAporte, IconeEntrada, IconeFiado, IconeRetirada, IconeSaida } from "@/components/icones";

type Visual = { cor: string; fundo: string; Icone: typeof IconeEntrada };

/** Cor, fundo do ícone e ícone por categoria. A cor nunca vem sozinha: sempre ícone + rótulo (+ sinal). */
const VISUAL: Record<Categoria, Visual> = {
  entrada: { cor: "text-entrada", fundo: "bg-entrada-suave", Icone: IconeEntrada },
  saida: { cor: "text-saida", fundo: "bg-saida-suave", Icone: IconeSaida },
  fiado: { cor: "text-fiado", fundo: "bg-fiado-suave", Icone: IconeFiado },
  aporte: { cor: "text-entrada", fundo: "bg-entrada-suave", Icone: IconeAporte },
  retirada: { cor: "text-saida", fundo: "bg-saida-suave", Icone: IconeRetirada },
};

/** Selo "a receber" do fiado (no lugar do sinal +). */
export function SeloAReceber() {
  return (
    <span className="inline-flex items-center rounded-md bg-fiado-suave px-2 font-bold text-fiado">a receber</span>
  );
}

/**
 * Uma linha de lançamento: ícone, o que foi e como, e o valor à direita.
 * `riscado` mostra o estado "Desfeito"; `acao` é um botão opcional (Desfazer).
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
  const { cor, fundo, Icone } = VISUAL[categoria];
  const sinal = sinalDo(l);

  return (
    <div className="flex items-center gap-3 py-2">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
          riscado ? "bg-fundo text-texto-suave" : `${fundo} ${cor}`
        }`}
      >
        <Icone className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`break-words font-bold ${riscado ? "text-texto-suave line-through" : ""}`}>{l.descricao}</p>
        <p className="text-texto-suave">{riscado ? "Desfeito" : rotuloDoLancamento(l)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={`text-lg font-bold tabular-nums transition-colors duration-200 ${
            riscado ? "text-texto-suave line-through" : cor
          }`}
        >
          {sinal && <span aria-hidden="true">{sinal}</span>}
          <span className="sr-only">{sinal === "−" ? "saiu " : sinal === "+" ? "entrou " : ""}</span>
          {formatarCentavos(l.valor_centavos)}
        </span>
        {categoria === "fiado" && !riscado && <SeloAReceber />}
        {acao}
      </div>
    </div>
  );
}
