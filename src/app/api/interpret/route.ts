/**
 * POST /api/interpret
 * Corpo esperado: { "texto": "vendi 3 blusas a 50 no pix" }
 * Resposta esperada: Resultado (src/lib/interpreter/schema.ts)
 *
 * TODO: implementar.
 * 1. Ler e validar o corpo (Zod) -> 400 se inválido.
 * 2. Chamar interpret(texto).
 * 3. Devolver Response.json(resultado); tratar erros do LLM (502/500).
 * Salvar no Supabase fica para depois da confirmação do usuário.
 */
export async function POST(request: Request): Promise<Response> {
  void request;
  return Response.json({ error: "Não implementado" }, { status: 501 });
}
