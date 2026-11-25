# MEIva: produto

## O que é

Um app web em que o microempreendedor individual (MEI) controla o caixa conversando em linguagem natural: "vendi 50 reais de pudim", "paguei 30 de luz", "a Marta levou fiado". Um agente de IA anota, consulta e corrige.

## Para quem

Donas e donos de negócios pequenos (barraca, loja, delivery, fábrica pequena), quase sempre no celular. Muitos têm pouca familiaridade com tecnologia, e parte do público é mais velha.

## O trabalho de cada tela

| Página | Endereço | A pessoa vem para… |
| --- | --- | --- |
| Conversa | `/` | registrar venda, gasto, fiado e recebimento |
| Resumo | `/resumo` | ver quanto tem no caixa, o que entrou e o que saiu |
| Fiados | `/fiados` | ver quem deve, quanto, e registrar um pagamento |

## Teste da primeira vez

Alguém que nunca viu o app precisa achar em até 5 segundos:
1. **onde registrar uma venda:** a Conversa abre direto no campo, com três frases de exemplo;
2. **o saldo:** "Hoje R$ …" no topo da Conversa (celular), o painel "Caixa de hoje" (computador) e a aba Resumo;
3. **quem deve:** a aba Fiados, sempre visível com ícone e nome.

## Restrições

- Acessibilidade: texto de 18px ou mais, entrelinha 1.5 ou mais, contraste 7:1 no texto principal, toque de 48px ou mais, nunca só cor, foco visível.
- Também é peça de portfólio: precisa ser bonito mesmo que o negócio não vá para a frente.

Detalhes visuais: [DESIGN.md](DESIGN.md) e [docs/design-system.md](docs/design-system.md).
