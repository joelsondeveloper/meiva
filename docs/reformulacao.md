# Reformulação do design: plano (26/11/2026)

Evolução, não recomeço. Pergunta-guia: o que faria uma pessoa de 65 anos pensar "isso é fácil e de confiança" e um jovem pensar "isso é bem feito"?

## Diagnóstico

**Preservar (está bom):** tokens com teste de contraste e de cor fixa; Atkinson Hyperlegible Next com algarismos tabulares; os papéis das cores (petróleo marca, âmbar só no botão principal, verde entrou, tijolo saiu, azul fiado); fiado sem "+" e com selo; navegação com aba ativa que muda cor e forma; textos simples; Desfazer por linha; "Registrar pagamento" que abre a Conversa com a frase pronta.

**Genérico / "cara de IA":**
- tudo é cartão `rounded-3xl` com borda de 1px sobre fundo creme, com o mesmo raio para hierarquias diferentes;
- ícone dentro de círculo pastel em cada linha (o padrão de qualquer app de finanças);
- "R$" do mesmo tamanho e peso dos algarismos: o número grande é só texto grande, sem desenho;
- fundo creme quente (`#f6f5f1`), o fundo mais comum em telas geradas;
- Fiados no computador: a caixa tracejada vazia ocupa 60% da tela;
- cabeçalho da Conversa no celular com três andares (~130px) antes da primeira mensagem;
- "Desfeito" aparece duas vezes (linha riscada + mensagem extra);
- no fiado, valor + selo + Desfazer empilhados à direita deixam a linha alta e torta.

**Técnico (audit Impeccable, 16/20):** a fonte não tem fallback com métricas ajustadas (o texto pula ao carregar); `prefers-reduced-motion` zera tudo em vez de trocar o movimento por cor/opacidade.

## Cores (base)

| Nome | Hex | Papel |
| --- | --- | --- |
| Petróleo | `#0d5c57` | marca, navegação, seleção, bolha da pessoa |
| Âmbar | `#f2b134` | só o botão principal |
| Papel de caixa | `#f2f4f2` | fundo (era `#f6f5f1`, mais frio, puxado para o petróleo) |
| Tinta | `#1b2422` | texto principal (14,4:1) |
| Folha | `#fdfdfb` | superfícies (campo, painel, barras) |

Semânticas, sem mudança: entrou `#1d7343`, saiu `#b0382a`, fiado `#2d5b9a` (escuro: `#63c98d`, `#f2907f`, `#8fb5ee`).

## Tipografia (uma família: Atkinson Hyperlegible Next)

| Papel | Tamanho / peso | Uso |
| --- | --- | --- |
| Número herói | 48–56px, 700, tabular; "R$" a 0,5em, 400 | saldo do Resumo, "Falta receber" |
| Título de página | 32px (celular) / 40px, 700 | Resumo, Fiados |
| Título de bloco | 22px, 700 | "Entrou e saiu" |
| Rótulo | 18px, 700, caixa normal | "Dinheiro no caixa" |
| Corpo | 18px / 1.55, 400 | tudo o mais |
| Valor de linha | 20px, 700, tabular | lançamentos |

## Elemento memorável: o comprovante

Hoje o memorável é o número do saldo. Proposta mais forte, sem poluir: **cada resposta que anota algo vira um comprovante**: as linhas anotadas e, no pé, "Caixa de hoje agora **R$ 68,00**" (com quanto mudou). É o momento em que a pessoa confia: ela vê o que foi anotado *e* o efeito no caixa, sem sair da conversa. No Resumo o saldo continua o herói; o comprovante liga as duas telas.

## Wireframes

### Conversa, celular (390px)

```
┌──────────────────────────────┐
│ MEIva          [▣ Hoje R$ 68]│  ← um andar só; "Nova conversa" vira botão discreto no fim da conversa
├──────────────────────────────┤
│            ┌───────────────┐ │
│            │Vendi 50 de    │ │  bolha petróleo
│            │pudim          │ │
│            └───────────────┘ │
│ Anotei a venda do pudim.     │  texto do agente sem bolha
│ ┌──────────────────────────┐ │
│ │↙ pudim          +R$ 50,00│ │  comprovante
│ │  Venda no Pix   Desfazer │ │
│ │┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄│ │
│ │Caixa de hoje   R$ 68,00 ▲│ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ [Escreva aqui…      ] [Enviar]│  âmbar
├──────────────────────────────┤
│  Conversa  Resumo   Fiados   │
└──────────────────────────────┘
```

