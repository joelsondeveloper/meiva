# MEIva

O caixa da loja numa conversa. A MEIva é um app web para o microempreendedor
individual (MEI) do comércio, pensado para o celular: a pessoa escreve do jeito
que fala, como no WhatsApp, e a IA transforma a frase em lançamentos de caixa.

> "vendi 3 blusas a 50 no pix" → entrada de R$ 150,00 no Pix
> "paguei 120 de fornecedor" → saída de R$ 120,00
> "a Marta levou 2 blusas fiado" → venda fiado (fica em "a receber", fora do saldo)

Quando falta informação (ex.: "vendi uma saia"), a MEIva pergunta antes de
salvar. Cada registro tem um botão **Desfazer**, e o topo da tela mostra o
saldo do dia, com os totais e a lista de lançamentos.

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

Rode a migration `supabase/migrations/0001_lancamentos.sql` no seu projeto
Supabase (SQL Editor ou `supabase db push`) e suba o app:

```powershell
npm run dev   # http://localhost:3000
```

Na Vercel, cadastre as mesmas variáveis em Project Settings → Environment
Variables (Preview e Production).

## Arquitetura

```
chat (navegador) ──POST /api/interpret──▶ rate limit ──▶ interpretador (LLM via OpenRouter)
                                                              │ resposta validada pelo Zod
                                                              ▼
                 ◀── lançamentos + resumo do dia ─────── Supabase (tabela lancamentos)
```

- **Chat** (`src/components/chat/`): tela única, mobile-first. A conversa fica
  no `sessionStorage` da aba (últimas 10 mensagens); os lançamentos ficam no banco.
- **API** (`src/app/api/`): `POST /api/interpret` interpreta a frase e salva,
  ou devolve uma pergunta; `GET /api/lancamentos` traz o dia;
  `DELETE /api/lancamentos` é o "Desfazer".
- **Interpretador** (`src/lib/interpreter/`): uma chamada ao modelo com saída
  estruturada (JSON Schema). Nada é salvo sem passar pelo Zod.
- **Banco** (`src/lib/lancamentos/`): valores sempre em centavos; venda fiado
  não entra no saldo e soma em "a receber". O "dia" é o de Brasília.
- **Rate limit** (`src/lib/rate-limit.ts`): 60 mensagens a cada 10 min por IP e
  500 por dia no total (zera à meia-noite de Brasília). Os contadores ficam em
  memória, por instância do servidor.

### Cores e acessibilidade

Todas as cores são design tokens em `src/app/globals.css` (`--cor-fundo`,
`--cor-texto`, `--cor-entrada`, `--cor-saida`...). Para trocar a paleta da
marca, mude só esse arquivo e rode `npm test`: o teste confere o contraste
(texto 4.5:1) e barra cor fixa nos componentes. A única cópia fora dele é o
`theme-color` em `src/app/layout.tsx` (o teste avisa se divergir).

Regras de interface: texto de no mínimo 16px, entrelinha 1.4+, áreas de toque
de 44x44px, foco visível, e entrada/saída sempre com sinal (+/−) e ícone,
nunca só pela cor.

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
| `npm run comparar -- [--rodadas=N] <modelo> ...` | compara modelos do OpenRouter nas frases de `tests/fixtures/frases.ts` (usa o `.env.local` e gasta créditos) |

## Testes

```powershell
npm test
```

Os testes não usam rede nem o `.env.local`: o modelo e o Supabase são
substituídos por dados falsos (mocks). Eles cobrem as rotas da API (incluindo
rate limit e Desfazer), o cálculo do saldo, datas no fuso de Brasília,
formatação em reais, o histórico da conversa no `sessionStorage`, as mensagens
de erro e os design tokens (contraste e cores fixas).

Para testar o interpretador com um modelo de verdade, use `npm run comparar`.

## Estrutura de pastas

```
src/
├── app/
│   ├── api/interpret/route.ts     # POST: interpreta e salva (com rate limit)
│   ├── api/lancamentos/route.ts   # GET: dia · DELETE: Desfazer
│   ├── layout.tsx                 # metadados, viewport, theme-color
│   ├── page.tsx                   # tela do chat
│   ├── not-found.tsx, error.tsx, global-error.tsx
│   └── globals.css                # design tokens e base de acessibilidade
├── components/chat/               # chat, bolhas, boas-vindas, resumo do dia, ícones
└── lib/
    ├── chat/                      # chamadas da API e histórico (sessionStorage)
    ├── interpreter/               # prompt, schema Zod e chamada ao modelo
    ├── lancamentos/               # repository Supabase, saldo e tipos
    ├── llm/openrouter.ts          # cliente OpenAI apontando para o OpenRouter
    ├── supabase/                  # clientes do servidor e do navegador
    ├── rate-limit.ts
    ├── datas.ts, formatacao.ts
supabase/migrations/               # SQL da tabela lancamentos
scripts/comparar-modelos.ts
tests/                             # Vitest (fixtures/ tem as frases de exemplo)
```

Convenção: código genérico em inglês (`interpret`, `getSupabaseServerClient`),
termos de domínio em português (`lancamento`, `entrada`, `saida`, `fiado`).
