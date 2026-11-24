import { formatarCentavos, rotuloForma, rotuloTipo } from "@/lib/formatacao";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";
import { IconeEntrada, IconeFiado, IconeSaida } from "./icones";

type Visual = { cor: string; sinal: "+" | "−"; Icone: typeof IconeEntrada };

/**
 * Entrada e saída nunca só pela cor: sempre sinal (+ / −), ícone e rótulo.
 * Fiado é entrada que ainda não entrou no caixa: cor de aviso e relógio.
 */
export function visualDo(l: Pick<LancamentoSalvo, "tipo" | "forma_pagamento">): Visual {
  if (l.tipo === "saida") return { cor: "text-saida", sinal: "−", Icone: IconeSaida };
  if (l.forma_pagamento === "fiado") return { cor: "text-aviso", sinal: "+", Icone: IconeFiado };
  return { cor: "text-entrada", sinal: "+", Icone: IconeEntrada };
}

export function rotuloDoLancamento(l: LancamentoSalvo): string {
  const base = `${rotuloTipo(l.tipo)} · ${rotuloForma(l.forma_pagamento)}`;
  return l.tipo === "entrada" && l.forma_pagamento === "fiado" ? `${base} (a receber)` : base;
}

/** Linha de um lançamento: ícone + descrição + rótulo, e o valor com sinal à direita. */
export function LinhaLancamento({ lancamento: l, riscado = false }: { lancamento: LancamentoSalvo; riscado?: boolean }) {
  const { cor, sinal, Icone } = visualDo(l);
  return (
    <div className={`flex items-start gap-3 ${riscado ? "line-through" : ""}`}>
      <span className={`mt-0.5 ${riscado ? "text-texto-suave" : cor}`}>
        <Icone />
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words font-medium">{l.descricao}</p>
        <p className="text-texto-suave">{rotuloDoLancamento(l)}</p>
      </div>
      <span
        className={`shrink-0 text-lg font-bold tabular-nums ${riscado ? "text-texto-suave" : cor}`}
      >
        {sinal}
        {formatarCentavos(l.valor_centavos)}
      </span>
    </div>
  );
}
