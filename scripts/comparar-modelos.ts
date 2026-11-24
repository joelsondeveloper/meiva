/**
 * Roda as frases de tests/fixtures/frases.ts (em ordem crescente de
 * dificuldade) em cada modelo e mostra quantas cada um acertou e o tempo
 * médio por frase. Com --rodadas=N repete o teste N vezes por modelo, porque
 * modelos variam de uma rodada para outra: uma rodada só não decide nada.
 *
 * Uso: npm run comparar -- [--rodadas=N] <modelo1> <modelo2> ...
 * Ex.: npm run comparar -- --rodadas=3 meta/muse-ember xiaomi/mimo-v2.6-flash
 */
import { DATA_REFERENCIA, frases } from "../tests/fixtures/frases";
import { interpret } from "../src/lib/interpreter/interpret";
import type { Resultado } from "../src/lib/interpreter/schema";

/** Compara tipo, valor, forma e data (a descrição varia de redação, então fica de fora). */
function bate(real: Resultado, esperado: Resultado): boolean {
  if (real.precisa_confirmar !== esperado.precisa_confirmar) return false;
  if (real.lancamentos.length !== esperado.lancamentos.length) return false;

  const sobras = [...real.lancamentos];
  return esperado.lancamentos.every((e) => {
    const i = sobras.findIndex(
      (r) =>
        r.tipo === e.tipo &&
        r.valor_centavos === e.valor_centavos &&
        r.forma_pagamento === e.forma_pagamento &&
        r.data === e.data,
    );
    if (i === -1) return false;
    sobras.splice(i, 1);
    return true;
  });
}

type Rodada = { acertos: number; ms: number; falhas: number[] };

async function rodar(model: string, verboso: boolean): Promise<Rodada> {
  const falhas: number[] = [];
  let acertos = 0;
  let totalMs = 0;

  for (const [indice, { frase, esperado }] of frases.entries()) {
    const n = indice + 1;
    const rotulo = `#${String(n).padStart(2, "0")} ${frase}`;
    const inicio = Date.now();
    let ok = false;
    try {
      const real = await interpret(frase, { model, dataReferencia: DATA_REFERENCIA });
      ok = bate(real, esperado);
      if (ok && verboso) console.log(`OK   ${rotulo}`);
      if (!ok) {
        console.log(`ERRO ${rotulo}`);
        console.log("     esperado:", JSON.stringify(esperado));
        console.log("     recebido:", JSON.stringify(real));
      }
    } catch (e) {
      console.log(`FALHA ${rotulo}\n     ${e instanceof Error ? e.message : String(e)}`);
    }
    totalMs += Date.now() - inicio;

    if (ok) acertos++;
    else falhas.push(n);
  }

  return { acertos, ms: Math.round(totalMs / frases.length), falhas };
}

async function main() {
  const args = process.argv.slice(2);
  const opcaoRodadas = args.find((a) => a.startsWith("--rodadas="));
  const rodadas = Math.max(1, Number(opcaoRodadas?.split("=")[1]) || 1);
  const modelos = args.filter((a) => !a.startsWith("--"));

  if (modelos.length === 0) {
    console.error("Uso: npm run comparar -- [--rodadas=N] <modelo1> <modelo2> ...");
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

    const falhasPorFrase = new Map<number, number>();
    for (const res of resultados) {
      for (const n of res.falhas) falhasPorFrase.set(n, (falhasPorFrase.get(n) ?? 0) + 1);
    }
    const instaveis = [...falhasPorFrase.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([n, c]) => `#${n} (${c}/${rodadas})`)
      .join(" ");
    const totalAcertos = resultados.reduce((soma, res) => soma + res.acertos, 0);

    resumo.push({
      modelo,
      acertos_por_rodada: resultados.map((res) => res.acertos).join(", "),
      media: (totalAcertos / rodadas).toFixed(1),
      erra_em: instaveis || "-",
      ms_por_frase: Math.round(resultados.reduce((s, res) => s + res.ms, 0) / rodadas),
    });
  }

  console.log("\n=== Resumo");
  console.table(resumo);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
