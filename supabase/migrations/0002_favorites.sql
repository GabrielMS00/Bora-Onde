-- Bora Onde — lugares salvos (favoritos) do Usuário Padrão. Idempotente: pode ser colada no SQL Editor mais de uma vez.
-- A FK para public.users garante que só contas de Usuário Padrão salvam lugares (estabelecimentos não têm linha ali).

create table if not exists public.favorites (
  user_id          uuid not null references public.users (id) on delete cascade,
  establishment_id uuid not null references public.establishments (id) on delete cascade,
  created_at       timestamptz not null default now(),
  primary key (user_id, establishment_id)
);
create index if not exists favorites_user_created_idx on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

revoke all on public.favorites from anon;
revoke update on public.favorites from authenticated; -- salvar = inserir; remover = apagar

-- Cada usuário só enxerga, cria e apaga os próprios salvos.
drop policy if exists favorites_select_own on public.favorites;
create policy favorites_select_own on public.favorites for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists favorites_insert_own on public.favorites;
create policy favorites_insert_own on public.favorites for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists favorites_delete_own on public.favorites;
create policy favorites_delete_own on public.favorites for delete to authenticated
  using (user_id = (select auth.uid()));
