import { hojeBR, segundosAteMeiaNoiteBR } from "@/lib/datas";

/**
 * Rate limit em memória para o /api/interpret.
 *
 * Limitação conhecida: a memória é de cada instância do servidor. Na Vercel
 * cada instância (e cada cold start) tem seus próprios contadores, então o
 * limite real pode ser maior que o configurado. Serve para conter abuso e
 * gasto acidental com o modelo; para um limite exato, use um store
 * compartilhado (ex.: Redis/Upstash).
 */

export type ResultadoLimite =
  | { ok: true }
  | { ok: false; motivo: "ip" | "global"; segundosParaLiberar: number };

type Janela = { inicio: number; contagem: number };

/** `limite` chamadas por chave a cada `janelaMs` (janela fixa a partir da 1ª chamada). */
export class LimitePorChave {
  private readonly janelas = new Map<string, Janela>();

  constructor(
    readonly limite: number,
    readonly janelaMs: number,
  ) {}

  /** Milissegundos até a chave voltar a ser aceita (0 = pode agora). */
  esperaMs(chave: string, agora: number): number {
    const janela = this.janelas.get(chave);
    if (!janela || agora - janela.inicio >= this.janelaMs) return 0;
    if (janela.contagem < this.limite) return 0;
    return janela.inicio + this.janelaMs - agora;
  }

  registrar(chave: string, agora: number): void {
    const janela = this.janelas.get(chave);
    if (janela && agora - janela.inicio < this.janelaMs) {
      janela.contagem++;
      return;
    }
    this.limparExpiradas(agora);
    this.janelas.set(chave, { inicio: agora, contagem: 1 });
  }

  reiniciar(): void {
    this.janelas.clear();
  }

  /** Quantas chaves estão sendo acompanhadas. */
  get tamanho(): number {
    return this.janelas.size;
  }

  /** Evita que o Map cresça para sempre com IPs que não voltam. */
  private limparExpiradas(agora: number): void {
    if (this.janelas.size < 1000) return;
    for (const [chave, janela] of this.janelas) {
      if (agora - janela.inicio >= this.janelaMs) this.janelas.delete(chave);
    }
  }
}

/** `limite` chamadas por dia de Brasília: zera sozinho à meia-noite (America/Sao_Paulo). */
export class TetoDiario {
  private dia = "";
  private contagem = 0;

  constructor(readonly limite: number) {}

  esgotado(agora: Date): boolean {
    this.virarDia(agora);
    return this.contagem >= this.limite;
  }

  registrar(agora: Date): void {
    this.virarDia(agora);
    this.contagem++;
  }

  reiniciar(): void {
    this.dia = "";
    this.contagem = 0;
  }

  private virarDia(agora: Date): void {
    const hoje = hojeBR(agora);
    if (hoje !== this.dia) {
      this.dia = hoje;
      this.contagem = 0;
    }
  }
}

export type ConfigLimite = {
  /** Requisições por IP dentro da janela. */
  porIp: number;
  janelaMs: number;
  /** Teto somando todos os IPs, por dia de Brasília. */
  porDia: number;
};

export const LIMITE_INTERPRET: ConfigLimite = {
  porIp: 60,
  janelaMs: 10 * 60 * 1000,
  porDia: 500,
};

/** Combina o limite por IP com o teto global. Só conta a requisição se as duas regras deixarem. */
export function criarLimitador(config: ConfigLimite) {
  const porIp = new LimitePorChave(config.porIp, config.janelaMs);
  const global = new TetoDiario(config.porDia);

  return {
    consumir(ip: string, agora: Date = new Date()): ResultadoLimite {
      if (global.esgotado(agora)) {
        return { ok: false, motivo: "global", segundosParaLiberar: segundosAteMeiaNoiteBR(agora) };
      }
      const espera = porIp.esperaMs(ip, agora.getTime());
      if (espera > 0) {
        return { ok: false, motivo: "ip", segundosParaLiberar: Math.ceil(espera / 1000) };
      }
      porIp.registrar(ip, agora.getTime());
      global.registrar(agora);
      return { ok: true };
    },
    reiniciar(): void {
      porIp.reiniciar();
      global.reiniciar();
    },
  };
}

/** Instância usada pelo POST /api/interpret (estado do processo). */
export const limiteInterpret = criarLimitador(LIMITE_INTERPRET);

/**
 * IP do cliente. Na Vercel o primeiro item do x-forwarded-for é o IP real
 * (a plataforma sobrescreve o cabeçalho). Fora de um proxy confiável esse
 * cabeçalho pode ser forjado, por isso o teto global existe.
 */
export function ipDaRequisicao(request: Request): string {
  const encaminhado = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return encaminhado || request.headers.get("x-real-ip")?.trim() || "desconhecido";
}
