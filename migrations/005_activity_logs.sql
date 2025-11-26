-- Activity Logs table and basic triggers

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null,
  target_type text not null,
  target_id uuid,
  timestamp timestamptz not null default now()
);

alter table public.activity_logs enable row level security;

-- RLS: users can read their own logs; admins can read all (assuming a role mapping view)
create policy activity_logs_user_read on public.activity_logs
  for select using (auth.uid() = user_id);

-- NOTE: Admin-wide read should be granted via a role-bound edge function or
-- a secure API route using the service role key; avoid broad policies.

-- Helper function to insert an activity log
create or replace function public.log_activity(
  p_user_id uuid,
  p_action text,
  p_target_type text,
  p_target_id uuid
) returns void language plpgsql as $$
begin
  insert into public.activity_logs (user_id, action, target_type, target_id)
  values (p_user_id, p_action, p_target_type, p_target_id);
end;
$$;

-- Example triggers: activities
create or replace function public.tg_log_activity_insert() returns trigger language plpgsql as $$
begin
  perform public.log_activity(auth.uid(), 'create', 'activities', new.id);
  return new;
end;
$$;

drop trigger if exists activities_log_insert on public.activities;
create trigger activities_log_insert
  after insert on public.activities
  for each row execute function public.tg_log_activity_insert();

-- Example triggers: attendance
drop trigger if exists attendance_log_insert on public.attendance;
create trigger attendance_log_insert
  after insert on public.attendance
  for each row execute function public.tg_log_activity_insert();

-- Example triggers: messages
drop trigger if exists messages_log_insert on public.messages;
create trigger messages_log_insert
  after insert on public.messages
  for each row execute function public.tg_log_activity_insert();
