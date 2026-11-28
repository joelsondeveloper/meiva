# MEIva: produto

<!-- impeccable:product-schema 1 -->

## Platform

web

## O que é

Um app web em que o microempreendedor individual (MEI) controla o caixa conversando em linguagem natural: "vendi 50 reais de pudim", "paguei 30 de luz", "vendi 40 fiado pra Marta". Um agente de IA anota, consulta e corrige.

## Para quem

Donas e donos de negócios pequenos (barraca, loja de roupa, delivery, fábrica pequena), quase sempre no celular, muitas vezes no meio do atendimento. Muitos têm pouca familiaridade com tecnologia, e parte do público é idosa. Os mais jovens também precisam se sentir em casa.

## Posicionamento

O MEI anota o caixa escrevendo do jeito que fala, numa conversa dentro do app, sem formulário nem planilha: um agente anota, consulta e corrige.

O WhatsApp é um canal futuro para o mesmo agente, mas ainda não existe; o chat no app continua mesmo depois dele. **A interface não imita o WhatsApp** (nem cores, nem bolhas verdes, nem padrões de mensageiro copiados).

## O trabalho de cada tela

| Página | Endereço | A pessoa vem para… |
| --- | --- | --- |
| Conversa | `/` | registrar venda, gasto, fiado e recebimento |
| Resumo | `/resumo` | ver quanto tem no caixa, o que entrou e o que saiu |
| Fiados | `/fiados` | ver quem deve, quanto, e registrar um pagamento |

## Contexto de uso

- Celular na mão, muitas vezes uma mão só, luz do dia ou balcão escuro; anotações curtas e frequentes ao longo do dia.
- No computador, uma consulta mais calma do caixa e dos fiados.
- Next.js 16 (App Router, cacheComponents), TypeScript, Tailwind só com tokens de `src/app/globals.css`, Supabase, Vercel.

## Teste da primeira vez

Alguém que nunca viu o app precisa achar em até 5 segundos:
1. **onde registrar uma venda:** a Conversa abre direto no campo, com três frases de exemplo;
2. **o saldo:** "Hoje R$ …" no topo da Conversa (celular), o painel "Caixa de hoje" (computador) e a aba Resumo;
3. **quem deve:** a aba Fiados, sempre visível com ícone e nome.

## Compromissos de marca

- Nome **MEIva**; "MEI" negrito + "va" normal, com o I desenhado como cursor de texto em âmbar; ícone e favicon: o M com o cursor sublinhado ([guia da marca](docs/marca/guia.md)).
- Adjetivos: **parceira, clara, confiável**. Simples não é infantil; moderno não é cheio de efeito.
- Textos em pt-BR, frases curtas, voz ativa, palavras do dia a dia ("venda", "gasto", "fiado", "recebimento"). Erros dizem o que fazer, sem pedir desculpa. Estado vazio convida à ação.

## Evidências disponíveis

- Não há usuários reais, depoimentos nem números de uso. **Nunca inventar** cliente, depoimento, métrica ou selo.
- Dados fictícios de uma doceria (`MEIVA_DADOS_DEMO=1`, só fora de produção) servem para screenshots; nunca usar dados reais.
- Screenshots em `docs/screenshots/`.

## Princípios do produto

1. Um objetivo principal por tela; o resto fica quieto.
2. A pessoa nunca precisa entender de finanças: palavras do balcão, não do contador.
3. Nada acontece no caixa sem a pessoa ver e poder desfazer.
4. Fiado não é dinheiro no caixa até ser pago.
5. Também é peça de portfólio: precisa ser bonito e bem feito mesmo que o negócio não vá para a frente.

## Acessibilidade e inclusão

- Corpo de 18px ou mais, entrelinha 1.5 ou mais.
- Contraste 7:1 no texto principal, 4.5:1 nos demais (conferido em `tests/tema.test.ts`).
- Alvos de toque de 48px ou mais; foco sempre visível.
- Nunca só cor: sempre ícone, sinal ou texto.
- `prefers-reduced-motion` respeitado; zoom do navegador liberado.

Detalhes visuais: [DESIGN.md](DESIGN.md) e [docs/design-system.md](docs/design-system.md).
