import { transcrever } from "@/lib/transcricao/transcricao";
import {
  ipDaRequisicao,
  rateLimitTranscrever,
  respostaLimiteExcedido,
  respostaTetoDiario,
  tetoDiarioTranscrever,
} from "@/lib/rate-limit";

/**
 * POST /api/transcrever
 * Corpo: multipart/form-data com o campo "audio" (gravação do MediaRecorder,
 * até 60 s). Só transcreve: quem confere e envia o texto é a pessoa.
 *
 * 200 { texto }
 * 400 sem áudio · 413 grande demais · 415 formato não aceito
 * 422 não deu para entender (áudio curto, mudo ou só barulho)
 * 429 mais de 60 em 10 min por IP, ou teto global de 500 no dia
 * 502 falha do serviço de transcrição
 *
 * Privacidade (LGPD): o áudio só existe na memória durante a requisição.
 * Não é gravado em disco, banco, storage nem log; vai para o OpenRouter só
 * para transcrever e é descartado em seguida. O texto também não é guardado
 * aqui: volta para o campo da tela.
 */

export const maxDuration = 30;

/** 60 s de áudio dão ~250 KB em opus e ~1 MB em aac; 2 MB sobra. */
export const MAX_BYTES_AUDIO = 2 * 1024 * 1024;
/** Abaixo disso é toque sem fala (cabeçalho do arquivo e quase nada). */
export const MIN_BYTES_AUDIO = 1000;

/** Tipos que os navegadores gravam (Chrome/Android: webm; iOS Safari: mp4) e a extensão que o serviço entende. */
const EXTENSOES: Record<string, string> = {
  "audio/webm": "webm",
  "video/webm": "webm",
  "audio/mp4": "m4a",
  "video/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
};

export const NAO_ENTENDI = "Não entendi o áudio. Fale mais perto do celular e tente de novo, ou escreva.";

const erro = (mensagem: string, status: number) => Response.json({ error: mensagem }, { status });

export async function POST(request: Request): Promise<Response> {
  const ip = ipDaRequisicao(request);
  const porIp = rateLimitTranscrever.consultar(ip);
  if (!porIp.ok) return respostaLimiteExcedido(porIp.tenteEmSegundos, "gravações");
  const diario = tetoDiarioTranscrever.consultar();
  if (!diario.ok) return respostaTetoDiario(diario.tenteEmSegundos, "gravações");
  rateLimitTranscrever.registrar(ip);
  tetoDiarioTranscrever.registrar();

  // Barra antes de ler o corpo quando o tamanho já vem declarado.
  const declarado = Number(request.headers.get("content-length"));
  if (declarado > MAX_BYTES_AUDIO + 64 * 1024) {
    return erro("A gravação ficou grande demais. Grave até 1 minuto.", 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return erro("Envie o áudio no campo audio.", 400);
  }

  const audio = form.get("audio");
  if (!(audio instanceof Blob)) return erro("Envie o áudio no campo audio.", 400);
  if (audio.size > MAX_BYTES_AUDIO) return erro("A gravação ficou grande demais. Grave até 1 minuto.", 413);

  const tipo = audio.type.split(";")[0].trim().toLowerCase();
  const extensao = EXTENSOES[tipo];
  if (!extensao) return erro("Formato de áudio não aceito. Tente gravar de novo.", 415);
  if (audio.size < MIN_BYTES_AUDIO) return erro(NAO_ENTENDI, 422);

  let texto: string;
  try {
    texto = await transcrever(audio, `audio.${extensao}`);
  } catch (e) {
    // Só a mensagem do erro: nunca o áudio nem o texto.
    console.error("Falha na transcrição:", e instanceof Error ? e.message : e);
    return erro("Não consegui entender o áudio agora. Tente de novo ou escreva.", 502);
  }

  if (!texto) return erro(NAO_ENTENDI, 422);
  return Response.json({ texto });
}
