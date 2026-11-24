import type OpenAI from "openai";
import { z } from "zod";
import {
  FormaPagamento,
  LancamentoBaseSchema,
  Natureza,
  TIPO_DA_NATUREZA,
  TipoLancamento,
  type Lancamento,
} from "@/lib/interpreter/schema";
import { normalizarPessoa, pessoaCasa } from "@/lib/lancamentos/pessoa";
import { calcularAReceber, calcularSaldo, type DevedorResumo } from "@/lib/lancamentos/saldo";
import type { LancamentoSalvo, RepositorioLancamentos } from "@/lib/lancamentos/tipos";

/**
 * Ferramentas do agente. Cada uma tem um schema Zod para os argumentos e roda
 * no servidor: a IA só escolhe a ferramenta e os argumentos, e tudo é validado
 * aqui antes de tocar no banco. Nada de SQL livre.
 *
 * Erros (argumento inválido, regra de negócio, id inexistente) NÃO lançam
 * exceção: viram `{ erro }` e voltam para a IA, que pode corrigir ou perguntar.
 */

export type ContextoFerramentas = {
  repo: RepositorioLancamentos;
  /** "Hoje" no fuso de Brasília (YYYY-MM-DD). Datas futuras são recusadas. */
  hoje: string;
};

/** O que a ferramenta mudou no banco (o agente usa para montar lancamentosCriados). */
export type Efeitos = {
  criados?: LancamentoSalvo[];
  anulado?: LancamentoSalvo;
  corrigido?: LancamentoSalvo;
};

export type ExecucaoFerramenta = {
  resultado: unknown;
  efeitos: Efeitos;
};

/** Erro de uso da ferramenta: vira `{ erro }` para a IA. */
export class ErroFerramenta extends Error {
  constructor(
    message: string,
    readonly extra?: Record<string, unknown>,
  ) {
    super(message);
  }
}

const VALOR_MAXIMO = 100_000_000; // R$ 1.000.000,00 num lançamento só é quase certamente erro.

const Valor = z.number().int().positive().max(VALOR_MAXIMO);
const Data = z.iso.date();
const Id = z.uuid();
const Pessoa = z.string().trim().min(1).max(80);

/** Visão compacta do lançamento para a IA (menos tokens). */
function paraIA(l: LancamentoSalvo) {
  return {
    id: l.id,
    tipo: l.tipo,
    natureza: l.natureza,
    valor_centavos: l.valor_centavos,
    descricao: l.descricao,
    forma_pagamento: l.forma_pagamento,
    pessoa: l.pessoa,
    data: l.data,
  };
}

/** Regras que valem para criar e para corrigir. Devolve a mensagem do problema ou null. */
function violacaoDeRegra(l: Lancamento, hoje: string): string | null {
  if (l.tipo !== TIPO_DA_NATUREZA[l.natureza]) {
    return `natureza "${l.natureza}" exige tipo "${TIPO_DA_NATUREZA[l.natureza]}".`;
  }
  if (l.data > hoje) return `data ${l.data} está no futuro (hoje é ${hoje}).`;
  if (l.forma_pagamento === "fiado" && (l.natureza === "aporte" || l.natureza === "retirada_pessoal")) {
    return `${l.natureza} não pode ser fiado.`;
  }
  if (l.natureza === "recebimento_fiado") {
    if (l.forma_pagamento === "fiado") return "recebimento de fiado precisa da forma realmente usada (pix, dinheiro...), não fiado.";
    if (!l.pessoa) return "recebimento de fiado precisa da pessoa que pagou.";
  }
  if (l.natureza === "venda" && l.forma_pagamento === "fiado" && !l.pessoa) {
    return "venda fiado precisa do nome do cliente (pessoa).";
  }
  return null;
}

async function devedores(repo: RepositorioLancamentos): Promise<DevedorResumo[]> {
  return calcularAReceber(await repo.listarFiados()).porPessoa;
}

function casarDevedores(lista: DevedorResumo[], consulta: string): DevedorResumo[] {
  const q = normalizarPessoa(consulta);
  return lista.filter((d) => pessoaCasa(q, normalizarPessoa(d.pessoa)));
}

