# meiva

Gestão financeira para MEI por conversa. O usuário escreve algo como
"vendi 3 blusas a 50 e paguei 120 de fornecedor" e a IA transforma a frase em
lançamentos de caixa (entradas e saídas).

> Status: **esqueleto**. A estrutura, os tipos e as dependências estão prontos;
> a lógica de negócio (interpretador, endpoint, telas) está marcada com `TODO`.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind)
- [OpenRouter](https://openrouter.ai) via SDK `openai` (LLM)
- [Zod](https://zod.dev) (validação da saída da IA)
- [Supabase](https://supabase.com) (Postgres)
- [Vitest](https://vitest.dev) (testes)

## Requisitos

- Node.js 20 ou superior
- npm
- git

## Instalação

```powershell
npm install
```

## Configurar o `.env.local`

1. Copie o exemplo:

   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Preencha as variáveis:

   | Variável | Onde obter | Uso |
   | --- | --- | --- |
   | `OPENROUTER_API_KEY` | openrouter.ai → Keys | servidor |
   | `OPENROUTER_MODEL` | openrouter.ai → Models (ex.: id do modelo) | servidor |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | navegador e servidor |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | navegador |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | **só servidor** (ignora RLS) |

   O `.env.local` está no `.gitignore` e nunca deve ser commitado.

3. Rode a migration `supabase/migrations/0001_lancamentos.sql` no seu projeto
   Supabase (SQL Editor ou `supabase db push`, se usar a CLI).

## Como rodar

```powershell
npm run dev          # servidor de desenvolvimento em http://localhost:3000
npm test             # testes (vitest run)
npm run test:watch   # testes em modo watch
npm run typecheck    # gera os tipos de rota (next typegen) e roda tsc --noEmit
npm run lint         # ESLint
npm run build        # build de produção
```

## Estrutura de pastas

```
meiva/
├── src/
│   ├── app/
│   │   ├── api/interpret/route.ts   # POST /api/interpret (hoje responde 501)
│   │   ├── layout.tsx, page.tsx     # páginas padrão do create-next-app
│   │   └── globals.css
│   └── lib/
│       ├── interpreter/
│       │   ├── schema.ts            # schemas Zod: Lancamento e Resultado
│       │   ├── prompt.ts            # system prompt (TODO)
│       │   └── interpret.ts         # interpret(texto) -> Resultado (TODO)
│       ├── llm/openrouter.ts        # cliente OpenAI apontando para o OpenRouter
│       └── supabase/
│           ├── client.ts            # cliente do navegador (anon key)
│           └── server.ts            # cliente do servidor (service role)
├── supabase/migrations/
│   └── 0001_lancamentos.sql         # tabela lancamentos
├── tests/
│   ├── fixtures/frases.ts           # 10 frases de exemplo + resultado esperado
│   └── interpreter.test.ts          # todos por frase + teste dos schemas
├── .env.example
└── vitest.config.mts
```

Convenção: código genérico em inglês (`interpret`, `getSupabaseServerClient`),
termos de domínio em português (`lancamento`, `entrada`, `saida`, `fiado`).
