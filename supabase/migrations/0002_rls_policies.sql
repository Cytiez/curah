-- Curah: Row Level Security draft (Phase 2 reference — not yet applied).
-- This is the sensitive-data boundary called out in the project brief:
-- mood_logs visibility and circle membership must never leak beyond what
-- the UI intends, regardless of client bugs.

alter table profiles enable row level security;
alter table mood_logs enable row level security;
alter table friendships enable row level security;

-- Reusable check so the mood_logs/profiles policies don't repeat this
-- subquery. security definer + a fixed search_path so it can't be
-- hijacked by a same-named function on the caller's search path.
create function is_accepted_friend(a uuid, b uuid) returns boolean as $$
  select exists (
    select 1 from friendships
    where status = 'accepted'
      and ((requester_id = a and addressee_id = b)
        or (requester_id = b and addressee_id = a))
  );
$$ language sql stable security definer set search_path = public;

-- profiles: visible to yourself and accepted friends only (no open
-- enumeration of every user on the platform).
create policy profiles_select on profiles
  for select using (
    id = auth.uid() or is_accepted_friend(auth.uid(), id)
  );

create policy profiles_insert_self on profiles
  for insert with check (id = auth.uid());

create policy profiles_update_self on profiles
  for update using (id = auth.uid());

-- mood_logs: own rows always visible; other users' rows only when shared
-- AND the viewer is an accepted friend. Writes are always self-only.
create policy mood_logs_select on mood_logs
  for select using (
    user_id = auth.uid()
    or (visibility = 'shared' and is_accepted_friend(auth.uid(), user_id))
  );

create policy mood_logs_insert_self on mood_logs
  for insert with check (user_id = auth.uid());

create policy mood_logs_update_self on mood_logs
  for update using (user_id = auth.uid());

create policy mood_logs_delete_self on mood_logs
  for delete using (user_id = auth.uid());

-- friendships: only the two parties involved can see or change a row.
create policy friendships_select on friendships
  for select using (auth.uid() in (requester_id, addressee_id));

create policy friendships_insert_as_requester on friendships
  for insert with check (requester_id = auth.uid());

create policy friendships_update_participant on friendships
  for update using (auth.uid() in (requester_id, addressee_id));

create policy friendships_delete_participant on friendships
  for delete using (auth.uid() in (requester_id, addressee_id));
