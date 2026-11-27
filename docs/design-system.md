# Design system da MEIva

Fonte da verdade das cores: `src/app/globals.css`. Este documento explica o porquê e as regras de uso.

## Marca

- **Adjetivos:** parceira, clara, confiável.
- **Equilíbrio:** fácil o bastante para uma pessoa idosa ou iniciante usar sem pedir ajuda, com um toque moderno que não afaste os mais jovens. Simples não é infantil; moderno não é cheio de efeito.
- **Wordmark:** **MEI** em 700 + va em 400, na cor primária. Favicon: "M" claro sobre um quadrado petróleo (`src/app/icon.svg`).

## Cores (paleta A, "Petróleo e Âmbar")

| Token | Claro | Escuro | Papel |
| --- | --- | --- | --- |
| `fundo` | `#f2f4f2` | `#131a19` | fundo da página: "papel de caixa", off-white frio puxado para o petróleo |
| `superficie` | `#fdfdfb` | `#1b2422` | comprovante, barras, campos |
| `texto` | `#1b2422` | `#edf0ee` | texto principal (14,6:1 e 15,4:1), quase preto e esverdeado, não `#000` |
| `texto-suave` | `#4a5552` | `#a9b4b0` | legendas e apoio (7,1:1 e 8,3:1) |
| `primaria` | `#0d5c57` | `#5cc2b7` | **petróleo**: marca, navegação, aba ativa, links, bolha do usuário |
| `heroi` / `sobre-heroi` | `#0d5c57` / `#ffffff` | `#0f3f3b` / `#edf0ee` | bloco "Dinheiro no caixa" do Resumo (7,8:1 e 10,2:1) |
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

