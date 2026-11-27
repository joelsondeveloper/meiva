# Histórico da marca MEIva

Registro de cada rodada: o que mudou e por quê. Pesquisa de concorrentes em [pesquisa.md](pesquisa.md).

## Fontes e licenças

- **Lexend** (Copyright 2019 The Lexend Project Authors), **SIL Open Font License 1.1**. Permite usar os contornos num logo e modificá-los; o logo em curvas não é a fonte e não precisa levar a licença. Usada como ponto de partida das letras M, E, v, a (pesos 700 e 400).
- **Atkinson Hyperlegible Next** (Copyright 2020–2024 The Atkinson Hyperlegible Next Project Authors), **SIL Open Font License 1.1**. Fonte do texto do app; não usada nas letras do logo nesta rodada.
- Os arquivos das duas fontes vieram do cache local do `next/font` (mesmos arquivos do Google Fonts que o app já usa), sem novo download.
- Cursor, símbolos e ícones foram desenhados do zero.

## Ferramentas

- `fontTools` 4.69 e Pillow num ambiente virtual **fora do repositório** (`C:\dev\_ferramentas\venv`), com o módulo `glifos.py` que tira os contornos da fonte variável no peso pedido.
- `docs/marca/exploracao-1/gerar.py` gera todas as SVGs; `previa.py` monta a `previa.html`; a folha de contato é uma captura da prévia no Chrome sem janela.

## Decisões da Fase 0 (27/11/2026)

- Âmbar: a regra passa de "só o botão principal" para **"botão principal + cursor da marca"**. Registrar no guia e no design-system na Fase 4.
- Âmbar para fundo claro: **`#9a6400` (âmbar-tinta)**. Dá 4,5:1 sobre o papel `#f2f4f2` e 4,9:1 sobre a folha `#fdfdfb`. O `#f2b134` fica para petróleo (4,1:1) e escuro (9,3:1). O 4,5:1 sobre o papel está no limite; na rodada 2 vale escurecer um pouco para ter folga.
- Trabalho no branch `feat/marca`, em worktree separado (`C:\dev\meiva-marca`), saindo do `main`. O `feat/audio` não foi tocado.

## Exploração 1 (27/11/2026)

7 direções em 5 famílias. Folha de contato em `exploracao-1/folha-de-contato.png`, prévia em `exploracao-1/previa.html`.

| Id | Família | Ideia |
| --- | --- | --- |
| B1 | wordmark com detalhe | o I de MEI é um cursor com haste e espaço de letra |
| B2 | wordmark com detalhe | o I é o cursor de texto em I (⌶) |
| G | wordmark com detalhe | o I é um cursor em bloco; no ícone, o bloco âmbar fica sobre o M |
| C | monograma | o V do M desce até a base, em âmbar |
| D | símbolo + wordmark | caderninho do fiado com cursor na capa |
| E | só tipografia e forma | o logo é o campo de texto com o cursor |
| F | ousada | comprovante com V no alto (M) e picote embaixo |

### O que mudou em relação à direção B anterior

- **Respiro do cursor:** antes, cursor e letras pareciam 3 blocos. Agora o cursor tem a espessura da haste da Lexend 700 (165 unidades, igual à do E e do M) e 88 unidades de espaço lateral, como uma letra. Depois do E tirei 40 unidades (o lado aberto do E já dá ar) e depois do cursor deixei 52 (o v é diagonal e abre espaço sozinho).
- **"Mi" no ícone:** duas saídas testadas. Em B1, o cursor **é** a perna direita do M (sem vão entre os dois). Em G, o M fica **dentro** do bloco do cursor, como num terminal. As duas leem um único M.
- **Contraste do âmbar:** âmbar-tinta `#9a6400` no fundo claro.

### Ajustes feitos durante a rodada (depois de olhar os renders)

- C: no primeiro desenho o M se lia como "IVI" (o V âmbar descolava das hastes). Os braços do V passaram a nascer da borda externa das hastes, e o M ficou mais largo (820). Agora lê M, inclusive em 1 cor.
- G: o primeiro ícone era "M" + bloco ao lado, e voltava a se ler "MI". Troquei por bloco âmbar com o M vazado dentro.
- D: o cursor e uma linha na capa formavam um "L". Tirei a linha.
- B2: as serifas curvas pareciam chifres. Reduzi a curva quase pela metade.
- E: o contorno encostava no M. Aumentei a margem lateral e afastei o cursor do "a".

### Pendências conhecidas (para a rodada 2, só nas direções escolhidas)

- Os recortes de D e F são pintados por cima; viram furos de verdade (`evenodd`) na versão final.
- As diagonais do M vêm da Lexend (58,4° e 121,9°). A auditoria aponta "quase 60°". É desenho da fonte, mas vale decidir se o M do logo fica com ângulo exato.
- Testes que ainda não rodaram: daltonismo, escala de cinza, teste dos 5 segundos e mocks da lateral, da aba e da tela inicial. Ficam para a Fase 3, como combinado.

