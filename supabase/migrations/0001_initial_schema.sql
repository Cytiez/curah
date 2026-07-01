-- Curah: initial schema draft (Phase 2 reference — not yet applied/wired).
-- Mirrors src/features/mood/types.ts. Run via `supabase db push` once a
-- project is linked; RLS policies live in 0002_rls_policies.sql.

create extension if not exists "pgcrypto";

create type mood_type as enum ('senang', 'tenang', 'netral', 'sedih', 'marah', 'cemas');
create type log_visibility as enum ('private', 'shared');
create type friendship_status as enum ('pending', 'accepted');

-- One row per auth user. display_name/avatar are shown in the Feed and
-- Circle management screens.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- A single check-in. `visibility` defaults to private per the anti-dark-
-- pattern principle: never default to broadcasting.
create table mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  mood mood_type not null,
  visibility log_visibility not null default 'private',
  created_at timestamptz not null default now()
);

create index mood_logs_user_created_idx on mood_logs (user_id, created_at desc);
create index mood_logs_shared_created_idx on mood_logs (created_at desc) where visibility = 'shared';

-- Mutual-add circle membership. A single row per pair: the requester
-- proposes, the addressee accepts. The app must check both directions
-- before inserting a new request — this table does not enforce a
-- canonical (a, b) ordering, only that a given ordered pair is unique.
create table friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles (id) on delete cascade,
  addressee_id uuid not null references profiles (id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint friendships_no_self check (requester_id <> addressee_id),
  constraint friendships_unique_pair unique (requester_id, addressee_id)
);

create index friendships_addressee_idx on friendships (addressee_id, status);

-- Enforces the "X of 10" circle cap at the database layer as a backstop
-- to whatever the client already checks before showing the invite flow.
create function enforce_circle_cap() returns trigger as $$
declare
  requester_count int;
  addressee_count int;
begin
  if new.status <> 'accepted' then
    return new;
  end if;

  select count(*) into requester_count
  from friendships
  where status = 'accepted'
    and (requester_id = new.requester_id or addressee_id = new.requester_id);

  select count(*) into addressee_count
  from friendships
  where status = 'accepted'
    and (requester_id = new.addressee_id or addressee_id = new.addressee_id);

  if requester_count >= 10 or addressee_count >= 10 then
    raise exception 'Circle is capped at 10 members';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger friendships_enforce_cap
  before insert or update on friendships
  for each row execute function enforce_circle_cap();
