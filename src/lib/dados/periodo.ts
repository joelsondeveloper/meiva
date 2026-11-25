/** Períodos do Resumo. */
export const PERIODOS = [
  { id: "hoje", rotulo: "Hoje" },
  { id: "semana", rotulo: "7 dias" },
  { id: "mes", rotulo: "Este mês" },
] as const;

export type Periodo = (typeof PERIODOS)[number]["id"];

export function lerPeriodo(valor: unknown): Periodo {
  return PERIODOS.some((p) => p.id === valor) ? (valor as Periodo) : "hoje";
}

/** Soma dias a uma data YYYY-MM-DD (sem fuso: é só calendário). */
export function somarDias(data: string, dias: number): string {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Primeiro dia do período que termina em `hoje` (inclusive). */
export function inicioDoPeriodo(periodo: Periodo, hoje: string): string {
  if (periodo === "semana") return somarDias(hoje, -6);
  if (periodo === "mes") return `${hoje.slice(0, 8)}01`;
  return hoje;
}

/** Legenda do período em português simples, ex.: "nos últimos 7 dias". */
export function legendaDoPeriodo(periodo: Periodo): string {
  return { hoje: "hoje", semana: "nos últimos 7 dias", mes: "neste mês" }[periodo];
}

const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", timeZone: "UTC" });

/** "2026-11-25" -> "25 de novembro". */
export function dataPorExtenso(data: string): string {
  return formatoData.format(new Date(`${data}T00:00:00Z`));
}
