import { hojeBR } from "@/lib/datas";
import { calcularAReceber, calcularSaldo, type ResumoCaixa } from "./saldo";
import type { RepositorioLancamentos, RespostaListagem } from "./tipos";

/**
 * Resumo da tela: dia, saldo acumulado até o dia e "a receber" global.
 * TODO(escala): o acumulado lê todos os lançamentos; trocar por uma view/RPC
 * de soma no Postgres quando o volume crescer.
 */
export async function montarResumoCaixa(
  repo: RepositorioLancamentos,
  data: string = hojeBR(),
): Promise<ResumoCaixa> {
  const [ateData, fiados] = await Promise.all([repo.listar({ ate: data }), repo.listarFiados()]);
  return {
    data,
    dia: calcularSaldo(ateData.filter((l) => l.data === data)),
    saldoAcumulado: calcularSaldo(ateData).saldo,
    aReceber: calcularAReceber(fiados),
  };
}

/** Lançamentos de uma data + resumo (GET /api/lancamentos). */
export async function resumoDoDia(
  repo: RepositorioLancamentos,
  data: string = hojeBR(),
): Promise<RespostaListagem> {
  const [lancamentos, resumo] = await Promise.all([
    repo.listar({ de: data, ate: data }),
    montarResumoCaixa(repo, data),
  ]);
  return { lancamentos, resumo };
}
