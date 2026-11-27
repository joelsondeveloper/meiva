/**
 * ETAPA 1 do áudio: compara modelos de transcrição (speech-to-text) do
 * OpenRouter com gravações reais das frases abaixo.
 *
 * Os áudios ficam em audios-teste/ (fora do git: voz é dado pessoal).
 * Nome do arquivo = número da frase: 01.m4a, 02.webm, 03.ogg ... (qualquer
 * extensão que o ffmpeg leia). Vários arquivos por frase: 01-a.m4a, 01-b.m4a.
 *
 * Para cada arquivo, o script também converte (com ffmpeg) para os dois
 * formatos que os navegadores gravam de fato:
 *   - webm/opus  (Chrome Android, MediaRecorder padrão)
 *   - mp4/aac    (iOS Safari, MediaRecorder só grava audio/mp4)
 * e mede com cada modelo: acerto das partes que importam (valor, forma de
 * pagamento, pessoa, "fiado"), latência e custo (vem no `usage.cost`).
 *
 * Uso:   npm run comparar-audio -- <modelo1> <modelo2> ...
 *        (sem modelos: whisper-large-v3-turbo e gpt-4o-mini-transcribe)
 * SEM_PROMPT=1 desliga o prompt de vocabulário.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { toFile } from "openai";
import { getOpenRouterClient } from "../src/lib/llm/openrouter";

const PASTA = process.env.AUDIOS ?? join(process.cwd(), "audios-teste");

/** Contexto para o modelo (vocabulário, não instrução). */
const PROMPT =
  process.env.PROMPT_AUDIO ?? "pix, fiado, pila, conto, reais";

/**
 * Frase que a pessoa deve falar + partes obrigatórias na transcrição
 * (regex sobre o texto normalizado: minúsculo, sem acento, sem pontuação
 * exceto vírgula decimal). Valores aceitam número ou por extenso.
 */
export const FRASES: { texto: string; chaves: RegExp[] }[] = [
  /* 01 */ { texto: "vendi 50 de pudim no pix", chaves: [/\b(50|cinquenta)\b/, /pudi/, /\bpix\b/] },
  /* 02 */ { texto: "vendi três blusas a cinquenta conto no dinheiro", chaves: [/\b(3|tres)\b/, /\b(50|cinquenta)\b/, /\bconto\b/, /dinheiro/] },
  /* 03 */ { texto: "recebi vinte pila do João", chaves: [/\b(20|vinte)\b/, /\bpila\b/, /\bjoao\b/] },
  /* 04 */ { texto: "a dona Maria levou dois bolos fiado, quarenta reais", chaves: [/\bmaria\b/, /\b(2|dois)\b/, /\bfiado\b/, /\b(40|quarenta)\b/] },
  /* 05 */ { texto: "paguei mil e duzentos de aluguel", chaves: [/\b(1\.?200|mil e duzentos)\b/, /aluguel/] },
  /* 06 */ { texto: "comprei farinha, oitenta e cinco e noventa", chaves: [/farinha/, /\b(85,90|85 e 90|oitenta e cinco e noventa)\b/] },
  /* 07 */ { texto: "o Zé pagou o fiado de trinta e cinco", chaves: [/\bze\b/, /\bfiado\b/, /\b(35|trinta e cinco)\b/] },
  /* 08 */ { texto: "gastei cento e cinquenta de gasolina no cartão", chaves: [/\b(150|cento e cinquenta)\b/, /gasolina/, /cartao/] },
  /* 09 */ { texto: "vendi um bolo de pote por doze e cinquenta no pix", chaves: [/bolo de pote/, /\b(12,50|12 e 50|doze e cinquenta)\b/, /\bpix\b/] },
  /* 10 */ { texto: "quanto eu vendi hoje?", chaves: [/quanto/, /vendi/, /hoje/] },
  /* 11 */ { texto: "apaga o último", chaves: [/apag/, /ultimo/] },
  /* 12 */ { texto: "vendi dois mil e quinhentos de salgado pra festa, metade no pix e metade no dinheiro", chaves: [/\b(2\.?500|dois mil e quinhentos)\b/, /salgado/, /\bpix\b/, /dinheiro/] },
];