## Marca e registro

Não afirmo que "MEIva" está livre ou é registrável. **Antes de usar publicamente: consultar o INPI** (classes 9, 35, 36 e 42) **e a disponibilidade do domínio.**

## Exploração 2 (27/11/2026)

Escolha da rodada 1: **B1 (nome) + G (ícone)**, com **F** como curinga. B2, C, D e E foram descartadas. Folha de contato em `exploracao-2/folha-de-contato.png`, prévia em `exploracao-2/previa.html` e gerador em `exploracao-2/gerar.py`.

### O que mudou e por quê

- **M redesenhado (vale para nome e ícone).** As diagonais agora têm 60° exatos, em vez dos 58,4°/121,9° da Lexend. A largura horizontal da diagonal é 165 / sen 60° = 190, então a espessura real fica igual à da haste (165). A caixa é a mesma do M da Lexend 700 (702 de largura, vértice em −170) e o desenho é um contorno só, o que permite vazá-lo como furo. A auditoria não aponta mais ângulo torto.
- **Furos de verdade.** O M dos ícones G1/G2 e a linha escrita do F são furos (`fill-rule="evenodd"`), não forma pintada por cima. Sobre qualquer fundo aparece o fundo. A auditoria não aponta mais recorte pintado.
- **Peso óptico do cursor.** Com a mesma largura da haste do E (165), o cursor âmbar-tinta parece mais fino que as letras petróleo, porque é mais claro. Testei 165, 180 e 195 lado a lado: **180 (+9%)** iguala o peso no claro e continua equilibrado no petróleo. O 195 já pesa mais.
- **Teste "MElva".** O "l" minúsculo da Lexend sobe até 740; o cursor para na altura das maiúsculas (700). O "l" de 400 tem haste de 103; o cursor tem 180, o peso de "MEI". Comparei com um "MElva" montado com o "l" de verdade (400 e 700). **Conclusão honesta:** em 18 px e em cinza, o cursor e um "l" da Lexend 700 quase não se distinguem. A leitura "MEIva" se apoia no contexto ("MEI" é palavra conhecida), no peso igual ao de "ME" e na cor. A haste larga (215) reduz um pouco o risco, mas pesa mais que as letras. Nenhuma versão elimina o risco; é o mesmo I/l de qualquer fonte sem serifa.
- **Duas cores de cursor no fundo claro.** Âmbar-tinta `#8f5d00` (5,1:1 no papel, mais folga que o `#9a6400` da rodada 1) e âmbar-cobre `#a55300` (5,0:1). O cobre puxa para o laranja, vira "terceira cor" e no tritan fica vermelho-rosado. Recomendo o âmbar-tinta.
- **Âmbar sobre petróleo.** O `#f2b134` dava 4,1:1 no petróleo. Passei a usar o âmbar-claro `#f5c04f` (4,7:1) no cursor e nos ícones sobre petróleo, e com isso não há mais exceção de contraste. O `#f2b134` continua no botão e no fundo escuro (9,3:1).
- **G: quatro tamanhos e posições do bloco, sempre sobre petróleo.** G1 bloco grande (o da rodada 1), G2 bloco justo, G3 cursor sublinhado (M claro e traço âmbar embaixo) e G4 cursor vazado (contorno âmbar). Quanto menos área âmbar, mais longe dos ícones de fundo amarelo; G3 é o que menos lembra.
- **F: duas versões.** F1 com V no alto e F2 com o topo em M pontudo, ambas com picote, furo na linha e cursor âmbar. O F1 ainda lembra envelope; o F2 lembra casinha ou coroa.

### Bateria rodada

- 16, 24, 32, 48 e 64 px, favicon em 16 e 32, máscara redonda e zona segura.
- Preto, negativo, escala de cinza e daltonismo (protanopia, deuteranopia e tritanopia). A simulação usa as matrizes de Machado et al. 2009 em RGB linear; é aproximação de tela e não substitui teste com pessoas.
- Contraste de todos os pares (seção 8 da prévia).
- Simulações da lateral do computador (claro e escuro), do topo do celular, da aba do navegador com o favicon real em 16 px e da tela inicial com ícones genéricos.
- O teste dos 5 segundos está descrito como **previsão minha**, não teste com pessoas.

### Recomendação da rodada 2

Nome **B1 · haste 180 em âmbar-tinta** + ícone **G3 · sublinhado**. Segunda opção de ícone: G2 (bloco justo). Arquivar o F.

### Ainda não feito

- Teste com pessoas reais (5 segundos, idosos).
- A lateral simulada usa a fonte do sistema, não a Atkinson.
- O cursor animado fica para a Fase 4.

## Exploração 3, a última (27/11/2026)

Escolha da rodada 2: ícone **G3** (cursor sublinhado). Descartados G1, G2, G4, F, o âmbar-cobre e a haste larga. Folha de contato em `exploracao-3/folha-de-contato.png`, prévia em `exploracao-3/previa.html`, teste de pixel em `exploracao-3/png/`.

