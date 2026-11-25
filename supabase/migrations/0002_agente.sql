-- 0002_agente: natureza, pessoa e desfazer (soft delete) para o agente com ferramentas.
--
-- Decisões:
--   * natureza diz O QUE é o lançamento; tipo continua dizendo se entra ou sai.
--     venda/recebimento_fiado/aporte são "entrada"; despesa/retirada_pessoal são "saida"
--     (a aplicação valida a combinação, e o check abaixo garante no banco);
--   * pessoa: cliente do fiado / do recebimento (texto livre, casado na aplicação);
--   * anulado_em: desfazer NUNCA apaga a linha, só marca. Consultas ignoram anulados.

alter table public.lancamentos
  add column if not exists natureza text not null default 'venda'
    check (natureza in ('venda', 'despesa', 'recebimento_fiado', 'aporte', 'retirada_pessoal')),
  add column if not exists pessoa text null,
  add column if not exists anulado_em timestamptz null;

-- Backfill: o que já existe vira venda (entrada) ou despesa (saída).
update public.lancamentos set natureza = 'venda'   where tipo = 'entrada';
update public.lancamentos set natureza = 'despesa' where tipo = 'saida';

-- Natureza e tipo precisam concordar.
alter table public.lancamentos
  add constraint lancamentos_natureza_tipo_check check (
    (natureza in ('venda', 'recebimento_fiado', 'aporte') and tipo = 'entrada')
    or (natureza in ('despesa', 'retirada_pessoal') and tipo = 'saida')
  );

-- Consultas mais comuns: por data e o "a receber" (fiados e recebimentos), sempre sem anulados.
create index if not exists lancamentos_data_ativos_idx
  on public.lancamentos (data) where anulado_em is null;
create index if not exists lancamentos_a_receber_idx
  on public.lancamentos (natureza) where anulado_em is null
    and (natureza = 'recebimento_fiado' or forma_pagamento = 'fiado');