// --- registrar_lancamentos ---------------------------------------------------

const LancamentoArgs = LancamentoBaseSchema.extend({
  /** Opcional: se vier, precisa bater com a natureza; se não vier, é deduzido dela. */
  tipo: TipoLancamento.optional(),
  natureza: Natureza,
  valor_centavos: Valor,
  descricao: z.string().trim().min(1).max(120),
  forma_pagamento: FormaPagamento.optional(),
  pessoa: Pessoa.nullable().optional(),
  data: Data,
});

export const RegistrarArgs = z.object({
  lancamentos: z.array(LancamentoArgs).min(1).max(20),
});

export async function registrarLancamentos(
  args: z.infer<typeof RegistrarArgs>,
  { repo, hoje }: ContextoFerramentas,
): Promise<ExecucaoFerramenta> {
  const lista = await devedores(repo);
  const avisos: string[] = [];
  const prontos: Lancamento[] = [];

  for (const [i, a] of args.lancamentos.entries()) {
    const l: Lancamento = {
      tipo: a.tipo ?? TIPO_DA_NATUREZA[a.natureza],
      natureza: a.natureza,
      valor_centavos: a.valor_centavos,
      descricao: a.descricao,
      forma_pagamento: a.forma_pagamento ?? null,
      pessoa: a.pessoa ?? null,
      data: a.data,
    };

    const problema = violacaoDeRegra(l, hoje);
    if (problema) throw new ErroFerramenta(`lancamentos[${i}]: ${problema} Nada foi registrado.`);

    // Recebimento usa o nome de quem deve, para o "a receber" bater.
    if (l.natureza === "recebimento_fiado" && l.pessoa) {
      const casados = casarDevedores(lista, l.pessoa);
      if (casados.length > 1) {
        throw new ErroFerramenta(
          `lancamentos[${i}]: mais de uma pessoa com fiado casa com "${l.pessoa}". Pergunte qual. Nada foi registrado.`,
          { candidatos: casados },
        );
      }
      if (casados.length === 1) {
        const devedor = casados[0];
        l.pessoa = devedor.pessoa;
        if (l.valor_centavos > devedor.valor_centavos) {
          avisos.push(`${devedor.pessoa} devia ${devedor.valor_centavos} centavos; o recebimento é maior que a dívida.`);
        }
      } else {
        avisos.push(`Não havia fiado em aberto para "${l.pessoa}".`);
      }
    }
    prontos.push(l);
  }

  const criados = await repo.inserir(prontos);
  return {
    resultado: { criados: criados.map(paraIA), ...(avisos.length ? { avisos } : {}) },
    efeitos: { criados },
  };
}

// --- buscar_devedores --------------------------------------------------------

export const BuscarDevedoresArgs = z.object({
  pessoa: Pessoa.optional(),
});

export async function buscarDevedores(
  args: z.infer<typeof BuscarDevedoresArgs>,
  { repo }: ContextoFerramentas,
): Promise<ExecucaoFerramenta> {
  const lista = await devedores(repo);
  if (!args.pessoa) {
    return {
      resultado: { devedores: lista, total: lista.reduce((s, d) => s + d.valor_centavos, 0) },
      efeitos: {},
    };
  }

  const casados = casarDevedores(lista, args.pessoa);
  if (casados.length > 1) {
    return {
      resultado: {
        ambiguo: true,
        mensagem: `Mais de uma pessoa casa com "${args.pessoa}". Pergunte ao usuário qual delas.`,
        candidatos: casados,
      },
      efeitos: {},
    };
  }
  return {
    resultado: {
      devedores: casados,
      total: casados.reduce((s, d) => s + d.valor_centavos, 0),
      ...(casados.length === 0 ? { mensagem: `Nenhum fiado em aberto para "${args.pessoa}".` } : {}),
    },
    efeitos: {},
  };
}

// --- consultar_resumo --------------------------------------------------------

export const ConsultarResumoArgs = z
  .object({ de: Data, ate: Data })
  .refine((a) => a.de <= a.ate, { message: "de precisa ser menor ou igual a ate." });

