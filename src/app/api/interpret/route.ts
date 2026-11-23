import { z } from "zod";
import {
  InterpretadorError,
  InterpretadorNaoImplementadoError,
  registrarTexto,
} from "@/lib/lancamentos/registrar";

/**
 * POST /api/interpret
 * Corpo: { "texto": "vendi 3 blusas a 50 no pix" }
 *
 * 200 { status: "registrado", lancamentos, resumo }
 * 200 { status: "precisa_confirmar", pergunta }   (nada é salvo)
 * 400 entrada inválida · 501 interpretador não implementado
 * 502 falha do interpretador · 500 falha ao salvar
 */

const CorpoSchema = z.object({
  texto: z
    .string({ error: "Envie o campo texto." })
    .trim()
    .min(1, "O texto não pode ser vazio.")
    .max(500, "O texto deve ter no máximo 500 caracteres."),
});

const erro = (mensagem: string, status: number) =>
  Response.json({ error: mensagem }, { status });

export async function POST(request: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return erro("Corpo da requisição não é um JSON válido.", 400);
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
      return erro("Não consegui interpretar agora. Tente de novo em instantes.", 502);
    }
    console.error(e);
    return erro("Falha ao salvar os lançamentos.", 500);
  }
}
