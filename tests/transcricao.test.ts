import { afterEach, describe, expect, test, vi } from "vitest";

const create = vi.fn();
vi.mock("@/lib/llm/openrouter", () => ({
  getOpenRouterClient: () => ({ audio: { transcriptions: { create } } }),
}));

const { limparTranscricao, transcrever, modeloTranscricao, MODELO_TRANSCRICAO_PADRAO, PROMPT_VOCABULARIO } =
  await import("@/lib/transcricao/transcricao");

afterEach(() => {
  create.mockReset();
  vi.unstubAllEnvs();
});

describe("limparTranscricao", () => {
  test("mantém a fala, sem espaços sobrando", () => {
    expect(limparTranscricao("  Vendi 50 de pudim\n no pix. ")).toBe("Vendi 50 de pudim no pix.");
  });

  test.each([
    ["vazio", ""],
    ["só pontuação", " ... "],
    ["eco do prompt de vocabulário", "Pix, fiado, pila, conto, reais."],
    ["legenda inventada", "Legendas pela comunidade Amara.org"],
    ["despedida de vídeo", "Obrigado por assistir!"],
    ["só 'E aí' (silêncio no Whisper)", "E aí"],
  ])("devolve vazio para %s", (_, bruto) => {
    expect(limparTranscricao(bruto)).toBe("");
  });

  test("não descarta frase real que contém palavras do vocabulário", () => {
    expect(limparTranscricao("Recebi vinte pila no pix")).toBe("Recebi vinte pila no pix");
  });

  test("corta em 500 caracteres (limite do campo)", () => {
    expect(limparTranscricao("a".repeat(600))).toHaveLength(500);
  });
});

describe("transcrever", () => {
  test("chama o modelo em português com o prompt de vocabulário e limpa a saída", async () => {
    create.mockResolvedValue({ text: " Paguei 1.200 de aluguel. " });
    const texto = await transcrever(new Blob([new Uint8Array(10)], { type: "audio/mp4" }), "audio.m4a");
    expect(texto).toBe("Paguei 1.200 de aluguel.");
    const args = create.mock.calls[0][0];
    expect(args).toMatchObject({ model: MODELO_TRANSCRICAO_PADRAO, language: "pt", prompt: PROMPT_VOCABULARIO });
    expect(args.file.name).toBe("audio.m4a");
  });

  test("silêncio vira vazio", async () => {
    create.mockResolvedValue({ text: "" });
    expect(await transcrever(new Blob([new Uint8Array(10)], { type: "audio/webm" }), "audio.webm")).toBe("");
  });

  test("OPENROUTER_MODEL_TRANSCRICAO troca o modelo", () => {
    vi.stubEnv("OPENROUTER_MODEL_TRANSCRICAO", "openai/gpt-4o-mini-transcribe");
    expect(modeloTranscricao()).toBe("openai/gpt-4o-mini-transcribe");
  });
});
