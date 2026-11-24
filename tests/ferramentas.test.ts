import { beforeEach, describe, expect, test, vi } from "vitest";
import { DEFINICOES_FERRAMENTAS, executarFerramenta } from "@/lib/agente/ferramentas";
import { RepositorioMemoria } from "@/lib/agente/repositorio-memoria";

const HOJE = "2026-03-10";
let repo: RepositorioMemoria;
const ctx = () => ({ repo, hoje: HOJE });
const exec = (nome: string, args: unknown) =>
  executarFerramenta(nome, typeof args === "string" ? args : JSON.stringify(args), ctx());

const venda = (extra: Record<string, unknown> = {}) => ({
  natureza: "venda",
  valor_centavos: 15000,
  descricao: "3 blusas",
  forma_pagamento: "pix",
  data: HOJE,
  ...extra,
});

beforeEach(() => {
  repo = new RepositorioMemoria();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("definições", () => {
  test("todas as ferramentas têm JSON Schema de objeto", () => {
    expect(DEFINICOES_FERRAMENTAS.map((d) => d.function.name).sort()).toEqual([
      "buscar_devedores",
      "consultar_resumo",
      "corrigir_lancamento",
      "desfazer_lancamento",
      "listar_ultimos",
      "registrar_lancamentos",
    ]);
    for (const d of DEFINICOES_FERRAMENTAS) expect(d.function.parameters).toMatchObject({ type: "object" });
  });
});

describe("executarFerramenta: erros voltam como resultado", () => {
  test("ferramenta desconhecida", async () => {
    expect((await exec("apagar_tudo", {})).resultado).toMatchObject({ erro: expect.stringMatching(/desconhecida/) });
  });
  test("JSON inválido", async () => {
    expect((await exec("listar_ultimos", "{oops")).resultado).toMatchObject({ erro: expect.any(String) });
  });
  test("argumento fora do schema", async () => {
    const { resultado } = await exec("listar_ultimos", { n: 50 });
    expect(resultado).toMatchObject({ erro: "Argumentos inválidos.", problemas: [expect.stringMatching(/^n:/)] });
  });
  test("falha do banco não derruba", async () => {
    vi.spyOn(repo, "ultimos").mockRejectedValue(new Error("boom"));
    expect((await exec("listar_ultimos", {})).resultado).toMatchObject({ erro: expect.stringMatching(/Falha interna/) });
  });
});

describe("registrar_lancamentos", () => {
  test("registra e deduz o tipo da natureza", async () => {
    const { resultado, efeitos } = await exec("registrar_lancamentos", {
      lancamentos: [venda(), { natureza: "despesa", valor_centavos: 12000, descricao: "fornecedor", data: HOJE }],
    });
    expect(efeitos.criados).toHaveLength(2);
    expect(resultado).toMatchObject({
      criados: [
        { tipo: "entrada", natureza: "venda", pessoa: null, id: expect.any(String) },
        { tipo: "saida", natureza: "despesa", forma_pagamento: null },
      ],
    });
  });

  test("tudo ou nada: um inválido e nada é salvo", async () => {
    const { resultado } = await exec("registrar_lancamentos", {
      lancamentos: [venda(), venda({ tipo: "saida" })],
    });
    expect(resultado).toMatchObject({ erro: expect.stringMatching(/lancamentos\[1\].*exige tipo "entrada"/) });
    expect(repo.todos()).toHaveLength(0);
  });

  test.each([
    ["data futura", venda({ data: "2026-03-11" }), /futuro/],
    ["fiado sem pessoa", venda({ forma_pagamento: "fiado" }), /nome do cliente/],
    ["recebimento sem pessoa", venda({ natureza: "recebimento_fiado" }), /pessoa/],
    ["recebimento fiado", venda({ natureza: "recebimento_fiado", forma_pagamento: "fiado", pessoa: "Ana" }), /não fiado/],
    ["aporte fiado", venda({ natureza: "aporte", forma_pagamento: "fiado" }), /não pode ser fiado/],
  ])("recusa %s", async (_nome, l, msg) => {
    const { resultado } = await exec("registrar_lancamentos", { lancamentos: [l] });
    expect(resultado).toMatchObject({ erro: expect.stringMatching(msg) });
    expect(repo.todos()).toHaveLength(0);
  });

  test("recebimento usa o nome de quem deve e avisa quando paga a mais", async () => {
    await exec("registrar_lancamentos", { lancamentos: [venda({ forma_pagamento: "fiado", pessoa: "Dona Maria Silva" })] });
    const { resultado } = await exec("registrar_lancamentos", {
      lancamentos: [venda({ natureza: "recebimento_fiado", valor_centavos: 20000, pessoa: "maria" })],
    });
    expect(resultado).toMatchObject({
      criados: [{ pessoa: "Dona Maria Silva" }],
      avisos: [expect.stringMatching(/maior que a dívida/)],
    });
  });

  test("recebimento com nome ambíguo devolve candidatos e não salva", async () => {
    await exec("registrar_lancamentos", {
      lancamentos: [
        venda({ forma_pagamento: "fiado", pessoa: "Maria Silva" }),
        venda({ forma_pagamento: "fiado", pessoa: "Maria Souza" }),
      ],
    });
    const { resultado } = await exec("registrar_lancamentos", {
      lancamentos: [venda({ natureza: "recebimento_fiado", pessoa: "maria" })],
    });
    expect(resultado).toMatchObject({ erro: expect.stringMatching(/Pergunte qual/), candidatos: expect.any(Array) });
    expect(repo.todos()).toHaveLength(2);
  });
});

describe("buscar_devedores", () => {
  beforeEach(async () => {
    await exec("registrar_lancamentos", {
      lancamentos: [
        venda({ forma_pagamento: "fiado", pessoa: "Maria Silva", valor_centavos: 10000 }),
        venda({ forma_pagamento: "fiado", pessoa: "Maria Souza", valor_centavos: 5000 }),
        venda({ forma_pagamento: "fiado", pessoa: "Seu João", valor_centavos: 3000 }),
        venda({ natureza: "recebimento_fiado", pessoa: "joao", valor_centavos: 1000 }),
      ],
    });
  });

  test("sem pessoa: todos os devedores", async () => {
    expect((await exec("buscar_devedores", {})).resultado).toMatchObject({ total: 17000 });
  });
  test("casamento aproximado sem acento e sem 'seu'", async () => {
    expect((await exec("buscar_devedores", { pessoa: "João" })).resultado).toEqual({
      devedores: [{ pessoa: "joao", valor_centavos: 2000 }],
      total: 2000,
    });
  });
  test("mais de uma pessoa casa: devolve candidatos", async () => {
    const { resultado } = await exec("buscar_devedores", { pessoa: "dona maria" });
    expect(resultado).toMatchObject({ ambiguo: true, candidatos: [{ pessoa: "Maria Silva" }, { pessoa: "Maria Souza" }] });
  });
  test("ninguém casa", async () => {
    expect((await exec("buscar_devedores", { pessoa: "Zé" })).resultado).toMatchObject({ devedores: [], total: 0 });
  });
});

describe("consultar_resumo", () => {
  test("período, aporte separado de venda e a receber global", async () => {
    await exec("registrar_lancamentos", {
      lancamentos: [
        venda({ data: "2026-03-01", forma_pagamento: "fiado", pessoa: "Ana", valor_centavos: 8000 }),
        venda({ valor_centavos: 10000 }),
        venda({ natureza: "aporte", valor_centavos: 50000, forma_pagamento: "dinheiro", descricao: "aporte" }),
      ],
    });
    const { resultado } = await exec("consultar_resumo", { de: HOJE, ate: HOJE });
    expect(resultado).toMatchObject({
      quantidade_lancamentos: 2,
      saldo: 60000,
      vendas: 10000,
      aportes: 50000,
      a_receber: { total: 8000 },
    });
  });
  test("de depois de ate é recusado", async () => {
    expect((await exec("consultar_resumo", { de: HOJE, ate: "2026-03-01" })).resultado).toMatchObject({ erro: expect.any(String) });
  });
});

describe("listar_ultimos, desfazer e corrigir", () => {
  test("desfazer anula sem apagar e some das listagens", async () => {
    const { efeitos } = await exec("registrar_lancamentos", { lancamentos: [venda(), venda({ descricao: "saia" })] });
    const [, saia] = efeitos.criados!;

    const d = await exec("desfazer_lancamento", { id: saia.id });
    expect(d.efeitos.anulado?.anulado_em).toEqual(expect.any(String));
    expect(repo.todos()).toHaveLength(2);

    const { resultado } = await exec("listar_ultimos", { n: 10 });
    expect(resultado).toMatchObject({ lancamentos: [{ descricao: "3 blusas" }] });

    expect((await exec("desfazer_lancamento", { id: saia.id })).resultado).toMatchObject({ erro: expect.stringMatching(/já estava desfeito/) });
    expect((await exec("corrigir_lancamento", { id: saia.id, valor_centavos: 1 })).resultado).toMatchObject({ erro: expect.any(String) });
  });

  test("corrigir altera e revalida as regras", async () => {
    const { efeitos } = await exec("registrar_lancamentos", { lancamentos: [venda()] });
    const id = efeitos.criados![0].id;

    const ok = await exec("corrigir_lancamento", { id, valor_centavos: 9000, forma_pagamento: "dinheiro" });
    expect(ok.resultado).toMatchObject({ antes: { valor_centavos: 15000 }, depois: { valor_centavos: 9000, forma_pagamento: "dinheiro" } });

    const ruim = await exec("corrigir_lancamento", { id, forma_pagamento: "fiado" });
    expect(ruim.resultado).toMatchObject({ erro: expect.stringMatching(/nome do cliente/) });

    expect((await exec("corrigir_lancamento", { id })).resultado).toMatchObject({ erro: "Argumentos inválidos." });
    expect((await exec("desfazer_lancamento", { id: "00000000-0000-4000-8000-999999999999" })).resultado).toMatchObject({
      erro: expect.stringMatching(/não existe/),
    });
  });
});