export async function consultarResumo(
  args: z.infer<typeof ConsultarResumoArgs>,
  { repo }: ContextoFerramentas,
): Promise<ExecucaoFerramenta> {
  const [periodo, fiados] = await Promise.all([repo.listar(args), repo.listarFiados()]);
  return {
    resultado: {
      de: args.de,
      ate: args.ate,
      quantidade_lancamentos: periodo.length,
      ...calcularSaldo(periodo),
      // Global (todos os fiados em aberto), não só do período.
      a_receber: calcularAReceber(fiados),
    },
    efeitos: {},
  };
}

// --- listar_ultimos ----------------------------------------------------------

export const ListarUltimosArgs = z.object({
  n: z.number().int().min(1).max(10).default(5),
});

export async function listarUltimos(
  args: z.infer<typeof ListarUltimosArgs>,
  { repo }: ContextoFerramentas,
): Promise<ExecucaoFerramenta> {
  const ultimos = await repo.ultimos(args.n);
  return { resultado: { lancamentos: ultimos.map(paraIA) }, efeitos: {} };
}

// --- desfazer_lancamento -----------------------------------------------------

export const DesfazerArgs = z.object({ id: Id });

export async function desfazerLancamento(
  args: z.infer<typeof DesfazerArgs>,
  { repo }: ContextoFerramentas,
): Promise<ExecucaoFerramenta> {
  const atual = await repo.buscarPorId(args.id);
  if (!atual) throw new ErroFerramenta(`Lançamento ${args.id} não existe. Use listar_ultimos para achar o id.`);
  if (atual.anulado_em) throw new ErroFerramenta(`Lançamento ${args.id} já estava desfeito.`);

  const anulado = await repo.anular(args.id);
  if (!anulado) throw new ErroFerramenta(`Não consegui desfazer ${args.id}.`);
  return { resultado: { desfeito: paraIA(anulado) }, efeitos: { anulado } };
}

// --- corrigir_lancamento -----------------------------------------------------

export const CorrigirArgs = z
  .object({
    id: Id,
    valor_centavos: Valor.optional(),
    descricao: z.string().trim().min(1).max(120).optional(),
    forma_pagamento: FormaPagamento.optional(),
    data: Data.optional(),
    pessoa: Pessoa.nullable().optional(),
  })
  .refine((a) => Object.keys(a).some((k) => k !== "id"), {
    message: "Informe pelo menos um campo para corrigir.",
  });

export async function corrigirLancamento(
  args: z.infer<typeof CorrigirArgs>,
  { repo, hoje }: ContextoFerramentas,
): Promise<ExecucaoFerramenta> {
  const { id, ...campos } = args;
  const atual = await repo.buscarPorId(id);
  if (!atual) throw new ErroFerramenta(`Lançamento ${id} não existe. Use listar_ultimos para achar o id.`);
  if (atual.anulado_em) throw new ErroFerramenta(`Lançamento ${id} foi desfeito e não pode ser corrigido.`);

  const problema = violacaoDeRegra({ ...atual, ...campos }, hoje);
  if (problema) throw new ErroFerramenta(`${problema} Nada foi alterado.`);

  const corrigido = await repo.atualizar(id, campos);
  if (!corrigido) throw new ErroFerramenta(`Não consegui corrigir ${id}.`);
  return {
    resultado: { antes: paraIA(atual), depois: paraIA(corrigido) },
    efeitos: { corrigido },
  };
}

// --- catálogo ----------------------------------------------------------------

type Ferramenta = {
  descricao: string;
  args: z.ZodType;
  executar: (args: never, ctx: ContextoFerramentas) => Promise<ExecucaoFerramenta>;
};

