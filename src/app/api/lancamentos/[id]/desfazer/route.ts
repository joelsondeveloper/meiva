import { z } from "zod";
import { desfazerLancamento, ErroFerramenta } from "@/lib/agente/ferramentas";
import { hojeBR } from "@/lib/datas";
import { repositorioSupabase } from "@/lib/lancamentos/repository";
import { montarResumoCaixa } from "@/lib/lancamentos/resumo";
import type { RespostaDesfazer } from "@/lib/lancamentos/tipos";
import { ipDaRequisicao, rateLimitDesfazer, respostaLimiteExcedido } from "@/lib/rate-limit";

/**
 * POST /api/lancamentos/:id/desfazer
 * Anula o lançamento (soft delete: a linha fica, com anulado_em preenchido).
 * 200 { lancamento, resumo } · 400 id inválido · 404 não existe ou já desfeito
 * 429 muitas requisições (30 / 10 min por IP) · 500 falha no banco
 */

export async function POST(request: Request, ctx: RouteContext<"/api/lancamentos/[id]/desfazer">) {
  const limite = rateLimitDesfazer.verificar(ipDaRequisicao(request));
  if (!limite.ok) return respostaLimiteExcedido(limite.tenteEmSegundos);

  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) {
    return Response.json({ error: "Id de lançamento inválido." }, { status: 400 });
  }

  const repo = repositorioSupabase;
  try {
    const { efeitos } = await desfazerLancamento({ id }, { repo, hoje: hojeBR() });
    if (!efeitos.anulado) throw new ErroFerramenta("não anulado");
    const body: RespostaDesfazer = { lancamento: efeitos.anulado, resumo: await montarResumoCaixa(repo) };
    return Response.json(body);
  } catch (e) {
    if (e instanceof ErroFerramenta) {
      return Response.json({ error: "Lançamento não encontrado ou já desfeito." }, { status: 404 });
    }
    console.error(e);
    return Response.json({ error: "Falha ao desfazer o lançamento." }, { status: 500 });
  }
}
