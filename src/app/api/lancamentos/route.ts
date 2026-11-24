import { z } from "zod";
import { hojeBR } from "@/lib/datas";
import { desfazerLancamentos, resumoDoDia } from "@/lib/lancamentos/registrar";

/**
 * GET /api/lancamentos?data=YYYY-MM-DD  (padrão: hoje em Brasília)
 * 200 { lancamentos, resumo } · 400 data inválida · 500 falha no banco
 *
 * DELETE /api/lancamentos   (botão "Desfazer")
 * Corpo: { "ids": ["<uuid>", ...] }
 * 200 { removidos, resumo } · 400 entrada inválida · 500 falha no banco
 */

const DataSchema = z.iso.date();

const DesfazerSchema = z.object({
  ids: z
    .array(z.uuid({ error: "Lançamento inválido." }), { error: "Envie a lista de ids." })
    .min(1, "Envie ao menos um id.")
    .max(20, "No máximo 20 lançamentos por vez."),
});

const erro = (mensagem: string, status: number) =>
  Response.json({ error: mensagem }, { status });

export async function GET(request: Request): Promise<Response> {
  const param = new URL(request.url).searchParams.get("data");
  const data = DataSchema.safeParse(param ?? hojeBR());
  if (!data.success) {
    return erro("Data inválida: use YYYY-MM-DD.", 400);
  }

  try {
    return Response.json(await resumoDoDia(data.data));
  } catch (e) {
    console.error(e);
    return erro("Não consegui carregar os lançamentos. Tente de novo.", 500);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return erro("Pedido inválido. Tente de novo.", 400);
  }

  const corpo = DesfazerSchema.safeParse(json);
  if (!corpo.success) {
    return erro(corpo.error.issues[0]?.message ?? "Entrada inválida.", 400);
  }

  try {
    return Response.json(await desfazerLancamentos(corpo.data.ids));
  } catch (e) {
    console.error(e);
    return erro("Não consegui desfazer. Tente de novo.", 500);
  }
}
