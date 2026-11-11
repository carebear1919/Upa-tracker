-- Payment method on every payment (Cash / GCash / Check), a withdrawals log
-- for money the owner takes out, and transfers for moving money between
-- Cash / GCash / Check. Run once in the Supabase SQL Editor.
--
-- Purely additive: nothing is dropped or rewritten. Existing payments simply
-- get method = 'Cash' by default.

alter table payments add column if not exists method text not null default 'Cash';

create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  note text not null default '',
  amount numeric not null check (amount >= 0),
  date date not null,
  -- Which pot the money came out of: Cash, GCash or Check.
  method text not null default 'Cash',
  created_at timestamptz not null default now()
);

create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  from_method text not null,
  to_method text not null,
  amount numeric not null check (amount > 0),
  date date not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  check (from_method <> to_method)
);

create index if not exists withdrawals_user_date_idx on withdrawals(user_id, date);
create index if not exists transfers_user_date_idx on transfers(user_id, date);

alter table withdrawals enable row level security;
alter table transfers enable row level security;

create policy "own withdrawals" on withdrawals for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own transfers" on transfers for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter publication supabase_realtime add table withdrawals, transfers;
