/** Fuso de referência do app: o "dia" do MEI é o dia de Brasília. */
export const FUSO_BR = "America/Sao_Paulo";

const formatadorBR = new Intl.DateTimeFormat("en-US", {
  timeZone: FUSO_BR,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Data (YYYY-MM-DD) de `agora` no fuso America/Sao_Paulo.
 *
 * Não depende do fuso do servidor (que em produção costuma ser UTC e, à
 * noite no Brasil, já estaria no dia seguinte).
 */
export function hojeBR(agora: Date = new Date()): string {
  const partes = Object.fromEntries(
    formatadorBR.formatToParts(agora).map((p) => [p.type, p.value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}`;
}
