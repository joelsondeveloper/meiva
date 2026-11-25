# MEIva: design

Resumo para quem vai mexer na interface. As regras completas estão em [docs/design-system.md](docs/design-system.md).

- **Marca:** parceira, clara, confiável. Simples sem ser infantil; moderna sem efeito.
- **Cores:** petróleo `#0d5c57` (marca e navegação), âmbar `#f2b134` (só o botão principal), verde (entrou), tijolo (saiu), azul (fiado, a receber). Tokens em `src/app/globals.css`; nunca use cor fixa nos componentes (o teste barra).
- **Tipografia:** Atkinson Hyperlegible Next, uma família só, corpo de 18px, valores com `tabular-nums`.
- **Navegação:** Conversa, Resumo, Fiados, nessa ordem e com esses nomes. Barra de abas embaixo no celular; barra lateral no computador.
- **Cada tela:** título grande, uma frase, um botão principal. Estados de carregando, vazio e erro com texto humano.
- **Lançamentos:** ícone + o que foi + como ("Venda no Pix") + valor com sinal. O fiado não tem sinal: tem o selo "a receber".
- **Movimento:** só em resposta a uma ação, entre 150 e 200ms, e desligado com `prefers-reduced-motion`.

Screenshots em `docs/screenshots/` (390px e 1280px, claro e escuro). Para gerar de novo com dados fictícios, rode o dev com `MEIVA_DADOS_DEMO=1` (só funciona fora de produção) e simule as rotas `/api/*` no Playwright.
