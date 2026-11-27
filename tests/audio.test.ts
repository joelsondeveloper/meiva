import { afterEach, describe, expect, test, vi } from "vitest";
import {
  ERRO_SEM_SUPORTE,
  escolherTipoGravacao,
  formatarTempo,
  juntarAoCampo,
  mensagemErroMicrofone,
} from "@/lib/chat/audio";
import { ERRO_SEM_CONEXAO, ErroApi, transcreverAudio } from "@/lib/chat/api";

const erroDom = (name: string) => Object.assign(new Error("x"), { name });

describe("escolherTipoGravacao", () => {
  test("Chrome/Android: webm com opus", () => {
    expect(escolherTipoGravacao((t) => t.startsWith("audio/webm"))).toBe("audio/webm;codecs=opus");
  });
  test("iOS Safari: só mp4", () => {
    expect(escolherTipoGravacao((t) => t === "audio/mp4")).toBe("audio/mp4");
  });
  test("nenhum conhecido: deixa o navegador escolher", () => {
    expect(escolherTipoGravacao(() => false)).toBe("");
  });
  test("isTypeSupported que lança não quebra", () => {
    expect(
      escolherTipoGravacao(() => {
        throw new Error("x");
      }),
    ).toBe("");
  });
});

describe("mensagemErroMicrofone", () => {
  test.each([
    ["NotAllowedError", /bloqueado.*Libere/],
    ["SecurityError", /bloqueado/],
    ["NotFoundError", /Não achei um microfone/],
    ["OverconstrainedError", /Não achei um microfone/],
    ["NotReadableError", /outro app/],
    ["QualquerOutro", /Tente de novo ou escreva/],
  ])("%s", (nome, esperado) => {
    expect(mensagemErroMicrofone(erroDom(nome))).toMatch(esperado);
  });
  test("erro sem nome", () => {
    expect(mensagemErroMicrofone("??")).toMatch(/Tente de novo/);
  });
  test("todas dizem o que fazer, sem pedir desculpa", () => {
    for (const n of ["NotAllowedError", "NotFoundError", "NotReadableError", "X"]) {
      expect(mensagemErroMicrofone(erroDom(n))).not.toMatch(/desculp/i);
    }
    expect(ERRO_SEM_SUPORTE).toMatch(/escreva/);
  });
});

describe("formatarTempo", () => {
  test.each([
    [0, "0:00"],
    [7.9, "0:07"],
    [59, "0:59"],
    [60, "1:00"],
    [-1, "0:00"],
  ])("%s → %s", (s, esperado) => expect(formatarTempo(s)).toBe(esperado));
});

describe("juntarAoCampo", () => {
  test("campo vazio: só o falado", () => {
    expect(juntarAoCampo("", " Vendi 50 de pudim. ", 500)).toBe("Vendi 50 de pudim.");
  });
  test("não apaga o que já estava escrito", () => {
    expect(juntarAoCampo("Marta pagou ", "30 no pix", 500)).toBe("Marta pagou 30 no pix");
  });
  test("respeita o limite do campo", () => {
    expect(juntarAoCampo("a".repeat(495), "bcdefgh", 500)).toHaveLength(500);
  });
});

describe("transcreverAudio", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("manda multipart com o campo audio e devolve o texto", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ texto: "oi" }));
    vi.stubGlobal("fetch", fetch);
    const audio = new Blob([new Uint8Array(10)], { type: "audio/mp4" });
    expect(await transcreverAudio(audio)).toEqual({ texto: "oi" });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/transcrever");
    expect(init.method).toBe("POST");
    expect((init.body as FormData).get("audio")).toBeInstanceOf(Blob);
  });

  test("sem internet: mensagem em português", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(transcreverAudio(new Blob())).rejects.toEqual(new ErroApi(ERRO_SEM_CONEXAO, 0));
  });

  test("422 do servidor: usa a mensagem dele", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "Não entendi o áudio." }, { status: 422 })));
    await expect(transcreverAudio(new Blob())).rejects.toMatchObject({ message: "Não entendi o áudio.", status: 422 });
  });

  test("413 sem corpo JSON (limite da plataforma): diz para gravar menos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Request Entity Too Large", { status: 413 })));
    await expect(transcreverAudio(new Blob())).rejects.toMatchObject({ message: "A gravação ficou grande demais. Grave até 1 minuto." });
  });
});
