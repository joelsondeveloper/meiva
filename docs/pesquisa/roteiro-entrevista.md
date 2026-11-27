# Roteiro de entrevista com um MEI (20 minutos)

Objetivo: descobrir como a pessoa controla o dinheiro hoje e ver se ela consegue usar a MEIva sem ajuda. O foco é o que ela **faz**, não o que ela acha que faria. As hipóteses que este roteiro testa estão em [personas.md](personas.md) e [dores-e-oportunidades.md](dores-e-oportunidades.md).

## Antes de começar

- **Quem chamar:** dono ou dona de um negócio MEI que vende todo dia. Misture idades; pelo menos uma pessoa com 60 anos ou mais em cada rodada de três.
- **Celular:** use o celular da própria pessoa, se ela topar, porque é nele que ela vai usar o app. Deixe a MEIva aberta com o modo de demonstração (`MEIVA_DADOS_DEMO=1`, fora de produção), para não gravar nada real.
- **Combinado:** peça licença para anotar. Grave áudio só se ela autorizar, em voz alta, no começo da gravação. Não peça CPF, CNPJ, valores do banco nem nome de cliente real. Se ela citar um, anote só a inicial.
- **Material:** este roteiro impresso, um bloco, um cronômetro. Em quem enxerga pouco, ofereça os óculos dela e boa luz [F35].

## Abertura (2 minutos)

Fale com as suas palavras, algo como:

> Estou fazendo um app para pequenos negócios e quero aprender com quem vende de verdade. Não tem resposta certa nem errada. Se alguma coisa do app parecer difícil, a culpa é do app, não sua. Pode falar mal à vontade.

## Parte 1: como é hoje (10 perguntas, cerca de 10 minutos)

Pergunte sempre sobre **a última vez** que algo aconteceu. Uma história real vale mais que uma opinião.

1. Me conta como foi o seu dia de trabalho ontem, do começo ao fim.
2. Ontem, quando você vendeu alguma coisa, o que fez para lembrar dessa venda depois? Pode me mostrar onde anotou?
3. Como as pessoas te pagaram na última semana? Como você fica sabendo quanto entrou em cada jeito?
4. Pense na última vez que alguém levou e ficou de pagar depois. Como foi do começo até hoje?
5. Quando foi a última vez que você teve que cobrar alguém? Como fez? Como se sentiu?
6. No fim do mês passado, como você soube se o mês foi bom ou ruim?
7. O dinheiro das contas da casa e o do negócio: como é isso na prática para você?
8. O que você faz com o celular durante o trabalho? Manda mais texto ou áudio? Para quem?
9. Tem alguma obrigação do MEI que te dá dor de cabeça? Me conta a última vez.
10. Já tentou algum caderno, planilha ou aplicativo para organizar isso? O que aconteceu?

Se sobrar tempo, depois de cada resposta: "E por que foi assim?" ou "Me dá um exemplo".

## Parte 2: tarefas no app (3 tarefas, cerca de 7 minutos)

Entregue o celular e peça que ela fale em voz alta o que está pensando. Não mostre onde tocar. Se ela travar por mais de 1 minuto, pergunte "O que você procuraria agora?" e só então ajude; anote onde travou.

| Tarefa | O que dizer | O que observar |
| --- | --- | --- |
| 1. Anotar uma venda | "Imagine que você acabou de vender uma coisa. Anote essa venda do jeito que achar melhor." | Ela escreve ou fala? Acha o campo em menos de 5 segundos (o teste de `PRODUCT.md`)? Confere o comprovante? Entende o "Mudou no caixa"? |
| 2. Ver o dinheiro do dia | "Agora descubra quanto dinheiro você tem hoje." | Vai ao topo da Conversa ou ao Resumo? Diz o valor certo? Entende que o fiado não está somado? |
| 3. Receber parte de um fiado | "A Marta te devia e pagou só uma parte agora. Registre isso." | Acha a aba Fiados? Usa "Registrar pagamento" ou escreve direto? O valor que falta ficou certo para ela? |

Ao final de cada tarefa, uma pergunta só: "Numa nota de 1 a 5, quanto isso foi fácil?" e "O que te fez dar essa nota?"

## Fechamento (1 minuto)

- "Se você pudesse mudar uma coisa no app, qual seria?"
- "Você conhece outra pessoa que vende e toparia conversar comigo?"
- Agradeça. Não prometa data nem recurso.

## Como não induzir a resposta

- **Não diga o nome dos recursos** ("caixa", "fiado", "resumo") antes da pessoa usar. Escute a palavra que ela usa e anote.
- **Pergunte sobre o passado, não sobre o futuro.** "Você usaria?" quase sempre recebe "sim". "Quando foi a última vez que...?" mostra o que acontece de fato.
- **Pergunta aberta e neutra.** Troque "Não é chato anotar no caderno?" por "Como é anotar no caderno?".
- **Não complete as frases dela** e aguente o silêncio. Conte até cinco antes de falar de novo.
- **Não defenda o app.** Se ela criticar, responda "Me conta mais" e anote.
- **Não elogie as respostas** ("ótimo", "isso mesmo"); ela vai passar a dizer o que você quer ouvir.
- **Observe mais do que pergunte nas tarefas.** O que ela faz vale mais que o que ela diz sobre o que fez.
- **Poucas tarefas e reais.** Com pessoas mais velhas, menos tarefas e ambiente calmo dão resultado melhor [F35].

## Depois da entrevista (5 minutos, sozinho)

Anote logo, enquanto lembra:

1. Três frases que ela disse, do jeito que disse.
2. Onde travou em cada tarefa e quanto tempo levou.
3. Que palavra ela usa para "caixa", "fiado", "gasto" e "retirada".
4. Qual hipótese de [personas.md](personas.md) foi confirmada, qual caiu e o que apareceu de novo.

Depois de três entrevistas, junte as anotações e atualize a tabela de [dores-e-oportunidades.md](dores-e-oportunidades.md), trocando **[hipótese]** por "visto em X de 3 entrevistas" onde couber.
