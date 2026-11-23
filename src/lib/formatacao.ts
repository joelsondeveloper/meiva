import type { FormaPagamento, TipoLancamento } from "@/lib/interpreter/schema";

const formatadorBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** 4990 -> "R$ 49,90" (com espaço não separável, como o Intl gera). */
export function formatarCentavos(centavos: number): string {
  if (!Number.isInteger(centavos)) {
    throw new TypeError(`Valor em centavos deve ser inteiro: ${centavos}`);
  }
  return formatadorBRL.format(centavos / 100);
}

const ROTULO_TIPO: Record<TipoLancamento, string> = {
  entrada: "Entrada",
  saida: "Saída",
};

const ROTULO_FORMA: Record<NonNullable<FormaPagamento>, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  fiado: "Fiado",
  outro: "Outro",
};

export const rotuloTipo = (tipo: TipoLancamento) => ROTULO_TIPO[tipo];

export const rotuloForma = (forma: FormaPagamento) =>
  forma ? ROTULO_FORMA[forma] : "Não informada";
