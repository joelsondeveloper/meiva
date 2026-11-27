# MEIva: design

Resumo para quem vai mexer na interface. As regras completas estão em [docs/design-system.md](docs/design-system.md).

- **Marca:** parceira, clara, confiável. Simples sem ser infantil; moderna sem efeito. Logo: o I de "MEIva" é o cursor de texto (I com serifas curtas, em âmbar); ícone: o M com o cursor sublinhado. Guia: [docs/marca/guia.md](docs/marca/guia.md).
- **Cores:** petróleo `#0d5c57` (marca e navegação), âmbar `#f2b134` (botão principal, I do nome e traço do ícone; no logo, âmbar-tinta `#8f5d00` no claro e âmbar-claro `#f5c04f` no petróleo), verde (entrou), tijolo (saiu), azul (fiado, a receber), fundo "papel de caixa" `#f2f4f2`. O bloco herói do Resumo (`heroi`) é o único bloco de cor cheia. Tokens em `src/app/globals.css`; nunca use cor fixa nos componentes (o teste barra).
- **Tipografia:** Atkinson Hyperlegible Next no texto, corpo de 18px, com reserva de medidas ajustadas (o texto não pula ao carregar). **Valores em reais em Lexend** (zero sem corte), só eles: todo dinheiro passa por `<Valor>` (classe `valor`, `--fonte-valor`). A Lexend não tem algarismos tabulares: valores alinhados à direita continuam alinhados pela vírgula, mas números de larguras diferentes não formam coluna perfeita.
- **Navegação:** Conversa, Resumo, Fiados, nessa ordem e com esses nomes. Barra de abas embaixo no celular; barra lateral no computador.
- **Cada tela:** título grande, uma frase, um botão principal. Estados de carregando, vazio e erro com texto humano.
- **Assinatura: o comprovante.** Toda resposta que anota algo mostra a hora, as linhas, "Mudou no caixa" em reais e, no mais recente, "Caixa de hoje agora". O texto da MEIva não tem bolha; só a pessoa tem (não imitar mensageiro).
- **Lançamentos:** ícone na cor da categoria (sem círculo) + o que foi + como ("Venda no Pix") + valor com sinal. O fiado não tem sinal: tem o selo "a receber" com contorno. Desfazer discreto, com 48px de altura.
- **Raios:** bloco 24px, apoio 16px, controle 14px, selo 8px. Listas são linhas com divisória, não cartões.
- **Movimento:** só em resposta a uma ação, até 250ms. Com `prefers-reduced-motion`, sai o que desloca ou escala; ficam fade e troca de cor.

Screenshots em `docs/screenshots/antes` e `docs/screenshots/depois` (320, 390 e 1280px, claro e escuro). Plano da reformulação: [docs/reformulacao.md](docs/reformulacao.md). Para gerar de novo com dados fictícios, rode o dev com `MEIVA_DADOS_DEMO=1` (só funciona fora de produção) e simule as rotas `/api/*` no Playwright.
