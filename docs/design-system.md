# Design system da MEIva

Fonte da verdade das cores: `src/app/globals.css`. Este documento explica o porquê e as regras de uso.

## Marca

- **Adjetivos:** parceira, clara, confiável.
- **Equilíbrio:** fácil o bastante para uma pessoa idosa ou iniciante usar sem pedir ajuda, com um toque moderno que não afaste os mais jovens. Simples não é infantil; moderno não é cheio de efeito.
- **Wordmark:** **MEI** em 700 + va em 400, na cor primária. Favicon: "M" claro sobre um quadrado petróleo (`src/app/icon.svg`).

## Cores (paleta A, "Petróleo e Âmbar")

| Token | Claro | Escuro | Papel |
| --- | --- | --- | --- |
| `fundo` | `#f6f5f1` | `#131a19` | fundo da página: off-white neutro-quente, não branco puro |
| `superficie` | `#fdfcf9` | `#1b2422` | cartões, barras, campos |
| `texto` | `#1b2422` | `#edf0ee` | texto principal (14,6:1 e 15,4:1), quase preto e esverdeado, não `#000` |
| `texto-suave` | `#4a5552` | `#a9b4b0` | legendas e apoio (7,1:1 e 8,3:1) |
| `primaria` | `#0d5c57` | `#5cc2b7` | **petróleo**: marca, navegação, aba ativa, links, bolha do usuário |
| `acento` | `#f2b134` | `#f2b134` | **âmbar**: só o botão principal de cada tela, com texto escuro (8,4:1) |
| `entrada` | `#1d7343` | `#63c98d` | dinheiro que entrou |
| `saida` | `#b0382a` | `#f2907f` | dinheiro que saiu (tijolo suave, não vermelho de alarme) |
| `fiado` | `#2d5b9a` | `#8fb5ee` | a receber; azul, para não competir com o âmbar do botão |

Também existem as variações `-forte` (hover), `-suave` (fundos de ícone e de blocos), `borda`, `borda-forte` (3:1, contorno de campo), `foco` e `erro`.

**Por que estas cores.** Em finanças, o verde-azulado passa calma e estabilidade sem cair no azul de banco genérico. O âmbar é quente e chama a ação sem a urgência do vermelho. As cores de entrada, saída e fiado são separadas da marca: assim, "verde" significa sempre "entrou dinheiro".

**Regras.**
- Uma cor nunca vem sozinha: sempre com ícone, sinal (+/−) ou texto.
- O âmbar só aparece no botão principal (um por tela). Nada de âmbar decorativo.
- O fiado não tem sinal "+": ele ainda não entrou no caixa. Ganha o selo "a receber".
- O texto principal tem 7:1 ou mais, e os demais textos 4,5:1 ou mais, nos dois temas. `tests/tema.test.ts` confere isso.
- Sem gradiente, sem sombra decorativa, sem brilho.

## Tipografia

- **Uma família:** [Atkinson Hyperlegible Next](https://www.brailleinstitute.org/freefont/), do Braille Institute, desenhada para baixa visão (I, l e 1 diferentes; 0 cortado). Pesos 400 e 700.
- **Valores em reais:** sempre `tabular-nums`. A fonte tem algarismos tabulares de verdade (conferido: "1111" e "8888" têm a mesma largura).
- **Escala** (o corpo nunca fica abaixo de 18px; o menor texto da tela é 18px):

| Classe | Tamanho / entrelinha | Uso |
| --- | --- | --- |
| `text-base` | 18px / 1.55 | corpo, legendas |
| `text-lg` | 20px / 1.5 | botões, rótulos de destaque |
| `text-xl` | 22px / 1.45 | títulos de bloco |
| `text-2xl` | 26px / 1.4 | nome da pessoa no Fiados |
| `text-3xl` | 32px / 1.25 | título da página (celular) |
| `text-4xl` | 40px / 1.2 | título da página (computador), valores secundários |
| `text-5xl` | 48px / 1.15 | o número principal da tela |

- Frases em caixa normal. Nada de CAIXA ALTA, eyebrow acima de título ou palavra destacada no meio do título.

## Layout

- **Celular:** uma coluna, barra de abas fixa embaixo (Conversa, Resumo, Fiados), com ícone e rótulo sempre visíveis. A aba atual muda de **cor e forma** (pílula preenchida + negrito). Com o teclado aberto, a barra sai.
- **Computador (≥ 1024px):** barra lateral à esquerda com a marca no topo e as mesmas 3 opções. O conteúdo vai até 1200px, alinhado à esquerda. Na Conversa, o painel "Caixa de hoje" fica ao lado.
- **Cada página:** título grande, uma frase dizendo para que serve e no máximo um botão principal.
- **Ousadia num lugar só:** o número grande do bloco petróleo-claro no Resumo ("Dinheiro no caixa") e o valor "Falta receber" nos Fiados. O resto fica quieto.
- **Hierarquia sem cartões iguais:** bloco principal com fundo de cor, blocos de apoio com contorno, listas com divisória.
- **Alvos de toque:** 48px ou mais (`min-h-12`); botões principais com 56px (`min-h-14`).

## Movimento

O movimento só aparece em resposta a uma ação da pessoa e dura pouco.

| O quê | Anima? | Como |
| --- | --- | --- |
| Mensagem e lançamento entrando | sim | aparece e sobe 6px, 180ms, `cubic-bezier(0.22, 1, 0.36, 1)` (`animate-entrar`) |
| Desfazer | sim | a linha muda para cinza e riscado, com transição de cor de 200ms |
| Apertar botão ou aba | sim | `scale(0.97–0.99)` por 150ms, para o dedo sentir o toque |
| Trocar de aba | não | troca na hora; só a cor da aba muda (150ms) |
| Abrir pessoa no Fiados | sim | o detalhe entra com `animate-entrar` |
| Esperando resposta | sim | três pontos pulsando (indica trabalho em andamento) |
| Barras do Resumo | sim | a largura muda em 300ms ao trocar o período |
| Qualquer coisa decorativa ou contínua | não | — |

`prefers-reduced-motion: reduce` zera animações e transições (`globals.css`).

## Textos

- Português do Brasil, frases curtas, voz ativa.
- Palavras do dia a dia: **venda, gasto, fiado, recebimento, caixa inicial, retirada pessoal**. Nunca "lançamento", "natureza" ou "despesa" na tela.
- Erros dizem o que aconteceu e o que fazer, sem pedir desculpa.
- Estado vazio é um convite ("Ninguém está devendo. Que bom!").
