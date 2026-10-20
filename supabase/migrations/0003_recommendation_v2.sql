-- Bora Onde — indicação mais precisa: especialidade (tipo de comida/bar/café), mais opções de companhia e clima.
-- Idempotente: pode ser colada no SQL Editor mais de uma vez. Rode depois da 0001 e da 0002.

-- Companhia: a coluna continua sendo `vibes`; os valores antigos (family, friends, romantic) seguem válidos.
alter type public.vibe add value if not exists 'solo';
alter type public.vibe add value if not exists 'work';
alter type public.vibe add value if not exists 'group';

do $$ begin
  create type public.specialty as enum (
    'brazilian', 'italian', 'japanese', 'mexican', 'arab', 'burger', -- restaurante
    'pub', 'brewery', 'cocktails', 'wine',                           -- bar
    'specialty_coffee', 'bakery', 'sweets'                           -- cafeteria
  );
exception when duplicate_object then null; end $$;

do $$ begin create type public.atmosphere as enum ('calm', 'lively', 'outdoor');
exception when duplicate_object then null; end $$;

alter table public.establishment_metadata
  add column if not exists specialties public.specialty[]  not null default '{}',
  add column if not exists atmospheres public.atmosphere[] not null default '{}';

-- O app limita a 2 especialidades; o banco garante o mesmo.
do $$ begin
  alter table public.establishment_metadata
    add constraint establishment_metadata_specialties_max check (cardinality(specialties) <= 2);
exception when duplicate_object then null; end $$;
