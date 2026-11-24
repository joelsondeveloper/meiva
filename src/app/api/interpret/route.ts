import { z } from "zod";
import {
  InterpretadorError,
  InterpretadorNaoImplementadoError,
  registrarTexto,
} from "@/lib/lancamentos/registrar";
import { ipDaRequisicao, limiteInterpret } from "@/lib/rate-limit";

/**
 * POST /api/interpret
 * Corpo: { "texto": "vendi 3 blusas a 50 no pix" }
 *
 * 200 { status: "registrado", lancamentos, resumo }
 * 200 { status: "precisa_confirmar", pergunta }   (nada é salvo)
 * 400 entrada inválida · 429 limite de uso (60 por IP a cada 10 min ou
 * 500 por dia no total) · 501 interpretador não implementado
 * 502 falha do interpretador · 500 falha ao salvar
 */

const CorpoSchema = z.object({
  texto: z
    .string({ error: "Envie o campo texto." })
    .trim()
    .min(1, "O texto não pode ser vazio.")
    .max(500, "O texto deve ter no máximo 500 caracteres."),
});

const erro = (mensagem: string, status: number, headers?: HeadersInit) =>
  Response.json({ error: mensagem }, { status, headers });

const MENSAGEM_LIMITE = {
  ip: "Muitas mensagens seguidas. Espere alguns minutos e tente de novo.",
  global: "A MEIva chegou ao limite de mensagens de hoje. Tente de novo amanhã.",
} as const;

export async function POST(request: Request): Promise<Response> {
  const limite = limiteInterpret.consumir(ipDaRequisicao(request));
  if (!limite.ok) {
    return erro(MENSAGEM_LIMITE[limite.motivo], 429, {
      "Retry-After": String(limite.segundosParaLiberar),
    });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return erro("Mensagem inválida. Tente de novo.", 400);
  }

  const corpo = CorpoSchema.safeParse(json);
  if (!corpo.success) {
    return erro(corpo.error.issues[0]?.message ?? "Entrada inválida.", 400);
  }

  try {
    return Response.json(await registrarTexto(corpo.data.texto));
  } catch (e) {
    if (e instanceof InterpretadorNaoImplementadoError) return erro(e.message, 501);
    if (e instanceof InterpretadorError) {
      console.error(e);
      return erro("Não consegui entender agora. Tente de novo.", 502);
    }
    console.error(e);
    return erro("Não consegui salvar. Tente de novo.", 500);
  }
}
