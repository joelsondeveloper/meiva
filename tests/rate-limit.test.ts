import { describe, expect, test } from "vitest";
import { criarRateLimit, criarTetoDiario, segundosAteMeiaNoiteBR } from "@/lib/rate-limit";

const em = (iso: string) => new Date(iso).getTime();

describe("criarRateLimit", () => {
  test("janela deslizante por chave; consultar não gasta cota", () => {
    const rl = criarRateLimit({ limite: 2, janelaMs: 60_000 });
    const t0 = em("2026-03-10T12:00:00Z");
    expect(rl.consultar("a", t0).ok).toBe(true);
    expect(rl.verificar("a", t0).ok).toBe(true);
    expect(rl.verificar("a", t0 + 1000).ok).toBe(true);
    expect(rl.verificar("a", t0 + 2000)).toEqual({ ok: false, tenteEmSegundos: 58 });
    expect(rl.verificar("b", t0 + 2000).ok).toBe(true);
    expect(rl.verificar("a", t0 + 60_000).ok).toBe(true);
  });
});

describe("segundosAteMeiaNoiteBR", () => {
  test("23:59:30 em Brasília (02:59:30 UTC) faltam 30 s", () => {
    expect(segundosAteMeiaNoiteBR(em("2026-03-11T02:59:30Z"))).toBe(30);
  });
  test("00:00 em Brasília faltam 24 h", () => {
    expect(segundosAteMeiaNoiteBR(em("2026-03-11T03:00:00Z"))).toBe(24 * 3600);
  });
  test("21:00 em Brasília já é outro dia em UTC, mas faltam 3 h", () => {
    expect(segundosAteMeiaNoiteBR(em("2026-03-11T00:00:00Z"))).toBe(3 * 3600);
  });
});

describe("criarTetoDiario", () => {
  test("bloqueia no limite e zera à meia-noite de Brasília, não à de UTC", () => {
    const teto = criarTetoDiario({ limite: 2 });
    const noite = em("2026-03-10T23:00:00-03:00"); // 02:00 UTC do dia 11
    teto.registrar(noite);
    teto.registrar(noite);
    expect(teto.consultar(noite)).toEqual({ ok: false, tenteEmSegundos: 3600 });

    // 23:59:59 em Brasília (já dia 11 em UTC) ainda é o dia 10; 00:00 em Brasília zera.
    expect(teto.consultar(em("2026-03-10T23:59:59-03:00")).ok).toBe(false);
    expect(teto.consultar(em("2026-03-11T00:00:00-03:00")).ok).toBe(true);
  });

  test("limpar zera", () => {
    const teto = criarTetoDiario({ limite: 1 });
    teto.registrar();
    expect(teto.consultar().ok).toBe(false);
    teto.limpar();
    expect(teto.consultar().ok).toBe(true);
  });
});
