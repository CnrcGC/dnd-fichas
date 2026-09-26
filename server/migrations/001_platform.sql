create extension if not exists pgcrypto;

create table system_catalog (
  id text primary key,
  display_name text not null
);

insert into system_catalog (id, display_name) values
  ('dnd5e', 'D&D 5e'),
  ('yusong', 'Yusong'),
  ('feiticeiros-maldicoes', 'Feiticeiros & Maldições')
on conflict (id) do update set display_name = excluded.display_name;

create table characters (
  id uuid not null,
  owner_id text not null references "user"(id) on delete cascade,
  system_id text not null references system_catalog(id),
  schema_version integer not null check (schema_version > 0),
  display_name text not null check (length(trim(display_name)) > 0),
  summary_metadata jsonb not null default '{}'::jsonb,
  system_data jsonb not null,
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (owner_id, id)
);
create index characters_owner_updated_idx on characters (owner_id, updated_at, id);
create index characters_owner_system_idx on characters (owner_id, system_id) where deleted_at is null;

create table preferences (
  owner_id text primary key references "user"(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table media_objects (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references "user"(id) on delete cascade,
  character_id uuid,
  storage_key text not null unique,
  mime_type text not null,
  bytes integer not null check (bytes > 0),
  checksum text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (owner_id, character_id) references characters(owner_id, id) on delete restrict
);

create table creatures (
  id uuid not null,
  owner_id text not null references "user"(id) on delete cascade,
  system_id text not null references system_catalog(id),
  schema_version integer not null check (schema_version > 0),
  name text not null,
  summary_metadata jsonb not null default '{}'::jsonb,
  system_data jsonb not null,
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (owner_id, id)
);

create table encounters (
  id uuid not null,
  owner_id text not null references "user"(id) on delete cascade,
  system_id text not null references system_catalog(id),
  name text not null,
  round integer not null default 1 check (round >= 1),
  state jsonb not null default '{}'::jsonb,
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (owner_id, id)
);

create table encounter_participants (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  encounter_id uuid not null,
  source_type text,
  source_id uuid,
  snapshot jsonb not null,
  position integer not null check (position >= 0),
  resources jsonb not null default '{}'::jsonb,
  conditions jsonb not null default '{}'::jsonb,
  foreign key (owner_id, encounter_id) references encounters(owner_id, id) on delete cascade,
  unique (owner_id, encounter_id, position)
);

create table applied_operations (
  owner_id text not null references "user"(id) on delete cascade,
  operation_id uuid not null,
  resource_type text not null,
  resource_id uuid,
  status_code integer not null,
  response_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (owner_id, operation_id)
);

create table audit_events (
  id bigint generated always as identity primary key,
  actor_id text references "user"(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  request_id text,
  outcome text not null,
  created_at timestamptz not null default now()
);

create table imports (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references "user"(id) on delete cascade,
  source_system text not null references system_catalog(id),
  source_schema_version integer,
  migration_version text not null,
  content_checksum text not null,
  imported_at timestamptz not null default now()
);

