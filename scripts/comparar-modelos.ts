/**
 * Roda os cenários multi-turno de tests/fixtures/cenarios.ts no agente, cada
 * um contra um repositório em memória vazio, e compara o ESTADO FINAL do
 * repositório (tipo, valor, forma, data, natureza, pessoa, anulados) com o
 * esperado. O texto das respostas não é comparado.
 *
 * Modelos variam de uma rodada para outra: use RODADAS=N para repetir.
 * (Variável de ambiente porque o npm engole flags como --rodadas.)
 *
 * Uso:  npm run comparar -- <modelo1> <modelo2> ...
 *       RODADAS=3 npm run comparar -- meta/muse-ember xiaomi/mimo-v2.6-flash
 * PowerShell: $env:RODADAS=3; npm run comparar -- meta/muse-ember
 */
import { agente } from "../src/lib/agente/agente";
import { RepositorioMemoria } from "../src/lib/agente/repositorio-memoria";
import { normalizarPessoa } from "../src/lib/lancamentos/pessoa";
import type { LancamentoSalvo, MensagemChat } from "../src/lib/lancamentos/tipos";
import { cenarios, DATA_REFERENCIA, type LancamentoEsperado } from "../tests/fixtures/cenarios";

/** Chave de comparação (a descrição varia de redação e fica de fora). */
function chave(l: LancamentoEsperado | LancamentoSalvo): string {
  const anulado = "anulado_em" in l ? Boolean(l.anulado_em) : Boolean((l as LancamentoEsperado).anulado);
  return JSON.stringify([
    l.tipo,
    l.natureza,
    l.valor_centavos,
    l.forma_pagamento,
    l.data,
    l.pessoa ? normalizarPessoa(l.pessoa) : null,
    anulado,
  ]);
}

/** Compara como multiconjunto: mesma quantidade e cada esperado casa com um real diferente. */
function bate(real: LancamentoSalvo[], esperado: LancamentoEsperado[]): boolean {
  if (real.length !== esperado.length) return false;
  const sobras = real.map(chave);
  return esperado.every((e) => {
    const i = sobras.indexOf(chave(e));
    if (i === -1) return false;
    sobras.splice(i, 1);
    return true;
  });
}

const resumir = (l: LancamentoEsperado | LancamentoSalvo) => {
  const anulado = "anulado_em" in l ? Boolean(l.anulado_em) : Boolean((l as LancamentoEsperado).anulado);
  return `${l.natureza} ${l.valor_centavos} ${l.forma_pagamento ?? "-"} ${l.data} ${l.pessoa ?? "-"}${anulado ? " [anulado]" : ""}`;
};

type Rodada = { acertos: number; ms: number; falhas: number[] };

async function rodar(model: string, verboso: boolean): Promise<Rodada> {
  const falhas: number[] = [];
  let acertos = 0;
  let totalMs = 0;

  for (const [indice, cenario] of cenarios.entries()) {
    const n = indice + 1;
    const rotulo = `#${String(n).padStart(2, "0")} ${cenario.nome}`;
    const repositorio = new RepositorioMemoria();
    const historico: MensagemChat[] = [];
    const conversa: string[] = [];
    const inicio = Date.now();
    let ok = false;

    try {
      for (const turno of cenario.turnos) {
        historico.push({ role: "user", content: turno });
        const saida = await agente({ mensagens: historico, dataReferencia: DATA_REFERENCIA, model, repositorio });
        historico.push({ role: "assistant", content: saida.resposta });
        conversa.push(
          `     > ${turno}`,
          ...saida.chamadas.map((c) => `       [${c.nome}] ${JSON.stringify(c.args)}`),
          `     < ${saida.resposta.replace(/\s+/g, " ")}`,
        );
      }
      const real = repositorio.todos();
      ok = bate(real, cenario.esperado);
      if (ok && verboso) console.log(`OK   ${rotulo}`);
      if (!ok) {
        console.log(`ERRO ${rotulo}`);
        console.log(conversa.join("\n"));
        console.log("     esperado:", cenario.esperado.map(resumir).join(" | ") || "(nada)");
        console.log("     recebido:", real.map(resumir).join(" | ") || "(nada)");
      }
    } catch (e) {
      console.log(`FALHA ${rotulo}\n${conversa.join("\n")}\n     ${e instanceof Error ? e.message : String(e)}`);
    }
    totalMs += Date.now() - inicio;

    if (ok) acertos++;
    else falhas.push(n);
  }

  return { acertos, ms: Math.round(totalMs / cenarios.length), falhas };
}

async function main() {
  const args = process.argv.slice(2);
  // --rodadas=N ainda funciona quando o script roda direto (npx tsx ...), sem o npm no meio.
  const opcaoRodadas = args.find((a) => a.startsWith("--rodadas="))?.split("=")[1];
  const rodadas = Math.max(1, Math.floor(Number(process.env.RODADAS ?? opcaoRodadas)) || 1);
  const modelos = args.filter((a) => !a.startsWith("--"));

  if (modelos.length === 0) {
    console.error("Uso: RODADAS=N npm run comparar -- <modelo1> <modelo2> ...");
    process.exit(1);
  }

  const resumo = [];
  for (const modelo of modelos) {
    console.log(`\n=== ${modelo}`);
    const resultados: Rodada[] = [];
    for (let r = 1; r <= rodadas; r++) {
      if (rodadas > 1) console.log(`--- rodada ${r}/${rodadas}`);
      resultados.push(await rodar(modelo, rodadas === 1));
    }

    const falhasPorCenario = new Map<number, number>();
    for (const res of resultados) {
      for (const n of res.falhas) falhasPorCenario.set(n, (falhasPorCenario.get(n) ?? 0) + 1);
    }
    const instaveis = [...falhasPorCenario.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([n, c]) => `#${n} (${c}/${rodadas})`)
      .join(" ");
    const totalAcertos = resultados.reduce((soma, res) => soma + res.acertos, 0);

    resumo.push({
      modelo,
      [`acertos (de ${cenarios.length})`]: resultados.map((res) => res.acertos).join(", "),
      media: (totalAcertos / rodadas).toFixed(1),
      erra_em: instaveis || "-",
      ms_por_cenario: Math.round(resultados.reduce((s, res) => s + res.ms, 0) / rodadas),
    });
  }

  console.log("\n=== Resumo");
  console.table(resumo);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