export const FERRAMENTAS = {
  registrar_lancamentos: {
    descricao:
      "Registra um ou mais lançamentos no caixa. Valores em centavos. Tudo ou nada: se um for inválido, nenhum é salvo.",
    args: RegistrarArgs,
    executar: registrarLancamentos,
  },
  buscar_devedores: {
    descricao:
      "Quanto cada cliente deve (fiados menos recebimentos), com busca aproximada por nome. Se mais de uma pessoa casar, devolve os candidatos.",
    args: BuscarDevedoresArgs,
    executar: buscarDevedores,
  },
  consultar_resumo: {
    descricao:
      "Resumo do caixa entre duas datas (inclusive): entradas, saídas, saldo, vendas, aportes, recebimentos, despesas, retiradas e o a receber global.",
    args: ConsultarResumoArgs,
    executar: consultarResumo,
  },
  listar_ultimos: {
    descricao: "Lista os últimos lançamentos (mais recentes primeiro, até 10), com id.",
    args: ListarUltimosArgs,
    executar: listarUltimos,
  },
  desfazer_lancamento: {
    descricao: "Desfaz (anula) um lançamento pelo id. Não apaga: o lançamento deixa de contar.",
    args: DesfazerArgs,
    executar: desfazerLancamento,
  },
  corrigir_lancamento: {
    descricao: "Corrige campos de um lançamento pelo id (valor, descrição, forma, data ou pessoa).",
    args: CorrigirArgs,
    executar: corrigirLancamento,
  },
} satisfies Record<string, Ferramenta>;

export type NomeFerramenta = keyof typeof FERRAMENTAS;

/**
 * Tira os `pattern` gigantes que o Zod gera para date/uuid quando já existe
 * `format`: gastam tokens e alguns provedores recusam regex complexa.
 * A validação de verdade continua no Zod, no servidor.
 */
function enxugar(no: unknown): void {
  if (Array.isArray(no)) return no.forEach(enxugar);
  if (!no || typeof no !== "object") return;
  const obj = no as Record<string, unknown>;
  if (obj.format && obj.pattern) delete obj.pattern;
  Object.values(obj).forEach(enxugar);
}

function jsonSchema(schema: z.ZodType): Record<string, unknown> {
  const s = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" }) as Record<string, unknown>;
  delete s.$schema;
  enxugar(s);
  return s;
}

/** Definições no formato `tools` da API (OpenAI/OpenRouter). */
export const DEFINICOES_FERRAMENTAS: OpenAI.Chat.Completions.ChatCompletionFunctionTool[] = Object.entries(
  FERRAMENTAS,
).map(([nome, f]) => ({
  type: "function",
  function: { name: nome, description: f.descricao, parameters: jsonSchema(f.args) },
}));

/**
 * Executa uma ferramenta a partir do que a IA mandou (nome + JSON em texto).
 * Nunca lança por erro de uso: devolve `{ erro }` como resultado. Falha de
 * banco também volta como erro para a IA poder avisar o usuário.
 */
export async function executarFerramenta(
  nome: string,
  argumentosJson: string,
  ctx: ContextoFerramentas,
): Promise<ExecucaoFerramenta> {
  const semEfeito = (resultado: unknown): ExecucaoFerramenta => ({ resultado, efeitos: {} });

  if (!Object.hasOwn(FERRAMENTAS, nome)) {
    return semEfeito({ erro: `Ferramenta desconhecida: ${nome}. Use: ${Object.keys(FERRAMENTAS).join(", ")}.` });
  }
  const f: Ferramenta = FERRAMENTAS[nome as NomeFerramenta];

  let bruto: unknown;
  try {
    bruto = argumentosJson.trim() ? JSON.parse(argumentosJson) : {};
  } catch {
    return semEfeito({ erro: "Argumentos não são um JSON válido." });
  }

  const args = f.args.safeParse(bruto);
  if (!args.success) {
    const problemas = args.error.issues.map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`);
    return semEfeito({ erro: "Argumentos inválidos.", problemas });
  }

  try {
    return await f.executar(args.data as never, ctx);
  } catch (e) {
    if (e instanceof ErroFerramenta) return semEfeito({ erro: e.message, ...e.extra });
    console.error(`[agente] ferramenta ${nome} falhou`, e);
    return semEfeito({ erro: "Falha interna ao executar a ferramenta. Avise o usuário e não tente de novo." });
  }
}