### Nome: haste x I com serifa reta

- **Base:** haste 180 em âmbar-tinta, igual à rodada 2.
- **I com serifa reta:** haste de 180 (o mesmo peso), serifas retas e sem curva. Espessura da serifa: 130, um pouco menos que os braços do E (145), porque traço horizontal parece mais grosso que vertical do mesmo tamanho. Duas larguras: **curta (300)** e **média (370)**. A Lexend tem I com serifa reta no próprio alfabeto (407 de largura, serifa de 143), então o I curto pertence à família e não parece de outra fonte.
- **Kerning:**
  - **E→I:** com a haste eram 100. Com serifa, o braço do E e a serifa ficam frente a frente na mesma altura e quase se emendam numa barra só, então o espaço subiu para 128 (curta) e 132 (média), perto dos 133 que a Lexend usa entre E e I.
  - **I→v:** 70 e 66. A serifa de baixo entra sob o braço aberto do v.
  - **M→E:** igual à rodada 2.
- **Resultado:** os dois I com serifa leem "MEIva" sem ambiguidade em 72, 28 e 18 px, também em cinza. A haste lisa continua parecida com o l da Lexend 700 nos tamanhos pequenos.

### Ícone G3: proporção do traço

| Versão | Traço (largura × espessura, distância do M) | 16 px (favicon) | 1 cor |
| --- | --- | --- | --- |
| G3a | 702 × 120, a 110 (rodada 2) | linha fraca, meio apagada | some quase toda |
| G3b | 702 × 165, a 100 | linha de 1 px cheia | aparece |
| G3c | 540 × 165, a 100 | aparece, mas curta, parece acento | aparece |
| G3d | 702 × 200, a 120 | a mais forte | aparece, mas pesa |

O teste de pixel renderiza o SVG em 16 px de verdade e amplia sem suavizar. No ícone de app em 16 px (com a margem da zona segura) o M tem uns 6 px e tudo borra; esse tamanho não é uso real. O 16 px que importa é o favicon.

### Bateria

Cinza, protanopia, deuteranopia, tritanopia, contraste (todos os pares passam, sem exceção), lateral do computador no claro e no escuro, topo do celular, aba do navegador e tela inicial, para a haste e para a serifa curta.

### Recomendação final

Nome com **I de serifa curta (300)** em âmbar-tinta + ícone **G3b**. Para a Fase 4: um corte próprio do favicon de 16 px, com traço e hastes encaixados no pixel inteiro.

## Fase 4: arquivos finais (27/11/2026)

Aprovado: **nome com I de serifa curta (300) em âmbar-tinta + ícone G3b.** Guia em [guia.md](guia.md), arquivos em `final/`, folha em `final/folha-final.png`.

- **Âmbar por fundo:** âmbar-tinta `#8f5d00` no claro, âmbar-claro `#f5c04f` sobre petróleo, `#f2b134` no escuro e no botão.
- **Favicon de 16 px:** desenhado pixel a pixel. Testei dois cortes contra o vetor reduzido (ampliados 10×, sem suavizar):
  - **A**, o M do limiar de 50% com hastes de 2 px: nítido e lê M.
  - **B**, um V em escada: as contraformas viram ruído.
  - **O vetor reduzido** borra, e o traço cai entre dois pixels.
  
  Ficou o A. O `favicon.svg` é o próprio desenho em grade de 16 (nítido em 16, 32 e 48), e o `favicon.ico` leva 16, 32 e 48 px tirados da mesma grade, ampliados sem suavizar.
- **Ícones:**
  - **"any":** quadrado com raio de 22% e símbolo em 600/1024.
  - **maskable:** sangra até a borda, símbolo em 560/1024, dentro do círculo seguro de 80%.
  - **apple-touch-icon:** quadrado cheio, porque o iOS arredonda sozinho.
- **Compartilhamento:** fundo petróleo, nome e a frase que o app já usa ("O caixa da sua loja numa conversa."), em Atkinson Hyperlegible Next.
- **Avatar do Instagram:** símbolo em 520/1024, para caber no recorte redondo.
- **`public/`:** só `icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png` e `og-image.png`. No Next 16, `favicon.ico`, `icon.svg` e `apple-icon.png` são convenções de `src/app/`; um `favicon.ico` em `public/` conflitaria com o de `src/app/`. Esses três entram na Fase 5. Nada é referenciado pelo app ainda.
- **Animação do cursor:** especificada no guia e não implementada. Proposta:
  - o traço pisca só na tela de carregamento;
  - o campo vazio usa o cursor do próprio sistema em âmbar (`caret-color`);
  - com `prefers-reduced-motion`, o traço fica parado.
  
  A skill `emil-design-eng` não está instalada; a decisão seguiu as regras de movimento do design-system.
- **Documentação:** DESIGN.md, docs/design-system.md e PRODUCT.md atualizados com o logo e a regra do âmbar (botão principal + I do nome + traço do ícone).
