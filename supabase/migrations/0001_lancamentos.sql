-- 0001_lancamentos: tabela de lançamentos de caixa do MEI.

create table if not exists public.lancamentos (
  id               uuid primary key default gen_random_uuid(),
  tipo             text not null check (tipo in ('entrada', 'saida')),
  valor_centavos   integer not null check (valor_centavos > 0),
  descricao        text not null,
  forma_pagamento  text null,
  data             date not null,
  created_at       timestamptz not null default now()
);

-- RLS (Row Level Security) ainda NÃO está habilitado.
-- Por enquanto só o servidor acessa esta tabela, usando a service role key,
-- que ignora RLS de qualquer forma. Antes de deixar o navegador (anon key)
-- ler ou gravar aqui, é preciso:
--   1. adicionar uma coluna de dono (ex.: user_id uuid references auth.users);
--   2. alter table public.lancamentos enable row level security;
--   3. criar policies do tipo "user_id = auth.uid()" para select/insert/update/delete.
-- Sem isso, qualquer pessoa com a anon key (que é pública) veria os dados de todos.