/** Minúsculo, sem acento, "R$ 50,00" → "50", "1.200,00" → "1.200". */
export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/r\$\s*/g, "")
    .replace(/(\d),00\b/g, "$1")
    .replace(/[^\p{L}\p{N}\s.,]/gu, " ")
    .replace(/[.,](?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const FORMATOS = [
  { nome: "webm/opus", ext: "webm", mime: "audio/webm", args: ["-c:a", "libopus", "-b:a", "32k"] },
  { nome: "mp4/aac", ext: "m4a", mime: "audio/mp4", args: ["-c:a", "aac", "-b:a", "64k"] },
];

function duracaoSegundos(arquivo: string): number {
  const saida = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", arquivo]);
  return Number(saida.toString().trim());
}

type Resultado = { modelo: string; formato: string; frase: number; ok: number; total: number; ms: number; custo: number | null; seg: number; texto: string };

async function transcrever(modelo: string, arquivo: string, mime: string) {
  const client = getOpenRouterClient();
  const file = await toFile(readFileSync(arquivo), basename(arquivo), { type: mime });
  const t0 = performance.now();
  const r = await client.audio.transcriptions.create({
    model: modelo,
    file,
    language: "pt",
    ...(process.env.SEM_PROMPT ? {} : { prompt: PROMPT }),
  });
  const ms = performance.now() - t0;
  const custo = (r as unknown as { usage?: { cost?: number } }).usage?.cost ?? null;
  return { texto: r.text, ms, custo };
}

async function main() {
  const modelos = process.argv.slice(2);
  if (modelos.length === 0) modelos.push("openai/whisper-large-v3-turbo", "openai/gpt-4o-mini-transcribe");

  let arquivos: string[];
  try {
    arquivos = readdirSync(PASTA).filter((f) => /^\d{2}/.test(f) && !f.endsWith(".md")).sort();
  } catch {
    console.error(`Pasta ${PASTA} não existe. Crie e coloque os áudios (01.m4a, 02.m4a ...).`);
    process.exit(1);
  }
  if (arquivos.length === 0) {
    console.error(`Nenhum áudio em ${PASTA}.`);
    process.exit(1);
  }

  const tmp = mkdtempSync(join(tmpdir(), "meiva-audio-"));
  const resultados: Resultado[] = [];
  try {
    for (const nome of arquivos) {
      const n = Number(nome.slice(0, 2));
      // 99 = só silêncio/barulho: o certo é vir vazio (a "chave" é não inventar texto).
      const frase = n === 99 ? { texto: "(silêncio: esperado vazio)", chaves: [/^$/] } : FRASES[n - 1];
      if (!frase) {
        console.warn(`Ignorando ${nome}: não há frase ${n}.`);
        continue;
      }
      const origem = join(PASTA, nome);
      const seg = duracaoSegundos(origem);
      console.log(`\n${nome} (${seg.toFixed(1)} s) — esperado: "${frase.texto}"`);

      for (const fmt of FORMATOS) {
        const convertido = join(tmp, `${basename(nome, extname(nome))}.${fmt.ext}`);
        execFileSync("ffmpeg", ["-y", "-v", "error", "-i", origem, "-ac", "1", "-ar", "48000", ...fmt.args, convertido]);

        for (const modelo of modelos) {
          try {
            const { texto, ms, custo } = await transcrever(modelo, convertido, fmt.mime);
            const norm = normalizar(texto);
            const ok = frase.chaves.filter((re) => re.test(norm)).length;
            resultados.push({ modelo, formato: fmt.nome, frase: n, ok, total: frase.chaves.length, ms, custo, seg, texto });
            const marca = ok === frase.chaves.length ? "OK " : "-- ";
            console.log(`  ${marca}${fmt.nome.padEnd(9)} ${modelo.padEnd(34)} ${String(Math.round(ms)).padStart(5)} ms  ${ok}/${frase.chaves.length}  "${texto.trim()}"`);
          } catch (e) {
            console.log(`  ERR ${fmt.nome.padEnd(9)} ${modelo.padEnd(34)} ${(e as Error).message}`);
            resultados.push({ modelo, formato: fmt.nome, frase: n, ok: 0, total: frase.chaves.length, ms: 0, custo: null, seg, texto: "<erro>" });
          }
        }
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  console.log("\n=== Resumo por modelo ===");
  console.log("modelo                              frases 100%   chaves    p50 ms  p90 ms  US$/min (medido)");
  for (const modelo of modelos) {
    const rs = resultados.filter((r) => r.modelo === modelo);
    const inteiras = rs.filter((r) => r.ok === r.total).length;
    const chaves = rs.reduce((s, r) => s + r.ok, 0);
    const totalChaves = rs.reduce((s, r) => s + r.total, 0);
    const lat = rs.filter((r) => r.ms > 0).map((r) => r.ms).sort((a, b) => a - b);
    const pct = (p: number) => (lat.length ? Math.round(lat[Math.min(lat.length - 1, Math.floor(p * lat.length))]) : 0);
    const comCusto = rs.filter((r) => r.custo !== null);
    const custoMin = comCusto.length
      ? (comCusto.reduce((s, r) => s + (r.custo ?? 0), 0) / comCusto.reduce((s, r) => s + r.seg, 0)) * 60
      : NaN;
    console.log(
      `${modelo.padEnd(36)}${`${inteiras}/${rs.length}`.padStart(8)}   ${`${chaves}/${totalChaves}`.padStart(7)}  ${String(pct(0.5)).padStart(7)} ${String(pct(0.9)).padStart(7)}  ${Number.isNaN(custoMin) ? "—" : custoMin.toFixed(5)}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
