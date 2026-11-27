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
