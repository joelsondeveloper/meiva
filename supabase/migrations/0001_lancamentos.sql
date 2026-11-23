-- 0001_lancamentos: tabela de lançamentos de caixa do MEI.
--
-- Decisões:
--   * valores em centavos (inteiro) para evitar erro de ponto flutuante;
--   * "data" sem valor padrão: o app sempre envia a data (o current_date do banco
--     usa UTC e à noite, no Brasil, cairia no dia seguinte);
--   * forma_pagamento = 'fiado' NÃO entra no saldo do caixa (regra da aplicação).

create table if not exists public.lancamentos (
  id               uuid primary key default gen_random_uuid(),
  tipo             text not null check (tipo in ('entrada', 'saida')),
  valor_centavos   integer not null check (valor_centavos > 0),
  descricao        text not null,
  forma_pagamento  text check (
    forma_pagamento in ('pix', 'dinheiro', 'cartao', 'fiado', 'outro')
  ),
  data             date not null,
  created_at       timestamptz not null default now()
);

-- RLS ligado e sem policies: o navegador (anon key, pública) não acessa nada.
-- Só o servidor acessa, usando a service role key (secret), que ignora RLS.
alter table public.lancamentos enable row level security;

-- Com o auto-grant da Data API desligado, é preciso conceder acesso explicitamente.
grant select, insert, update, delete
  on table public.lancamentos to service_role;

-- Semana 3 (login): adicionar user_id uuid references auth.users e policies
-- do tipo "user_id = auth.uid()" numa migration nova (0002).
