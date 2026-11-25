import { describe, expect, test, vi } from "vitest";
import type OpenAI from "openai";
import { agente, ErroAgente, MAX_ITERACOES } from "@/lib/agente/agente";
import { RepositorioMemoria } from "@/lib/agente/repositorio-memoria";
import { SYSTEM_PROMPT_AGENTE } from "@/lib/agente/prompt";

type Resposta = OpenAI.Chat.Completions.ChatCompletion;
type Params = OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

const texto = (content: string): Resposta =>
  ({ choices: [{ message: { role: "assistant", content }, finish_reason: "stop" }] }) as unknown as Resposta;

const chamar = (...calls: [string, unknown][]): Resposta =>
  ({
    choices: [
      {
        message: {
          role: "assistant",
          content: null,
          tool_calls: calls.map(([name, args], i) => ({
            id: `call_${i}`,
            type: "function",
            function: { name, arguments: typeof args === "string" ? args : JSON.stringify(args) },
          })),
        },
        finish_reason: "tool_calls",
      },
    ],
  }) as unknown as Resposta;

function clienteFalso(...respostas: Resposta[]) {
  const create = vi.fn(async (params: Params) => {
    void params;
    const r = respostas.shift();
    if (!r) throw new Error("sem mais respostas");
    return r;
  });
  return { client: { chat: { completions: { create } } } as unknown as Pick<OpenAI, "chat">, create };
}

const HOJE = "2026-03-10";
const vendaPix = {
  lancamentos: [{ natureza: "venda", valor_centavos: 15000, descricao: "3 blusas", forma_pagamento: "pix", data: HOJE }],
};

describe("agente", () => {
  test("chama a ferramenta, devolve o resultado para a IA e responde", async () => {
    const repositorio = new RepositorioMemoria();
    const { client, create } = clienteFalso(chamar(["registrar_lancamentos", vendaPix]), texto("Registrei R$ 150,00."));

    const saida = await agente({
      mensagens: [{ role: "user", content: "vendi 3 blusas a 50 no pix" }],
      dataReferencia: HOJE,
      model: "teste/modelo",
      repositorio,
      client,
    });

    expect(saida.resposta).toBe("Registrei R$ 150,00.");
    expect(saida.lancamentosCriados).toHaveLength(1);
    expect(saida.chamadas).toEqual([
      { nome: "registrar_lancamentos", args: vendaPix, resultado: { criados: [expect.objectContaining({ valor_centavos: 15000 })] } },
    ]);
    expect(repositorio.todos()).toHaveLength(1);

    const primeira = create.mock.calls[0][0];
    expect(primeira).toMatchObject({ model: "teste/modelo", temperature: 0, max_tokens: 3000, tool_choice: "auto" });
    expect(primeira.messages[0]).toEqual({ role: "system", content: SYSTEM_PROMPT_AGENTE });
    expect(primeira.messages[1].content).toContain(HOJE);
    expect(primeira.tools).toHaveLength(6);

    const segunda = create.mock.calls[1][0].messages;
    expect(segunda.at(-1)).toMatchObject({ role: "tool", tool_call_id: "call_0" });
  });

  test("erro de ferramenta volta para a IA em vez de derrubar", async () => {
    const { client, create } = clienteFalso(chamar(["desfazer_lancamento", { id: "x" }]), texto("Não achei."));
    const saida = await agente({ mensagens: [{ role: "user", content: "desfaz" }], repositorio: new RepositorioMemoria(), client, model: "m" });

    expect(saida.resposta).toBe("Não achei.");
    const toolMsg = create.mock.calls[1][0].messages.at(-1);
    expect(JSON.parse(String(toolMsg?.content))).toMatchObject({ erro: "Argumentos inválidos." });
  });

  test("desfeito no mesmo turno sai de lancamentosCriados", async () => {
    const repositorio = new RepositorioMemoria();
    const { client } = clienteFalso(
      chamar(["registrar_lancamentos", vendaPix]),
      chamar(["desfazer_lancamento", { id: "00000000-0000-4000-8000-000000000001" }]),
      texto("Pronto, desfiz."),
    );
    const saida = await agente({ mensagens: [{ role: "user", content: "x" }], dataReferencia: HOJE, repositorio, client, model: "m" });
    expect(saida.lancamentosCriados).toEqual([]);
    expect(repositorio.todos()[0].anulado_em).not.toBeNull();
  });

  test(`para em ${MAX_ITERACOES} iterações e força resposta em texto na última`, async () => {
    const respostas = Array.from({ length: MAX_ITERACOES }, () => chamar(["listar_ultimos", {}]));
    const { client, create } = clienteFalso(...respostas);
    const saida = await agente({ mensagens: [{ role: "user", content: "x" }], repositorio: new RepositorioMemoria(), client, model: "m" });

    expect(create).toHaveBeenCalledTimes(MAX_ITERACOES);
    expect(create.mock.calls.at(-1)?.[0].tool_choice).toBe("none");
    expect(saida.resposta).toMatch(/Não consegui concluir/);
    expect(saida.chamadas).toHaveLength(MAX_ITERACOES - 1);
  });

  test("usa só as últimas 10 mensagens do histórico", async () => {
    const { client, create } = clienteFalso(texto("ok"));
    const mensagens = Array.from({ length: 15 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `m${i}`,
    }));
    await agente({ mensagens, repositorio: new RepositorioMemoria(), client, model: "m" });
    const enviadas = create.mock.calls[0][0].messages.filter((m) => m.role !== "system");
    expect(enviadas.map((m) => m.content)).toEqual(mensagens.slice(-10).map((m) => m.content));
  });

  test("falha do modelo depois de gravar: ErroAgente carrega os criados", async () => {
    const repositorio = new RepositorioMemoria();
    // Primeira chamada registra; a segunda falha (clienteFalso fica sem respostas).
    const { client } = clienteFalso(chamar(["registrar_lancamentos", vendaPix]));

    const erro = await agente({ mensagens: [{ role: "user", content: "x" }], dataReferencia: HOJE, repositorio, client, model: "m" }).catch(
      (e: unknown) => e,
    );
    expect(erro).toBeInstanceOf(ErroAgente);
    expect((erro as ErroAgente).lancamentosCriados).toEqual([expect.objectContaining({ valor_centavos: 15000 })]);
    expect((erro as ErroAgente).chamadas).toHaveLength(1);
    expect((erro as ErroAgente).message).toMatch(/sem mais respostas/);
  });

  test("falha antes de gravar: ErroAgente sem criados", async () => {
    const { client } = clienteFalso();
    const erro = await agente({ mensagens: [{ role: "user", content: "x" }], repositorio: new RepositorioMemoria(), client, model: "m" }).catch(
      (e: unknown) => e,
    );
    expect(erro).toBeInstanceOf(ErroAgente);
    expect((erro as ErroAgente).lancamentosCriados).toEqual([]);
  });
});
