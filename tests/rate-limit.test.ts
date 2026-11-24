import { describe, expect, test } from "vitest";
import {
  LimitePorChave,
  TetoDiario,
  criarLimitador,
  ipDaRequisicao,
} from "@/lib/rate-limit";

const MIN = 60 * 1000;

describe("LimitePorChave", () => {
  test("aceita até o limite e depois informa a espera", () => {
    const l = new LimitePorChave(2, 10 * MIN);
    const t0 = 1_000_000;
    expect(l.esperaMs("a", t0)).toBe(0);
    l.registrar("a", t0);
    l.registrar("a", t0 + MIN);
    expect(l.esperaMs("a", t0 + 2 * MIN)).toBe(8 * MIN);
    expect(l.esperaMs("b", t0 + 2 * MIN)).toBe(0);
  });

  test("a janela recomeça depois de vencer", () => {
    const l = new LimitePorChave(1, 10 * MIN);
    l.registrar("a", 0);
    expect(l.esperaMs("a", 10 * MIN - 1)).toBe(1);
    expect(l.esperaMs("a", 10 * MIN)).toBe(0);
    l.registrar("a", 10 * MIN);
    expect(l.esperaMs("a", 10 * MIN + 1)).toBeGreaterThan(0);
  });

  test("descarta janelas vencidas quando o mapa cresce", () => {
    const l = new LimitePorChave(1, MIN);
    for (let i = 0; i < 1000; i++) l.registrar(`ip${i}`, 0);
    expect(l.tamanho).toBe(1000);
    l.registrar("novo", 2 * MIN);
    // as 1000 antigas venceram e foram limpas; só "novo" continua contando
    expect(l.tamanho).toBe(1);
    expect(l.esperaMs("novo", 2 * MIN)).toBe(MIN);
  });
});

describe("TetoDiario", () => {
  test("zera na virada do dia de Brasília", () => {
    const t = new TetoDiario(1);
    t.registrar(new Date("2026-11-24T23:00:00Z")); // 20:00 em Brasília
    expect(t.esgotado(new Date("2026-11-25T02:59:59Z"))).toBe(true); // 23:59:59
    expect(t.esgotado(new Date("2026-11-25T03:00:00Z"))).toBe(false); // 00:00
  });
});

describe("criarLimitador", () => {
  const agora = new Date("2026-11-24T15:00:00Z");

  test("bloqueio por IP informa os segundos até liberar", () => {
    const l = criarLimitador({ porIp: 1, janelaMs: 10 * MIN, porDia: 100 });
    expect(l.consumir("a", agora)).toEqual({ ok: true });
    expect(l.consumir("a", new Date(agora.getTime() + 30_500))).toEqual({
      ok: false,
      motivo: "ip",
      segundosParaLiberar: 570,
    });
  });

  test("teto global vale para todos os IPs", () => {
    const l = criarLimitador({ porIp: 10, janelaMs: 10 * MIN, porDia: 2 });
    l.consumir("a", agora);
    l.consumir("b", agora);
    expect(l.consumir("c", agora)).toMatchObject({ ok: false, motivo: "global" });
  });

  test("reiniciar zera tudo", () => {
    const l = criarLimitador({ porIp: 1, janelaMs: 10 * MIN, porDia: 1 });
    l.consumir("a", agora);
    l.reiniciar();
    expect(l.consumir("a", agora)).toEqual({ ok: true });
  });
});

describe("ipDaRequisicao", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://localhost/", { headers });

  test("primeiro item do x-forwarded-for", () => {
    expect(ipDaRequisicao(req({ "x-forwarded-for": " 203.0.113.5 , 10.0.0.1" }))).toBe(
      "203.0.113.5",
    );
  });

  test("cai para x-real-ip e depois para 'desconhecido'", () => {
    expect(ipDaRequisicao(req({ "x-real-ip": "203.0.113.6" }))).toBe("203.0.113.6");
    expect(ipDaRequisicao(req({}))).toBe("desconhecido");
  });
});
