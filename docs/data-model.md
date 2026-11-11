# Data Model

Postgres tables in Supabase. The schema is built up by the migrations in
`supabase/migrations/` (run them in order in the SQL Editor; all are additive
and `0004` is safe to re-run):

| Migration | Adds |
|---|---|
| `0001_init.sql` | settings, tenants, payments, expenses, reminders, RLS |
| `0002_schedule_reminders.sql` | pg_cron job for the daily reminder sweep |
| `0003_tagalog_reminder_default.sql` | resets old reminder wording to the Taglish default |
| `0004_withdrawals_and_payment_method.sql` | `payments.method`, `withdrawals`, `transfers` |

`frontend/src/lib/store.js` maps between these snake_case columns and the
camelCase objects every screen actually works with, so screens never touch
Supabase directly:

```
settings     { user_id, pin_hash, business_name, currency, opening_balance, reminder_template }

tenants      { id, user_id, name, property, unit, phone, messenger_link,
               messenger_psid, monthly_rent, due_day, property_type, photo }

payments     { id, user_id, tenant_id, amount, date_paid, month_covered,
               method }                       -- 'Cash' | 'GCash' | 'Check'

expenses     { id, user_id, description, category, amount, date }

withdrawals  { id, user_id, note, amount, date, method }
                                              -- money the owner takes out of one place

transfers    { id, user_id, from_method, to_method, amount, date, note }
                                              -- money moved between places (from <> to)

reminders    { id, user_id, tenant_id, channel, sent_at, month }
```

Every table is scoped by Row Level Security to `user_id = auth.uid()`. Users
sign in with an email and password (`frontend/src/lib/supabase.js`); the PIN
lock is a separate, client-side layer on top — `settings.pin_hash` holds a
SHA-256 hash of it, checked on every app open (`frontend/src/lib/pin.js`).
Deleting a user or a tenant cascades to the rows that belong to them.

If `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` aren't set, the app falls
back to storing the same shape in `localStorage` instead — see
`isSupabaseConfigured` in `lib/store.js`.

## Where the money is

Money is tracked in three places: **Cash, GCash and Check** (`PAYMENT_METHODS`
in `lib/store.js`). Nothing is ever deleted to move money around — every change
is its own row:

- A payment adds to the place named in `payments.method` (older rows default to
  `Cash`).
- A withdrawal subtracts from the place named in `withdrawals.method`.
- A transfer subtracts from `from_method` and adds to `to_method`, so the total
  never changes.
- `settings.opening_balance` and expenses are not tied to any place. They make
  up a separate "not tied to a place" amount, so the three places plus that
  amount always equal Money Left.

The maths lives in three functions in `lib/store.js`, shared by the Dashboard,
Move Money and Reports so every screen and export agrees:

- `balanceThroughMonth()` / `startingBalance()` — total money carried into or
  through a month (opening balance + rent − expenses − withdrawals).
- `balancesByMethod()` — `{ pots: { Cash, GCash, Check }, unassigned }`.
- `moneyByPlace()` — one row per place for a month: start + rent in ± moved −
  taken out = end, with a total row. Behind the report's "Where the Money Is"
  table in the screen, the PDF and the Excel export.

## Notes on specific columns

`phone` and `messenger_link` are both optional and independent — a tenant
can have either, both, or neither. Reminders show a button for each channel
that's on file (Messenger and/or Text); with neither, the tenant is flagged
for manual follow-up. `messenger_link` accepts a bare username, an `m.me`
link, or a full Facebook profile URL (see `lib/messageLinks.js`).
`messenger_psid` is separate — it's only populated once a tenant opts in via
the family Facebook Page (needed for the automated daily reminder sweep in
`supabase/functions/check-due-dates`; that opt-in webhook doesn't exist yet).

`photo` is a resized data URL of the rental property/unit (not the tenant),
shown across the Tenants list, Dashboard, Reminders, and the tenant detail
page.

`month_covered` on a payment is `YYYY-MM`; a tenant counts as paid for a
month when their payments for that `month_covered` sum to at least their
`monthly_rent` (partial payments are supported — see `paymentStatus()`).

## Writes and failures

Screens update the in-memory store first (so the UI is instant) and write to
Supabase in the background. If a write fails, `lib/store.js` raises a visible
"couldn't save" notice with a Try again button (`lib/notice.js`,
`components/Notices.jsx`) instead of failing silently. Retrying an insert that
already went through is treated as success (Postgres error `23505`).
