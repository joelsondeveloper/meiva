# Guia da marca MEIva

Versão 1, aprovada em 27/11/2026. Os arquivos estão em [`docs/marca/final/`](final/). Como chegamos aqui: [historico.md](historico.md) e [pesquisa.md](pesquisa.md).

## A ideia

**O I de MEI é o cursor de texto.** A MEIva é um caixa que você preenche conversando, e o cursor é o sinal de "pode escrever, estou ouvindo". No nome, o cursor é um I com serifas retas e curtas, como o cursor de texto, em âmbar. No ícone, ele vira o traço do cursor sublinhado, embaixo do M.

- **Parceira:** o cursor espera por você.
- **Clara:** o nome se lê de primeira, também em tamanho pequeno. O I com serifa não se confunde com l.
- **Confiável:** formas chapadas, sem efeito, em petróleo, uma cor que não é o azul de banco nem o verde de dinheiro.

## O logo

| Peça | Arquivo | Quando usar |
| --- | --- | --- |
| **Nome** (logo principal) | `final/svg/logo/meiva-logo-{claro,petroleo,escuro,preto,branco}.svg` | lateral do app, topo do celular, documentos, apresentação |
| **Símbolo** (M + traço) | `final/svg/simbolo/meiva-simbolo-*.svg` | quando o nome não cabe: avatar, carimbo, marca d'água |
| **Ícone** | `final/svg/icone/meiva-icone.svg` (e `-escuro`, `-1cor`, `-maskable`) | ícone do app e redes sociais |
| **Favicon** | `final/web/favicon.svg` e `favicon.ico` | aba do navegador |

O nome e o símbolo **não andam juntos**. O símbolo é o M do próprio nome; lado a lado, o M apareceria duas vezes. Use um **ou** outro.

### Construção

- **Letras:** M desenhado do zero (diagonais a 60°, haste e diagonal com 165 de espessura em 700 de altura); E, v e a a partir da Lexend (700 no E, 400 no "va"), convertidos em curvas. Peso: "MEI" negrito, "va" normal, a mesma do wordmark anterior.
- **I:** haste de 180 (165 + 9% de compensação óptica, porque o âmbar parece mais fino que o petróleo), serifas retas de 300 de largura e 130 de espessura, altura exata das maiúsculas.
- **Espaços (em unidades de 700 de altura):** M→E 166 de haste a haste; E→I 128 de tinta a tinta; I→v 70.
- **Ícone:** M de 702 × 700, traço de 702 × 165 a 100 abaixo do M. O traço tem a espessura da haste.
- **Favicon de 16 px:** desenhado pixel a pixel (M de 10 × 9 px com hastes de 2 px e traço de 10 × 2 px). Fica nítido em 16, 32 e 48 px. Gerador: `final/favicon16.py`.

### Área de respiro

Chame de **h** a altura das maiúsculas do nome (a altura do M).

- **Nome:** deixe pelo menos **½ h** livre em volta, dos quatro lados. Nada de texto, borda ou foto nessa área.
- **Ícone:** o símbolo ocupa o quadrado central de 600/1024 (59%). Na versão maskable, 560/1024, dentro do círculo seguro de 80% que o Android recorta.

### Tamanho mínimo

| Peça | Tela | Impresso |
| --- | --- | --- |
| Nome | **18 px de altura** (≈ 75 px de largura) | 15 mm de largura |
| Símbolo sem quadrado | 24 px | 6 mm |
| Ícone / favicon | 16 px, **só com o corte de pixel** (`favicon.svg`/`.ico`) | — |

Abaixo de 18 px de altura, use o símbolo ou o favicon, não o nome.

## Cores

