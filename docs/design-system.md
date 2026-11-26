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

## Revisão com o UI/UX Pro Max (26/11/2026)

Comparação da identidade atual com o que a base do UI/UX Pro Max recomenda para "finanças de pequeno negócio, acessível, público idoso". **Nada aqui foi aplicado ainda**: são propostas, à espera de aprovação.

### O que a base recomenda e o que fazemos com isso

| Tema | Recomendação da base | MEIva hoje | Decisão |
| --- | --- | --- | --- |
| Estilo | "Accessible & Ethical": contraste alto, texto 16px+, foco de 3–4px, reduced-motion | Corpo 18px, texto principal 7:1, foco de 3px | **Fica.** Já passamos do mínimo recomendado. |
| Tipografia | Atkinson Hyperlegible para títulos e corpo | Atkinson Hyperlegible **Next** (mais pesos, algarismos tabulares) | **Fica.** É exatamente a recomendação, numa versão mais nova. |
| Cor de marca | Azul de confiança (`#0369A1`) ou marinho de banco (`#0F172A`) | Petróleo `#0d5c57` | **Fica o petróleo.** O azul da base é o de qualquer banco, e o azul já tem papel aqui (fiado). O petróleo dá 7,2:1 sobre o fundo (o azul sugerido dá ~5,9:1) e continua "calmo + estável" sem ser genérico. |
| CTA | Uma cor de destaque só no CTA (a base sugere verde `#16A34A`) | Âmbar só no botão principal | **Fica o âmbar.** Verde aqui significa "entrou dinheiro"; usar verde no botão misturaria os significados. Âmbar com texto escuro dá 8,4:1. |
| Estilo de app de finanças pessoais | Glassmorphism + modo escuro OLED | Superfícies chapadas, sem sombra | **Rejeitado.** Vidro e desfoque baixam o contraste e confundem quem enxerga pouco. |
| Ícones | Uma família, um traço, tamanhos por token, ícone decorativo com `aria-hidden` | Ícones próprios em traço, 20 e 24px | **Ajustar:** fixar dois tamanhos (`size-5` em linha, `size-6` na navegação) e um traço de 2px. |
| Toque | Retorno ao toque em 80–150ms sem mexer no layout | `scale(0.97–0.99)` em 150ms | **Fica.** |

### Ajustes pontuais propostos

1. **Fundo um pouco mais frio.** `#f6f5f1` → `#f2f4f2` (claro). O creme quente é o fundo mais repetido em telas geradas por IA; puxar um fio de verde-petróleo casa o fundo com a marca. Contraste conferido: texto 14,4:1; texto-suave 7,0:1; petróleo 7,1:1; entrada 5,3:1; saída 5,5:1; fiado 6,2:1.
2. **Valor em reais com hierarquia.** No número grande, o "R$" fica menor e em peso normal, alinhado pela base; os centavos continuam do mesmo tamanho (ninguém precisa adivinhar o valor).
3. **Linhas sem o círculo pastel.** O ícone em círculo colorido é o padrão de qualquer app de finanças. Proposta: ícone direto na cor da categoria, alinhado ao texto, e o valor com sinal. Menos ruído, mesma informação (ícone + sinal + texto).
4. **Raios por hierarquia, não um raio para tudo.** Bloco principal 24px, blocos de apoio 16px, controles 14px, selo 8px.
5. **Menos cartão.** Listas (Últimas anotações, histórico do fiado) viram linhas com divisória direto no fundo; contorno só onde agrupa algo que a pessoa usa junto.
6. **Comprovante da anotação.** A resposta do agente que anota algo ganha um rodapé "Caixa de hoje agora: R$ …", mostrando o efeito no saldo (ver o plano em `docs/reformulacao.md`).
