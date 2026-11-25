import { describe, expect, test } from "vitest";
import { hojeBR } from "@/lib/datas";

describe("hojeBR", () => {
  test("à noite no Brasil ainda é o mesmo dia (UTC já virou)", () => {
    // 23/11/2026 22:30 em São Paulo (UTC-3) = 24/11 01:30 UTC
    expect(hojeBR(new Date("2026-11-24T01:30:00Z"))).toBe("2026-11-23");
  });

  test("formato YYYY-MM-DD com zero à esquerda", () => {
    expect(hojeBR(new Date("2026-03-05T12:00:00Z"))).toBe("2026-03-05");
  });
});
