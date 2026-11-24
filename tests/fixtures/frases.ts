import type { Resultado } from "@/lib/interpreter/schema";

/**
 * 20 frases de uma loja de roupas fictícia, em ORDEM CRESCENTE DE DIFICULDADE:
 * a #1 é trivial e a #20 é quase impossível. Todas assumem DATA_REFERENCIA
 * como "hoje" (uma terça-feira).
 *
 *  #1-4    básico: venda e despesa diretas
 *  #5-9    jeito de escrever: sem acento, "agente", "hj", gírias de dinheiro
 *  #10-13  conta e várias operações: total x unitário, vírgula decimal, datas
 *  #14-16  ambiguidade e fiado: valor faltando, fiado, recebimento de fiado
 *  #17-18  regras de negócio: desconto + parcelado, retirada pessoal
 *  #19-20  caos e impossível: WhatsApp corrido com erros, valores contraditórios
 *
 * Ao comparar com a saída real do LLM, tipo/valor/forma/data/quantidade devem
 * bater exatamente; a `descricao` varia de redação e não é comparada.
 */

export const DATA_REFERENCIA = "2026-03-10";
const ONTEM = "2026-03-09";

type Lancamento = Resultado["lancamentos"][number];
type Forma = Lancamento["forma_pagamento"];

const entrada = (
  valor_centavos: number,
  descricao: string,
  forma_pagamento: Forma = null,
  data: string = DATA_REFERENCIA,
): Lancamento => ({ tipo: "entrada", valor_centavos, descricao, forma_pagamento, data });

const saida = (
  valor_centavos: number,
  descricao: string,
  forma_pagamento: Forma = null,
  data: string = DATA_REFERENCIA,
): Lancamento => ({ tipo: "saida", valor_centavos, descricao, forma_pagamento, data });

const registrado = (...lancamentos: Lancamento[]): Resultado => ({
  lancamentos,
  precisa_confirmar: false,
});

const perguntar = (pergunta: string): Resultado => ({
  lancamentos: [],
  precisa_confirmar: true,
  pergunta,
});

export type FixtureFrase = {
  frase: string;
  esperado: Resultado;
};

export const frases: FixtureFrase[] = [
  // --- básico -------------------------------------------------------------
  { frase: "vendi 3 blusas a 50 no pix", esperado: registrado(entrada(15000, "3 blusas", "pix")) },
  { frase: "paguei 120 de fornecedor", esperado: registrado(saida(12000, "fornecedor")) },
  { frase: "paguei a luz, 180 no pix", esperado: registrado(saida(18000, "conta de luz", "pix")) },
  { frase: "gastei 35 de gasolina", esperado: registrado(saida(3500, "gasolina")) },

  // --- jeito de escrever --------------------------------------------------
  { frase: "vendi 2 calça a 80 pix", esperado: registrado(entrada(16000, "2 calças", "pix")) },
  {
    frase: "agente vendeu 1 bolsa de 120 hj em dinheiro",
    esperado: registrado(entrada(12000, "bolsa", "dinheiro")),
  },
  {
    frase: "vendi uma saia por cinquenta conto no pix",
    esperado: registrado(entrada(5000, "saia", "pix")),
  },
  {
    frase: "entrou um pix de cem conto da Joana",
    esperado: registrado(entrada(10000, "pix da Joana", "pix")),
  },
  { frase: "paguei mil e duzentos de aluguel", esperado: registrado(saida(120000, "aluguel")) },

  // --- conta e várias operações -------------------------------------------
  {
    // "por 160" é o total, não o preço de cada uma
    frase: "vendi 2 calças por 160 no dinheiro",
    esperado: registrado(entrada(16000, "2 calças", "dinheiro")),
  },
  {
    frase: "vendi 4 camisetas a 40 e comprei 200 de tecido",
    esperado: registrado(entrada(16000, "4 camisetas"), saida(20000, "tecido")),
  },
  {
    frase: "vendi um vestido de 89,90 no cartão e uma bolsa de 120 no dinheiro",
    esperado: registrado(entrada(8990, "vestido", "cartao"), entrada(12000, "bolsa", "dinheiro")),
  },
  {
    frase: "ontem vendi 5 camisetas a 40 no pix",
    esperado: registrado(entrada(20000, "5 camisetas", "pix", ONTEM)),
  },

  // --- ambiguidade e fiado ------------------------------------------------
  { frase: "vendi umas blusas hoje", esperado: perguntar("Quantas blusas e por qual valor?") },
  {
    frase: "a Marta levou 2 blusas fiado, 80 no total",
    esperado: registrado(entrada(8000, "2 blusas (Marta)", "fiado")),
  },
  {
    frase: "a Marta pagou o que devia, 80 no pix",
    esperado: registrado(entrada(8000, "recebimento fiado (Marta)", "pix")),
  },

  // --- regras de negócio --------------------------------------------------
  {
    // 3 x 90 = 270, menos 10% = 243,00; crédito parcelado conta como cartão
    frase: "vendi 3 conjunto de 90 com 10% de desconto parcelado em 3x no crédito",
    esperado: registrado(entrada(24300, "3 conjuntos", "cartao")),
  },
  {
    frase: "tirei 150 do caixa pro mercado de casa",
    esperado: registrado(saida(15000, "retirada pessoal")),
  },

  // --- caos e impossível --------------------------------------------------
  {
    frase:
      "vc pode anotar q a dona lia levou 3 vestido a 70 fiado e eu paguei 150 do forncedor tbm",
    esperado: registrado(entrada(21000, "3 vestidos (Lia)", "fiado"), saida(15000, "fornecedor")),
  },
  {
    // 2x50 + 80 = 180, mas a pessoa disse 200: contraditório, tem que perguntar
    frase: "vendi 2 blusas a 50 e 1 calça por 80, deu 200 no pix",
    esperado: perguntar("A soma dos itens dá R$ 180, mas você disse R$ 200. Qual é o valor correto?"),
  },
];
