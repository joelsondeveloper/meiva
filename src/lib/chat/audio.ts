/**
 * Regras da gravação de áudio no navegador (sem React, para testar).
 * A gravação é só outro jeito de ENTRAR o texto: o que volta da transcrição
 * vai para o campo, e quem envia é a pessoa.
 */

/** Teto de uma gravação. Ao chegar aqui, para sozinha e transcreve. */
export const LIMITE_SEGUNDOS = 60;
/** A partir daqui o indicador avisa quanto falta. */
export const AVISO_A_PARTIR_DE = 50;
/** Menos que isso é toque sem querer: nem manda para o servidor. */
export const MINIMO_MS = 700;

/**
 * Formatos em ordem de preferência. Chrome/Android e Firefox gravam webm/opus
 * (pequeno); o iOS Safari só grava mp4/aac. Vazio = deixa o navegador escolher.
 */
const TIPOS_PREFERIDOS = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

export function escolherTipoGravacao(suporta: (tipo: string) => boolean): string {
  return TIPOS_PREFERIDOS.find((t) => {
    try {
      return suporta(t);
    } catch {
      return false;
    }
  }) ?? "";
}

export const ERRO_SEM_SUPORTE = "Este navegador não grava áudio. Atualize o navegador ou escreva a mensagem.";
export const ERRO_CURTO = "A gravação ficou curta. Toque no microfone, fale e toque de novo para terminar.";
export const ERRO_INTERROMPIDA = "A gravação parou no meio. Toque no microfone para gravar de novo.";

/** Erro do getUserMedia/MediaRecorder → o que aconteceu e o que fazer. */
export function mensagemErroMicrofone(erro: unknown): string {
  const nome = typeof erro === "object" && erro !== null && "name" in erro ? String(erro.name) : "";
  switch (nome) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return "O microfone está bloqueado. Libere nas configurações do navegador ou escreva a mensagem.";
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
      return "Não achei um microfone neste aparelho. Escreva a mensagem no campo.";
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
      return "O microfone está sendo usado por outro app. Feche o outro app e tente de novo.";
    default:
      return "Não consegui usar o microfone. Tente de novo ou escreva a mensagem.";
  }
}

/** 7 → "0:07"; 60 → "1:00". */
export function formatarTempo(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Junta o que foi falado ao que já estava escrito (não apaga o que a pessoa
 * digitou). Respeita o limite do campo.
 */
export function juntarAoCampo(atual: string, falado: string, limite: number): string {
  const base = atual.trimEnd();
  const junto = base ? `${base} ${falado.trim()}` : falado.trim();
  return junto.slice(0, limite);
}
