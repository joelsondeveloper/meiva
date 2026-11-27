import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/transcricao/transcricao", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/transcricao/transcricao")>()),
  transcrever: vi.fn(),
}));

const { transcrever } = await import("@/lib/transcricao/transcricao");
const { rateLimitTranscrever, tetoDiarioTranscrever } = await import("@/lib/rate-limit");
const { POST, MAX_BYTES_AUDIO, NAO_ENTENDI, maxDuration } = await import("@/app/api/transcrever/route");

const mTranscrever = vi.mocked(transcrever);

const audio = (bytes = 5000, type = "audio/webm;codecs=opus") => new Blob([new Uint8Array(bytes)], { type });

function post(arquivo: Blob | string | null, { ip = "1.2.3.4", headers = {} as Record<string, string> } = {}) {
  const form = new FormData();
  if (arquivo !== null) form.set("audio", arquivo);
  return POST(
    new Request("http://localhost/api/transcrever", {
      method: "POST",
      headers: { "x-forwarded-for": ip, ...headers },
      body: form,
    }),
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  rateLimitTranscrever.limpar();
  tetoDiarioTranscrever.limpar();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/transcrever", () => {
  test("200: devolve o texto transcrito", async () => {
    mTranscrever.mockResolvedValue("Vendi 50 de pudim no pix.");
    const res = await post(audio());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ texto: "Vendi 50 de pudim no pix." });
  });

  test.each([
    ["Chrome/Android (webm com codec)", "audio/webm;codecs=opus", "audio.webm"],
    ["iOS Safari (mp4)", "audio/mp4", "audio.m4a"],
    ["Firefox (ogg)", "audio/ogg;codecs=opus", "audio.ogg"],
  ])("aceita %s e manda com a extensão certa", async (_, tipo, nome) => {
    mTranscrever.mockResolvedValue("oi");
    const res = await post(audio(5000, tipo));
    expect(res.status).toBe(200);
    expect(mTranscrever).toHaveBeenCalledWith(expect.any(Blob), nome);
  });

  test("400 sem o campo audio", async () => {
    expect((await post(null)).status).toBe(400);
  });

  test("400 quando audio é texto e não arquivo", async () => {
    expect((await post("nao sou audio")).status).toBe(400);
  });

  test("400 quando o corpo não é multipart", async () => {
    const res = await POST(
      new Request("http://localhost/api/transcrever", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      }),
    );
    expect(res.status).toBe(400);
  });

  test("413 quando o arquivo passa do limite", async () => {
    const res = await post(audio(MAX_BYTES_AUDIO + 1));
    expect(res.status).toBe(413);
    expect((await res.json()).error).toMatch(/1 minuto/);
    expect(mTranscrever).not.toHaveBeenCalled();
  });

  test("413 pelo content-length, antes de ler o corpo", async () => {
    const res = await post(audio(), { headers: { "content-length": String(MAX_BYTES_AUDIO * 2) } });
    expect(res.status).toBe(413);
  });

  test("415 para tipo que não é áudio", async () => {
    const res = await post(audio(5000, "image/png"));
    expect(res.status).toBe(415);
    expect(mTranscrever).not.toHaveBeenCalled();
  });

  test("422 para gravação curta demais, sem chamar o serviço", async () => {
    const res = await post(audio(200));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe(NAO_ENTENDI);
    expect(mTranscrever).not.toHaveBeenCalled();
  });

  test("422 quando a transcrição vem vazia (silêncio ou barulho)", async () => {
    mTranscrever.mockResolvedValue("");
    const res = await post(audio());
    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe(NAO_ENTENDI);
  });

  test("502 quando o serviço falha, sem vazar detalhes", async () => {
    mTranscrever.mockRejectedValue(new Error("upstream 500: chave sk-xxx"));
    const res = await post(audio());
    expect(res.status).toBe(502);
    const corpo = await res.json();
    expect(corpo.error).toMatch(/Tente de novo/);
    expect(JSON.stringify(corpo)).not.toMatch(/sk-|upstream/);
  });

  test("429 depois de 60 gravações em 10 min do mesmo IP; outro IP segue", async () => {
    mTranscrever.mockResolvedValue("oi");
    for (let i = 0; i < 60; i++) expect((await post(audio())).status).toBe(200);
    const barrado = await post(audio());
    expect(barrado.status).toBe(429);
    expect(barrado.headers.get("retry-after")).toBeTruthy();
    expect((await barrado.json()).error).toMatch(/gravações/);
    expect((await post(audio(), { ip: "5.6.7.8" })).status).toBe(200);
  });

  test("429 no teto diário global, com mensagem de gravações", async () => {
    mTranscrever.mockResolvedValue("oi");
    for (let i = 0; i < 500; i++) tetoDiarioTranscrever.registrar();
    const res = await post(audio());
    expect(res.status).toBe(429);
    expect((await res.json()).error).toMatch(/limite de gravações de hoje/);
  });

  test("tempo máximo da função cobre a transcrição", () => {
    expect(maxDuration).toBeGreaterThanOrEqual(30);
  });
});
