import { describe, expect, test } from "vitest";
import { hojeBR, segundosAteMeiaNoiteBR } from "@/lib/datas";

describe("hojeBR", () => {
  test("à noite no Brasil ainda é o mesmo dia (UTC já virou)", () => {
    // 23/11/2026 22:30 em São Paulo (UTC-3) = 24/11 01:30 UTC
    expect(hojeBR(new Date("2026-11-24T01:30:00Z"))).toBe("2026-11-23");
  });

  test("formato YYYY-MM-DD com zero à esquerda", () => {
    expect(hojeBR(new Date("2026-03-05T12:00:00Z"))).toBe("2026-03-05");
  });
});

describe("segundosAteMeiaNoiteBR", () => {
  test("conta pelo relógio de Brasília", () => {
    // 23:59:00 em Brasília (02:59 UTC do dia seguinte)
    expect(segundosAteMeiaNoiteBR(new Date("2026-11-25T02:59:00Z"))).toBe(60);
    // 12:00 em Brasília
    expect(segundosAteMeiaNoiteBR(new Date("2026-11-24T15:00:00Z"))).toBe(12 * 3600);
  });

  test("exatamente à meia-noite faltam 24 h", () => {
    expect(segundosAteMeiaNoiteBR(new Date("2026-11-25T03:00:00Z"))).toBe(86_400);
  });
});
