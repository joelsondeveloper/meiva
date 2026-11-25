import { z } from "zod";
import { hojeBR } from "@/lib/datas";
import { repositorioSupabase } from "@/lib/lancamentos/repository";
import { resumoDoDia } from "@/lib/lancamentos/resumo";

/**
 * GET /api/lancamentos?data=YYYY-MM-DD  (padrão: hoje em Brasília)
 * 200 { lancamentos, resumo } · 400 data inválida · 500 falha no banco
 * Lançamentos desfeitos não aparecem nem contam.
 */

const DataSchema = z.iso.date();

export async function GET(request: Request): Promise<Response> {
  const param = new URL(request.url).searchParams.get("data");
  const data = DataSchema.safeParse(param ?? hojeBR());
  if (!data.success) {
    return Response.json({ error: "Data inválida: use YYYY-MM-DD." }, { status: 400 });
  }

  try {
    return Response.json(await resumoDoDia(repositorioSupabase, data.data));
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Falha ao carregar os lançamentos." }, { status: 500 });
  }
}
