-- Renta schema — run this once in the Supabase SQL Editor (or via `supabase db push`).
-- Every table is scoped to auth.uid() via Row Level Security, so each browser
-- install (using anonymous auth — see frontend/src/lib/supabase.js) only ever
-- sees its own family's data. There are no user-facing accounts; the PIN
-- lock is a separate, client-side layer on top of this.

create extension if not exists pgcrypto;

-- One row per install, keyed by auth.uid(). Holds the hashed PIN, currency,
-- opening balance, and the reminder message template.
create table if not exists settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text not null default '',
  business_name text not null default 'Renta',
  currency text not null default 'PHP',
  opening_balance numeric not null default 0,
  reminder_template text not null default 'Hi {name}, this is a reminder that your rent of {amount} is due on day {due_day}. Thank you!',
  updated_at timestamptz not null default now()
);

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  property text not null,
  unit text not null default '',
  phone text not null default '',
  messenger_link text not null default '',
  monthly_rent numeric not null default 0,
  due_day int not null default 1,
  property_type text not null default 'Housing',
  photo text,
  -- Facebook Page-Scoped ID, captured once a tenant opts in via the family
  -- Page's Messenger link. Null until that opt-in flow exists — until then
  -- automated Messenger sends are skipped and the tenant just needs SMS or
  -- manual follow-up (see supabase/functions/check-due-dates).
  messenger_psid text,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  amount numeric not null,
  date_paid date not null,
  month_covered text not null,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  description text not null,
  category text not null,
  amount numeric not null,
  date date not null,
  created_at timestamptz not null default now()
);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  channel text not null,
  sent_at timestamptz not null default now(),
  month text not null
);

create index if not exists payments_tenant_idx on payments(tenant_id);
create index if not exists payments_month_idx on payments(month_covered);
create index if not exists expenses_date_idx on expenses(date);
create index if not exists reminders_tenant_month_idx on reminders(tenant_id, month);

alter table settings enable row level security;
alter table tenants enable row level security;
alter table payments enable row level security;
alter table expenses enable row level security;
alter table reminders enable row level security;

create policy "own settings" on settings for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own tenants" on tenants for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own payments" on payments for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own expenses" on expenses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own reminders" on reminders for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Realtime — lets multiple tabs/devices signed into the same anonymous
-- session stay in sync without polling.
alter publication supabase_realtime add table settings, tenants, payments, expenses, reminders;
