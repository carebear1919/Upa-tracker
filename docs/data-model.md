# Data Model

Postgres tables in Supabase — schema lives in `supabase/migrations/0001_init.sql`.
`frontend/src/lib/store.js` maps between these snake_case columns and the
camelCase objects every screen actually works with, so screens never touch
Supabase directly:

```
settings   { user_id, pin_hash, business_name, currency, opening_balance, reminder_template }

tenants    { id, user_id, name, property, unit, phone, messenger_link,
             messenger_psid, monthly_rent, due_day, property_type, photo }

payments   { id, user_id, tenant_id, amount, date_paid, month_covered }

expenses   { id, user_id, description, category, amount, date }

reminders  { id, user_id, tenant_id, channel, sent_at, month }
```

Every table is scoped by Row Level Security to `user_id = auth.uid()`. There
are no user-facing accounts — each browser install signs in anonymously
(`frontend/src/lib/supabase.js`) purely so RLS has something to scope to; the
PIN lock is a separate, client-side layer on top of this.

If `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` aren't set, the app falls
back to storing the same shape in `localStorage` instead — see
`isSupabaseConfigured` in `lib/store.js`.

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
