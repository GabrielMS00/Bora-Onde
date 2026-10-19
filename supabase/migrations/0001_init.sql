-- Bora Onde — schema inicial. Idempotente: pode ser colada inteira no SQL Editor do Supabase mais de uma vez.
-- Papéis: Usuário Padrão (public.users) e Estabelecimento (public.establishments). O papel é gravado em
-- auth.users.raw_user_meta_data->>'role' no cadastro; o trigger abaixo cria a linha do perfil na mesma transação.

-- ───────────────────────────── tipos ─────────────────────────────
do $$ begin create type public.place_type as enum ('restaurant', 'cafe', 'bar');
exception when duplicate_object then null; end $$;

do $$ begin create type public.vibe as enum ('family', 'friends', 'romantic');
exception when duplicate_object then null; end $$;

-- ───────────────────────────── tabelas ─────────────────────────────
create table if not exists public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 3 and 120),
  age        int  not null check (age between 18 and 120),
  gender     text not null check (gender in ('F', 'M', 'O')),
  city       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.establishments (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid unique references auth.users (id) on delete cascade, -- NULL = lugar que existe só no seed
  name         text not null check (char_length(name) between 2 and 120),
  photos       text[] not null default '{}' check (cardinality(photos) <= 10), -- paths no bucket; [1] = capa
  cep          text not null check (cep ~ '^[0-9]{8}$'),
  city         text not null,
  neighborhood text not null,
  street       text not null,
  number       text not null,
  created_at   timestamptz not null default now()
);
create index if not exists establishments_city_idx on public.establishments (city);

-- Dados Extras: alimentam o motor de indicação.
create table if not exists public.establishment_metadata (
  establishment_id uuid primary key references public.establishments (id) on delete cascade,
  type             public.place_type,
  vibes            public.vibe[] not null default '{}',
  sells_alcohol    boolean
);

-- ───────────────────────────── cadastro: cria o perfil ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  if meta ->> 'role' = 'user' then
    insert into public.users (id, name, age, gender, city)
    values (new.id, meta ->> 'name', (meta ->> 'age')::int, meta ->> 'gender', meta ->> 'city');
  elsif meta ->> 'role' = 'establishment' then
    insert into public.establishments (owner_id, name, cep, city, neighborhood, street, number)
    values (new.id, meta ->> 'name', meta ->> 'cep', meta ->> 'city',
            meta ->> 'neighborhood', meta ->> 'street', meta ->> 'number');
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────── Row Level Security ─────────────────────────────
alter table public.users                  enable row level security;
alter table public.establishments         enable row level security;
alter table public.establishment_metadata enable row level security;

revoke all on public.users, public.establishments, public.establishment_metadata from anon;

-- users: cada um só enxerga e altera a própria linha; só a cidade é editável (dados pessoais são somente leitura).
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

revoke update on public.users from authenticated;
grant update (city) on public.users to authenticated;
revoke insert, delete on public.users from authenticated; -- criação via trigger; exclusão via delete_my_account()

-- establishments: o feed é visível a qualquer conta logada; só o dono escreve.
drop policy if exists establishments_select_all on public.establishments;
create policy establishments_select_all on public.establishments for select to authenticated
  using (true);

drop policy if exists establishments_update_own on public.establishments;
create policy establishments_update_own on public.establishments for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

revoke insert, delete on public.establishments from authenticated; -- criação via trigger; exclusão via RPC
revoke update on public.establishments from authenticated;
grant update (name, photos, cep, city, neighborhood, street, number) on public.establishments to authenticated;

-- establishment_metadata: leitura geral; escrita só do dono do estabelecimento.
drop policy if exists metadata_select_all on public.establishment_metadata;
create policy metadata_select_all on public.establishment_metadata for select to authenticated
  using (true);

drop policy if exists metadata_insert_own on public.establishment_metadata;
create policy metadata_insert_own on public.establishment_metadata for insert to authenticated
  with check (exists (
    select 1 from public.establishments e
    where e.id = establishment_id and e.owner_id = (select auth.uid())));

drop policy if exists metadata_update_own on public.establishment_metadata;
create policy metadata_update_own on public.establishment_metadata for update to authenticated
  using (exists (
    select 1 from public.establishments e
    where e.id = establishment_id and e.owner_id = (select auth.uid())))
  with check (exists (
    select 1 from public.establishments e
    where e.id = establishment_id and e.owner_id = (select auth.uid())));

-- ───────────────────────────── excluir a própria conta ─────────────────────────────
-- O cliente não pode apagar auth.users; a função (security definer) apaga a conta de quem chama e o
-- `on delete cascade` limpa o perfil/lugar. As fotos no Storage são removidas pelo app antes da chamada.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = (select auth.uid());
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ───────────────────────────── Storage: fotos dos lugares ─────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('place-photos', 'place-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública das imagens vai pela URL do bucket público. Escrita: só dentro da pasta do próprio uid.
-- (As fotos de seed ficam em seed/…, enviadas com a secret key, que ignora estas policies.)
drop policy if exists place_photos_select on storage.objects;
create policy place_photos_select on storage.objects for select to authenticated
  using (bucket_id = 'place-photos');

drop policy if exists place_photos_insert_own on storage.objects;
create policy place_photos_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'place-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists place_photos_update_own on storage.objects;
create policy place_photos_update_own on storage.objects for update to authenticated
  using (bucket_id = 'place-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'place-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists place_photos_delete_own on storage.objects;
create policy place_photos_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'place-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
