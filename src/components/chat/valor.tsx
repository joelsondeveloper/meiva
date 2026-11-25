import { categoriaDo, rotuloDoLancamento, sinalDo, type Categoria } from "@/lib/chat/categoria";
import { formatarCentavos } from "@/lib/formatacao";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";
import { IconeAporte, IconeEntrada, IconeFiado, IconeRetirada, IconeSaida } from "./icones";

type Visual = { cor: string; Icone: typeof IconeEntrada };

/** Entrada e saída nunca só pela cor: sempre sinal (+ / −), ícone e rótulo. */
const VISUAL: Record<Categoria, Visual> = {
  entrada: { cor: "text-entrada", Icone: IconeEntrada },
  saida: { cor: "text-saida", Icone: IconeSaida },
  fiado: { cor: "text-aviso", Icone: IconeFiado },
  aporte: { cor: "text-entrada", Icone: IconeAporte },
  retirada: { cor: "text-saida", Icone: IconeRetirada },
};

/** Linha de um lançamento: ícone + descrição + rótulo, e o valor com sinal à direita. */
export function LinhaLancamento({ lancamento: l, riscado = false }: { lancamento: LancamentoSalvo; riscado?: boolean }) {
  const { cor, Icone } = VISUAL[categoriaDo(l)];
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
        {sinalDo(l)}
        {formatarCentavos(l.valor_centavos)}
      </span>
    </div>
  );
}
