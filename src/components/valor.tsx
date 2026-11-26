import { formatarCentavos } from "@/lib/formatacao";

type Props = {
  centavos: number;
  /** "+" ou "−" na frente (o leitor de tela ouve "entrou" / "saiu"). Fiado não tem sinal. */
  sinal?: "+" | "−" | "";
  /** Número herói: o "R$" fica com metade do tamanho, alinhado pelo topo dos algarismos. */
  destaque?: boolean;
  className?: string;
};

/**
 * Um valor em reais. Todo dinheiro da tela passa por aqui, com a classe
 * `valor` (algarismos tabulares e a fonte de --fonte-valor), para que trocar
 * o desenho dos números seja uma linha só no globals.css.
 */
export function Valor({ centavos, sinal: sinalPedido = "", destaque = false, className = "" }: Props) {
  // Negativo sem sinal pedido vira "−" na frente (o mesmo traço dos gastos), não o "-" do Intl.
  const sinal = centavos < 0 && !sinalPedido ? "−" : sinalPedido;
  const texto = formatarCentavos(Math.abs(centavos));
  const lido = sinal === "−" ? "saiu " : sinal === "+" ? "entrou " : "";

  if (!destaque) {
    return (
      <span className={`valor whitespace-nowrap ${className}`}>
        {sinal && <span aria-hidden="true">{sinal}</span>}
        {lido && <span className="sr-only">{lido}</span>}
        {texto}
      </span>
    );
  }

  // "R$ 586,00" -> "R$" + "586,00" (o Intl separa com espaço não separável).
  const [moeda, ...resto] = texto.split(/\s/);
  return (
    <span className={`valor whitespace-nowrap ${className}`}>
      {sinal && <span aria-hidden="true">{sinal}</span>}
      {lido && <span className="sr-only">{lido}</span>}
      <span className="mr-[0.2em] align-[0.42em] text-[0.5em] font-normal">{moeda}</span>
      {resto.join(" ")}
    </span>
  );
}
