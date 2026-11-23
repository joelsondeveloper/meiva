import type { Resultado } from "@/lib/interpreter/schema";

/**
 * Frases de exemplo de uma loja de roupas fictícia, com o resultado esperado.
 * Todas assumem DATA_REFERENCIA como "hoje".
 *
 * Ao comparar com a saída real do LLM, tipo/valor/forma/data devem bater
 * exatamente; a `descricao` varia de redação, então compare de forma flexível.
 */

export const DATA_REFERENCIA = "2026-03-10";

export type FixtureFrase = {
  frase: string;
  esperado: Resultado;
};

export const frases: FixtureFrase[] = [
  {
    frase: "vendi 3 blusas a 50 no pix",
    esperado: {
      lancamentos: [
        { tipo: "entrada", valor_centavos: 15000, descricao: "3 blusas", forma_pagamento: "pix", data: DATA_REFERENCIA },
      ],
      precisa_confirmar: false,
    },
  },
  {
    frase: "vendi 2 calças a 89,90 em dinheiro",
    esperado: {
      lancamentos: [
        { tipo: "entrada", valor_centavos: 17980, descricao: "2 calças", forma_pagamento: "dinheiro", data: DATA_REFERENCIA },
      ],
      precisa_confirmar: false,
    },
  },
  {
    frase: "a cliente Ana levou um vestido de 120 fiado",
    esperado: {
      lancamentos: [
        { tipo: "entrada", valor_centavos: 12000, descricao: "vestido (Ana)", forma_pagamento: "fiado", data: DATA_REFERENCIA },
      ],
      precisa_confirmar: false,
    },
  },
  {
    frase: "paguei 120 de fornecedor",
    esperado: {
      lancamentos: [
        { tipo: "saida", valor_centavos: 12000, descricao: "fornecedor", forma_pagamento: null, data: DATA_REFERENCIA },
      ],
      precisa_confirmar: false,
    },
  },
  {
    frase: "paguei a conta de luz, 187,45 no pix",
    esperado: {
      lancamentos: [
        { tipo: "saida", valor_centavos: 18745, descricao: "conta de luz", forma_pagamento: "pix", data: DATA_REFERENCIA },
      ],
      precisa_confirmar: false,
    },
  },
  {
    frase: "vendi 3 blusas a 50 e paguei 120 de fornecedor",
    esperado: {
      lancamentos: [
        { tipo: "entrada", valor_centavos: 15000, descricao: "3 blusas", forma_pagamento: null, data: DATA_REFERENCIA },
        { tipo: "saida", valor_centavos: 12000, descricao: "fornecedor", forma_pagamento: null, data: DATA_REFERENCIA },
      ],
      precisa_confirmar: false,
    },
  },
  {
    frase: "recebi 60 no cartão de uma bermuda",
    esperado: {
      lancamentos: [
        { tipo: "entrada", valor_centavos: 6000, descricao: "bermuda", forma_pagamento: "cartao", data: DATA_REFERENCIA },
      ],
      precisa_confirmar: false,
    },
  },
  {
    frase: "comprei sacolas por 35 em dinheiro",
    esperado: {
      lancamentos: [
        { tipo: "saida", valor_centavos: 3500, descricao: "sacolas", forma_pagamento: "dinheiro", data: DATA_REFERENCIA },
      ],
      precisa_confirmar: false,
    },
  },
  {
    frase: "ontem vendi um short de 45 no pix",
    esperado: {
      lancamentos: [
        { tipo: "entrada", valor_centavos: 4500, descricao: "short", forma_pagamento: "pix", data: "2026-03-09" },
      ],
      precisa_confirmar: false,
    },
  },
  {
    frase: "vendi umas blusas hoje",
    esperado: {
      lancamentos: [],
      precisa_confirmar: true,
      pergunta: "Quantas blusas você vendeu e por qual valor?",
    },
  },
];
