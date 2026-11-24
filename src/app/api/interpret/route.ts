import { z } from "zod";
import { agente, ErroAgente, MAX_MENSAGENS, type SaidaAgente } from "@/lib/agente/agente";
import { repositorioSupabase } from "@/lib/lancamentos/repository";
import { montarResumoCaixa } from "@/lib/lancamentos/resumo";
import type { RespostaInterpret } from "@/lib/lancamentos/tipos";
import {
  ipDaRequisicao,
  rateLimitInterpret,
  respostaLimiteExcedido,
  respostaTetoDiario,
  tetoDiarioInterpret,
} from "@/lib/rate-limit";

/**
 * POST /api/interpret
 * Corpo: { "mensagens": [{ "role": "user", "content": "vendi 3 blusas a 50 no pix" }, ...] }
 * (histórico mantido pela tela; só as últimas 10 são usadas; a última precisa ser do usuário)
 *
 * 200 { resposta, resumo, lancamentosCriados }
 * 400 entrada inválida · 502 falha da IA · 500 falha no banco
 * 429 mais de 60 em 10 min por IP, ou teto global de 500 no dia (zera à meia-noite de Brasília)
 * Se a IA falhar DEPOIS de gravar algo, ainda é 200 (com RESPOSTA_PARCIAL), para
 * o usuário ver o que foi salvo e não mandar de novo (o que duplicaria).
 */

/** Chamadas ao modelo podem encadear até 6 vezes: o padrão da plataforma é curto demais. */
export const maxDuration = 60;

const RESPOSTA_PARCIAL = "Registrei, mas não consegui montar a resposta. Confira a lista abaixo.";

const MensagemSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("user"),
    content: z.string().trim().min(1, "A mensagem não pode ser vazia.").max(500, "A mensagem deve ter no máximo 500 caracteres."),
  }),
  z.object({ role: z.literal("assistant"), content: z.string().trim().min(1).max(2000) }),
]);

const CorpoSchema = z.object({
  mensagens: z
    .array(MensagemSchema, { error: "Envie o campo mensagens." })
    .min(1, "Envie pelo menos uma mensagem.")
    .max(50, "Histórico grande demais.")
    .transform((m) => m.slice(-MAX_MENSAGENS))
    .refine((m) => m.at(-1)?.role === "user", "A última mensagem precisa ser do usuário."),
});

const erro = (mensagem: string, status: number) => Response.json({ error: mensagem }, { status });

export async function POST(request: Request): Promise<Response> {
  // Consulta os dois antes de gastar cota: quem é barrado por um não gasta o outro.
  const ip = ipDaRequisicao(request);
  const porIp = rateLimitInterpret.consultar(ip);
  if (!porIp.ok) return respostaLimiteExcedido(porIp.tenteEmSegundos, "mensagens");
  const diario = tetoDiarioInterpret.consultar();
  if (!diario.ok) return respostaTetoDiario(diario.tenteEmSegundos);
  rateLimitInterpret.registrar(ip);
  tetoDiarioInterpret.registrar();

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

  let saida: Pick<SaidaAgente, "resposta" | "lancamentosCriados">;
  try {
    saida = await agente({ mensagens: corpo.data.mensagens });
  } catch (e) {
    console.error(e);
    if (e instanceof ErroAgente && e.lancamentosCriados.length > 0) {
      saida = { resposta: RESPOSTA_PARCIAL, lancamentosCriados: e.lancamentosCriados };
    } else {
      return erro("Não consegui responder agora. Tente de novo em instantes.", 502);
    }
  }

  try {
    const resumo = await montarResumoCaixa(repositorioSupabase);
    const body: RespostaInterpret = {
      resposta: saida.resposta,
      resumo,
      lancamentosCriados: saida.lancamentosCriados,
    };
    return Response.json(body);
  } catch (e) {
    console.error(e);
    return erro("Falha ao carregar o resumo do caixa.", 500);
  }
}