### Conversa, computador (1280px)

```
┌────────┬─────────────────────────────────┬──────────────┐
│ MEIva  │ Conversa                        │ Caixa de hoje│
│        │ Conte o que vendeu, gastou…     │ R$ 68,00     │
│▌Conversa├─────────────────────────────────┤ ↙ Entrou  +86│
│ Resumo │  (mensagens, máx. 40rem)        │ ↗ Saiu    −18│
│ Fiados │                                 │ ▣ No caixa 586│
│        │                                 │ ◷ Fiados  185│
│        ├─────────────────────────────────┤ Ver resumo › │
│        │ [Escreva aqui…          ][Enviar]│              │
└────────┴─────────────────────────────────┴──────────────┘
```

### Resumo, celular

```
┌──────────────────────────────┐
│ MEIva                        │
│ Resumo                       │
│ ┌──────────────────────────┐ │
│ │Dinheiro no caixa         │ │  bloco principal (único com fundo de cor)
│ │R$ 586,00                 │ │  número herói
│ │Hoje +R$ 68,00            │ │
│ └──────────────────────────┘ │
│ [Anotar uma venda]  âmbar    │
│ Entrou e saiu [Hoje|7d|Mês]  │
│ ↙ Entrou        +R$ 86,00    │
│ ████████████████████         │
│ ↗ Saiu          −R$ 18,00    │
│ ████                         │
│ Sobrou R$ 68,00 hoje.        │
│ ◷ Fiados  R$ 185  Ver quem › │
│ Últimas anotações (linhas)   │
└──────────────────────────────┘
```

### Resumo, computador

```
┌────────┬───────────────────────────────────────────────┐
│ MEIva  │ Resumo                       [Anotar uma venda]│
│        │ ┌──────────────────────────┐ ◷ Fiados          │
│ Conversa│ │Dinheiro no caixa        │   R$ 185,00       │
│▌Resumo │ │R$ 586,00   Hoje +68,00   │   3 pessoas · Ver │
│ Fiados │ └──────────────────────────┘ Últimas anotações │
│        │ Entrou e saiu [Hoje|7d|Mês]  ↙ pudim    +50,00 │
│        │ barras…                      ↗ luz      −30,00 │
└────────┴───────────────────────────────────────────────┘
```

### Fiados, celular (lista → detalhe)

```
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ Fiados                       │    │ ‹ Todos os fiados            │
│ Falta receber   R$ 185,00    │    │ Marta                        │
│ ─────────────────────────────│    │ Falta receber                │
│ M  Marta      R$ 80,00     › │ →  │ R$ 80,00                     │
│    2 fiados   a receber      │    │ [Registrar pagamento] âmbar  │
│ ─────────────────────────────│    │ O que levou e o que pagou    │
│ J  João       R$ 80,00     › │    │ 25 de novembro               │
│ D  Dona Cida  R$ 25,00     › │    │ ◷ bolo de cenoura   R$ 40,00 │
└──────────────────────────────┘    └──────────────────────────────┘
```

### Fiados, computador

```
┌────────┬────────────────────────┬──────────────────────┐
│ MEIva  │ Fiados                 │ Marta                │  abre na maior dívida;
│        │ Falta receber R$ 185   │ Falta receber        │  sem caixa tracejada vazia
│ Conversa│ ▌M Marta     R$ 80  › │ R$ 80,00             │
│ Resumo │  J João      R$ 80  › │ [Registrar pagamento]│
│▌Fiados │  D Dona Cida R$ 25  › │ histórico por data   │
└────────┴────────────────────────┴──────────────────────┘
```

## Revisão do plano contra o briefing

- **Fundo creme** era o default de IA → trocado por "papel de caixa" frio, ligado ao petróleo (contraste conferido).
- **"Número grande + rótulo pequeno"** é o herói padrão de qualquer dashboard → mantido só no Resumo, mas desenhado ("R$" menor, alinhado pela base), e o memorável passa a ser o comprovante, que é específico do produto (conversa que anota).
- **Bolhas de chat** puxavam para mensageiro (o briefing proíbe imitar WhatsApp) → o agente fala sem bolha; só a pessoa tem bolha (petróleo), e o que foi anotado vira comprovante.
- **Cartões iguais** → um bloco com cor por tela; o resto é linha com divisória.
- Alinhamento à esquerda em tudo; nenhum texto centralizado fora de estado vazio.