- **Texto:** [Atkinson Hyperlegible Next](https://www.brailleinstitute.org/freefont/), do Braille Institute, desenhada para baixa visão (I, l e 1 diferentes). Pesos 400 e 700.
- **Valores em reais:** [Lexend](https://fonts.google.com/specimen/Lexend), pesos 400 e 700, só nos números de dinheiro (`<Valor>`, `--fonte-valor`). Escolhida pelo dono do produto em 26/11/2026 para testar com pessoas reais: o zero sem corte é mais familiar que o zero cortado da Atkinson.
- **Algarismos:** a Lexend servida pelo Google Fonts **não tem algarismos tabulares** (features: `ccmp dnom frac liga locl numr`; medido: "1111" = 89,8px e "8888" = 95,8px em 40px). A classe `valor` mantém `tabular-nums` para o caso de voltar à Atkinson. Na prática, valores alinhados à direita com centavos iguais alinham pela vírgula; só a parte inteira varia de largura.
- **Escala em rem.** O tamanho da raiz é `calc(100% × --escala-texto)` (`globals.css`); `--escala-texto` vale 1 por padrão. Todo tamanho de letra, espaçamento e alvo de toque está em rem, então trocar a escala (os presets de tamanho de letra da próxima tela de configurações) aumenta ou diminui tudo junto. Os 100% respeitam o tamanho de letra escolhido no navegador. Media queries em rem não mudam com a escala.
- **Escala** (na escala 1; o corpo nunca fica abaixo de 18px e nada fica abaixo de 16px):

| Classe | Antes (26/11) | Agora (27/11) | Uso |
| --- | --- | --- | --- |
| `text-base` | 18px / 1.55 | 18px / 1.55 | corpo, legendas, campo, chips de exemplo |
| `text-lg` | 20px / 1.5 | 20px / 1.5 | botões, rótulos de destaque |
| `text-xl` | 22px / 1.45 | 22px / 1.45 | títulos de bloco |
| `text-2xl` | 26px / 1.4 | 24px / 1.35 | nome da pessoa no Fiados, marca no celular |
| `text-3xl` | 32px / 1.25 | 28px / 1.25 | título da página (celular e computador), valor do "Caixa de hoje" |
| `text-4xl` | 40px / 1.2 | 34px / 1.2 | valores secundários do Resumo |
| `text-5xl` | 48px / 1.15 | 42px / 1.15 | o número principal da tela (48px no Resumo do computador) |

**Por que reduzir (27/11/2026).** No celular, o título de 32px, o saldo de 40px no painel e os chips de 20px com 56px de altura competiam com a conversa, que é o que importa. Os degraus de cima desceram; o corpo continua em 18px. Outras reduções: chips de exemplo em `text-base`, 48px de altura e 8px entre eles; título da página em `text-3xl` também no computador (antes `text-4xl`); descrição da página em `text-base`; cabeçalhos com menos respiro em cima e embaixo. Comparação em `docs/screenshots/escala/` (antes × depois, 320/360/390 e 1280px, claro e escuro).

Pisos que continuam valendo: corpo e campos ≥ 16px, entrelinha do corpo ≥ 1.5, contraste ≥ 4.5:1 (`tests/tema.test.ts`), alvos de toque ≥ 44px (48px nas ações principais).

- Frases em caixa normal. Nada de CAIXA ALTA, eyebrow acima de título ou palavra destacada no meio do título.

## Layout

- **Celular:** uma coluna, barra de abas fixa embaixo (Conversa, Resumo, Fiados), com ícone e rótulo sempre visíveis. A aba atual muda de **cor e forma** (pílula preenchida + negrito). Com o teclado aberto, a barra sai.
- **Computador (≥ 1024px):** barra lateral à esquerda com a marca no topo e as mesmas 3 opções. O conteúdo vai até 1200px, alinhado à esquerda. Na Conversa, o painel "Caixa de hoje" fica ao lado.
- **Cada página:** título grande, uma frase dizendo para que serve e no máximo um botão principal.
- **Ousadia num lugar só por tela:** na Conversa, o comprovante; no Resumo, o bloco petróleo cheio com "Dinheiro no caixa"; nos Fiados, o bloco com a faixa azul da conta em aberto. O resto fica quieto.
- **Hierarquia sem cartões iguais:** um bloco de destaque por tela; listas são linhas com divisória direto no fundo.
- **Fiados no computador:** sem ninguém escolhido, o detalhe abre na maior dívida.
- **Alvos de toque:** 48px ou mais (`min-h-12`); botões principais com 56px (`min-h-14`), exceto o botão redondo do campo de escrita (48px, ao lado de um campo de 48px).

## Campo de escrita (Conversa)

- **Campo arredondado** (`rounded-[1.5rem]`), multilinha: começa com 1 linha (48px, a altura do botão), cresce até 4 linhas e depois rola por dentro. Fonte de 18px (nunca abaixo de 16px, senão o iOS dá zoom ao focar).
- **Um botão só**, redondo, de 48px, sempre no mesmo lugar:

| Estado | Botão | Rótulo (aria-label) |
| --- | --- | --- |
| Campo vazio | microfone, contorno petróleo | "Gravar áudio" |
| Com texto | enviar, âmbar cheio (o botão principal da tela) | "Enviar mensagem" |
| Gravando | quadrado + "Parar", petróleo cheio (o "Parar" escrito some abaixo de 360px) | "Parar gravação" |

- Nunca fica "desabilitado apagado": vazio ele já é o microfone. Enquanto espera (permissão, transcrição, resposta), mantém a cor e avisa com `aria-busy` e o cursor de espera.
- **Gravando:** o campo mostra "Gravando… 0:12" no lugar do texto (ponto pulsando + texto) e, nos últimos 10 s, "Termina sozinho em X s". O texto já escrito não se perde.
- **Erros do microfone** e o pedido de permissão aparecem logo acima do campo.
- **Enter:** no computador envia (Shift+Enter quebra a linha); no celular (`pointer: coarse`) Enter quebra a linha e o envio é só pelo botão.
- **Teclado aberto** (campo com foco, no celular): a barra de abas sai e o campo passa a respeitar `env(safe-area-inset-bottom)` sozinho (`--folga-campo`).
- Sem verde de mensageiro e sem rabinho de balão: só os tokens deste documento.

## Movimento

O movimento só aparece em resposta a uma ação da pessoa e dura pouco.

| O quê | Anima? | Como |
| --- | --- | --- |
| Mensagem entrando | sim | aparece e sobe 6px, 180ms, ease-out forte (`animate-entrar`) |
| Lançamento entrando (comprovante) | sim | as linhas entram uma depois da outra, 50ms entre elas |
| Desfazer | sim | a linha fica cinza e riscada, transição de cor de 200ms |
| Apertar botão | sim | `scale(0.97–0.99)` por 150ms |
| Trocar de aba | só o traço | a página troca na hora; o traço da aba cresce em 200ms |
| Abrir pessoa no Fiados | sim | o detalhe entra com `animate-entrar` |
| Trocar período no Resumo | sim | as barras mudam de escala (transform) em 250ms, ease-in-out |
| Esperando resposta | sim | três pontos pulsando (trabalho em andamento) |
| Gravando áudio | sim | ponto pulsando devagar (opacidade, 1,2s) ao lado de "Gravando 0:07"; parado com reduced-motion |
| Botão do campo (microfone ↔ enviar ↔ parar) | sim | cor e ícone trocam em 150ms ease-out (fade + escala de 0.8 para 1); só fade e cor com reduced-motion |
| Qualquer coisa decorativa ou contínua | não | — |

`prefers-reduced-motion: reduce`: sai o que desloca ou escala (subir, apertar, barras, traço da aba); ficam fade e troca de cor, que mostram o que mudou (`globals.css`).

## Textos

- Português do Brasil, frases curtas, voz ativa.
- Palavras do dia a dia: **venda, gasto, fiado, recebimento, caixa inicial, retirada pessoal**. Nunca "lançamento", "natureza" ou "despesa" na tela.
- Erros dizem o que aconteceu e o que fazer, sem pedir desculpa.
- Estado vazio é um convite ("Ninguém está devendo. Que bom!").

## Revisão com o UI/UX Pro Max (26/11/2026)

Comparação da identidade atual com o que a base do UI/UX Pro Max recomenda para "finanças de pequeno negócio, acessível, público idoso". Aprovado com a direção B em 26/11/2026 e aplicado na branch `feat/ui-refino`.

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

### Zero cortado nos valores

A Atkinson Hyperlegible Next desenha o zero cortado, e a versão do Google Fonts não traz um zero alternativo (só `ccmp frac locl pnum tnum`). Decisão de 26/11/2026: **Lexend só nos valores em reais**, via `--fonte-valor` (`globals.css`) e `next/font` (`layout.tsx`). Comparação em `docs/direcoes/zero.png`. Para voltar ao zero cortado, basta `--fonte-valor: var(--font-sans)`. `tests/tema.test.ts` confere a ligação.

Conferido em 320, 390 e 1280px (claro e escuro): nenhum valor estoura nem corta (script do Playwright mede a largura da página e de cada `.valor`).

### Fonte sem pulo

O `next/font` não gera a fonte de reserva com medidas para a Atkinson Next. Ela foi declarada à mão (`Atkinson Reserva Arial` e `Atkinson Reserva Roboto`), com `size-adjust` medido no texto do app e `ascent/descent-override` tirados da fonte (984/316). A altura de linha da reserva fica igual à da Atkinson (conferido no navegador: 130px contra 112px do Arial puro, em 100px).
