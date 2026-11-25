# MEIva

O caixa da loja numa conversa. A MEIva é um app web para o microempreendedor
individual (MEI) do comércio, pensado para o celular: a pessoa escreve do jeito
que fala, como no WhatsApp, e um agente de IA registra, consulta e corrige os
lançamentos de caixa.

> "vendi 3 blusas a 50 no pix" → entrada de R$ 150,00 no Pix
> "paguei 120 de fornecedor" → saída de R$ 120,00
> "a Marta levou 2 blusas fiado" → venda fiado (fica em "a receber", fora do saldo)
> "coloquei 200 de troco no caixa" → caixa inicial (aporte): entra no saldo, mas não é venda
> "quanto a Marta me deve?" → só consulta, não registra nada

Quando falta informação (ex.: "vendi uma saia"), a MEIva pergunta antes de
salvar, e a resposta seguinte ("80") chega com o contexto da conversa. Cada
registro tem um botão **Desfazer**. O topo da tela mostra o saldo do dia; ao
tocar, aparecem o saldo acumulado, quem está devendo e a lista do dia.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, TypeScript) e Tailwind CSS 4
- [OpenRouter](https://openrouter.ai) via SDK `openai` (modelo de linguagem)
- [Zod](https://zod.dev) (valida a resposta da IA e as entradas da API)
- [Supabase](https://supabase.com) (Postgres)
- [Vitest](https://vitest.dev) (testes)

## Como rodar

Requisitos: Node.js 20 ou superior, npm e git.

```powershell
npm install
Copy-Item .env.example .env.local   # no Linux/macOS: cp .env.example .env.local
```

Preencha o `.env.local` (ele está no `.gitignore` e **nunca** deve ser commitado):

| Variável | Onde obter | Usada em |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | openrouter.ai → Keys | servidor |
| `OPENROUTER_MODEL` | openrouter.ai → Models (id do modelo) | servidor |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | servidor |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | reservado para o login (ainda não usado) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | **só servidor** (ignora o RLS) |
| `APP_PASSWORD` | você escolhe | senha de acesso ao app (vazio = sem bloqueio, só para dev local) |

Rode as migrations de `supabase/migrations/` em ordem (`0001_lancamentos.sql`
e `0002_agente.sql`) no seu projeto Supabase (SQL Editor ou
`supabase db push`) e suba o app:

```powershell
npm run dev   # http://localhost:3000
```

Na Vercel, cadastre as mesmas variáveis em Project Settings → Environment
Variables (Preview e Production). Com `APP_PASSWORD` preenchida, o navegador
pede usuário e senha (HTTP Basic); o usuário pode ser qualquer um.

## Arquitetura

```
chat (navegador)
  │  POST /api/interpret { mensagens }   (últimas 10)
  ▼
proxy.ts (senha) ─▶ rate limit ─▶ agente (LLM via OpenRouter, function calling)
                                     │  chama ferramentas; argumentos validados pelo Zod
                                     ▼
                                  ferramentas ─▶ repository ─▶ Supabase (Postgres)
  ◀── { resposta, resumo, lancamentosCriados } ─────────────────────┘
```

- **Chat** (`src/components/chat/`): tela única, mobile-first. A conversa fica
  no `sessionStorage` da aba (últimas 10 mensagens) e vai junto em cada
  envio, para a IA entender respostas curtas. A resposta da IA aparece como
  bolha, com os lançamentos criados logo abaixo; cada um tem sinal (+/−),
  ícone e o seu botão Desfazer.
- **Agente** (`src/lib/agente/`): a IA conversa e chama ferramentas até ter
  uma resposta em texto (no máximo 6 rodadas). Ferramentas:
  `registrar_lancamentos`, `buscar_devedores`, `consultar_resumo`,
  `listar_ultimos`, `desfazer_lancamento` e `corrigir_lancamento`. Os
  argumentos de toda ferramenta passam pelo Zod no servidor: nada é gravado
  sem validação.
- **API** (`src/app/api/`):
  - `POST /api/interpret`: roda o agente e devolve `{ resposta, resumo, lancamentosCriados }`;
  - `GET /api/lancamentos?data=`: lançamentos do dia e resumo;
  - `POST /api/lancamentos/[id]/desfazer`: o botão Desfazer.
- **Lançamentos** (`src/lib/lancamentos/`): valores sempre em centavos. Cada
  lançamento tem `tipo` (entra ou sai do caixa) e `natureza` (venda, despesa,
  recebimento de fiado, aporte ou retirada pessoal). Venda fiado não entra no
  saldo e soma em "a receber", por pessoa. O resumo traz o saldo do dia, o
  saldo acumulado e o a receber. O "dia" é o de Brasília.
- **Desfazer é soft delete**: a linha fica no banco com `anulado_em`
  preenchido e deixa de contar em tudo. Nada é apagado de verdade.
- **Supabase** (`src/lib/supabase/`, `supabase/migrations/`): Postgres,
  acessado só pelo servidor, com a service role.
- **Acesso** (`src/proxy.ts`): senha única via HTTP Basic, até entrar o login
  de verdade.
- **Rate limit** (`src/lib/rate-limit.ts`): `/api/interpret` aceita 60
  mensagens a cada 10 min por IP e 500 por dia no total (zera à meia-noite de
  Brasília); o Desfazer, 30 a cada 10 min por IP. Os contadores ficam em
  memória, por instância do servidor.

### Cores e acessibilidade

O design system (paleta, tipografia, movimento e textos) está em
[docs/design-system.md](docs/design-system.md), com screenshots em
`docs/screenshots/`.

Todas as cores são design tokens em `src/app/globals.css` (`--cor-fundo`,
`--cor-texto`, `--cor-primaria`, `--cor-acento`, `--cor-entrada`...). Para
trocar a paleta da marca, mude só esse arquivo e rode `npm test`: o teste
confere o contraste (texto principal 7:1, demais textos 4.5:1) e barra cor fixa
nos componentes. A única cópia fora dele é o `theme-color` em
`src/app/layout.tsx` (o teste avisa se divergir).

Regras de interface: corpo de 18px com entrelinha 1.55, áreas de toque de
48px ou mais, foco visível e nada só pela cor. Cada registro tem sinal (+/−) e
ícone próprio (entrada, saída, fiado, caixa inicial e retirada pessoal); o
fiado não tem sinal, e sim o selo "a receber".

Para ver as telas com dados fictícios em desenvolvimento, rode o dev com
`MEIVA_DADOS_DEMO=1`: as páginas Resumo e Fiados passam a usar um repositório
em memória (isso nunca liga em produção).

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm start` | sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | gera os tipos de rota (`next typegen`) e roda `tsc --noEmit` |
| `npm test` | testes (Vitest, uma vez) |
| `npm run test:watch` | testes em modo watch |
| `npm run comparar -- <modelo> ...` | roda os cenários multi-turno de `tests/fixtures/cenarios.ts` no agente com modelos do OpenRouter (`RODADAS=N` repete; usa o `.env.local` e gasta créditos) |

## Testes

```powershell
npm test
```

Os testes não usam rede nem o `.env.local`: o modelo e o Supabase são
substituídos por dados falsos (mocks) ou por um repositório em memória. Eles
cobrem o agente e as ferramentas, as rotas da API (incluindo rate limit, senha
e Desfazer), o saldo e o a receber, datas no fuso de Brasília, formatação em
reais, o histórico da conversa no `sessionStorage`, o sinal e o ícone de cada
registro, as mensagens de erro e os design tokens (contraste e cores fixas).

Para testar o agente com um modelo de verdade, use `npm run comparar`.

## Estrutura de pastas

```
src/
├── proxy.ts                       # senha de acesso (HTTP Basic)
├── app/
│   ├── api/interpret/route.ts     # POST: agente (com rate limit)
│   ├── api/lancamentos/route.ts   # GET: lançamentos e resumo do dia
│   ├── api/lancamentos/[id]/desfazer/route.ts   # POST: Desfazer (soft delete)
│   ├── layout.tsx                 # fonte, metadados, theme-color e navegação
│   ├── page.tsx                   # Conversa (chat com o agente)
│   ├── resumo/page.tsx            # Resumo: caixa, entrou e saiu, fiados, últimas anotações
│   ├── fiados/page.tsx            # Fiados: quem deve, por pessoa, e Registrar pagamento
│   ├── not-found.tsx, error.tsx, global-error.tsx
│   └── globals.css                # design tokens e base de acessibilidade
├── components/
│   ├── chat/                      # conversa, bolhas, boas-vindas e painel Caixa
│   ├── navegacao/                 # barra de abas (celular) e barra lateral (computador)
│   ├── lancamento/linha.tsx       # linha de lançamento com ícone, sinal e selo "a receber"
│   └── pagina.tsx, marca.tsx, icones.tsx
└── lib/
    ├── agente/                    # agente, prompt, ferramentas e repositório em memória
    ├── chat/                      # chamadas da API, histórico e categoria de cada registro
    ├── dados/                     # repositório das páginas Resumo/Fiados e períodos
    ├── interpreter/               # schemas Zod (e o interpretador antigo, ainda não removido)
    ├── lancamentos/               # repository Supabase, saldo, resumo, pessoa e tipos
    ├── llm/openrouter.ts          # cliente OpenAI apontando para o OpenRouter
    ├── supabase/                  # clientes do servidor e do navegador
    ├── rate-limit.ts
    └── datas.ts, formatacao.ts
supabase/migrations/               # 0001: tabela lancamentos · 0002: natureza, pessoa e anulado_em
scripts/comparar-modelos.ts
tests/                             # Vitest (fixtures/ tem os cenários do agente)
```

Convenção: código genérico em inglês (`interpret`, `getSupabaseServerClient`),
termos de domínio em português (`lancamento`, `entrada`, `saida`, `fiado`).