| Nome | Hex | Uso na marca | Contraste |
| --- | --- | --- | --- |
| Petróleo | `#0d5c57` | letras do nome no claro; fundo do ícone | 7,1:1 no papel |
| Âmbar-tinta | `#8f5d00` | **I do nome no fundo claro** | 5,1:1 no papel, 5,5:1 na folha |
| Âmbar-claro | `#f5c04f` | **I do nome e traço do ícone sobre petróleo** | 4,7:1 no petróleo |
| Âmbar | `#f2b134` | **botão principal** do app; I do nome e traço no fundo escuro | 9,3:1 no escuro; 8,4:1 com texto escuro no botão |
| Folha | `#fdfdfb` | letras e M sobre petróleo | 7,7:1 no petróleo |
| Papel | `#f2f4f2` | fundo claro | — |
| Escuro | `#131a19` | fundo escuro | — |
| Texto escuro | `#edf0ee` | letras do nome no fundo escuro | 15,4:1 no escuro |

**Regra do âmbar:** o âmbar aparece em três lugares e só neles: o **botão principal** de cada tela, o **I do nome** e o **traço do ícone**. O tom muda com o fundo para manter o contraste (tinta no claro, claro no petróleo, âmbar no escuro). Nada de âmbar decorativo.

**Uma cor só:** em preto ou branco, tudo fica na mesma cor (`meiva-logo-preto.svg`, `meiva-logo-branco.svg`). O nome continua legível porque o I com serifa não depende da cor.

## Tipografia

- **O logo não é digitado.** As letras são desenhos (curvas). Nunca recrie o logo escrevendo "MEIva" numa fonte.
- **Interface:** Atkinson Hyperlegible Next (texto) e Lexend (só os valores em reais). Ver [docs/design-system.md](../design-system.md).
- **Licenças:** Lexend e Atkinson Hyperlegible Next, ambas **SIL Open Font License 1.1**. A OFL permite usar e modificar os contornos num logo; o logo em curvas não é a fonte e não precisa levar a licença.

## Animação do cursor (opcional, ainda não implementada)

O movimento na MEIva só aparece em resposta a uma ação e dura pouco ([design-system](../design-system.md#movimento)). O cursor é a única exceção que proponho, porque ele **informa**: diz "estou esperando". A skill `emil-design-eng` não está instalada neste ambiente; a proposta segue as regras de movimento do próprio design-system.

| Onde | O quê | Como |
| --- | --- | --- |
| **Tela de carregamento** | o traço do ícone pisca | liga e desliga sem transição (`steps`), 530 ms aceso e 530 ms apagado, como o cursor do sistema. Para quando a tela carrega; se passar de 10 s, fica aceso e aparece o texto "Carregando…". |
| **Campo da conversa vazio** | **nenhum cursor desenhado** | o campo já tem o cursor do sistema, que pisca sozinho e respeita a configuração da pessoa. Basta pintá-lo de âmbar com `caret-color` (âmbar-tinta no claro, âmbar no escuro). Um segundo cursor falso confundiria. |
| **Nome na lateral** | parado | o I do nome nunca anima. |

**Com `prefers-reduced-motion: reduce`:** o traço fica aceso e parado, e o carregamento mostra o texto "Carregando…" desde o início. O `caret-color` continua (é cor, não movimento).

## O que NÃO fazer

- Não digitar o nome numa fonte para "fazer o logo".
- Não trocar o I com serifa por um I comum, uma haste lisa ou um l.
- Não usar o âmbar `#f2b134` no fundo claro (1,7:1, some). No claro, o I é âmbar-tinta.
- Não pôr o ícone sobre fundo âmbar ou amarelo, nem fazer um ícone com fundo âmbar.
- Não juntar símbolo e nome lado a lado.
- Não mudar a cor de "va" nem separar "MEI" de "va"; a diferença entre os dois é só o peso.
- Não esticar, inclinar, girar, contornar, nem pôr sombra, brilho ou degradê.
- Não colocar o nome sobre foto ou fundo com textura sem uma área lisa por trás.
- Não usar o nome abaixo de 18 px de altura nem o ícone vetorial em 16 px (use o favicon de pixel).

## Registro

Não sabemos se "MEIva" está livre para registro. **Antes de usar a marca publicamente: consultar o INPI** (classes 9, 35, 36 e 42) **e a disponibilidade do domínio.** A checagem de semelhança feita aqui foi visual e não substitui uma busca de marca.
