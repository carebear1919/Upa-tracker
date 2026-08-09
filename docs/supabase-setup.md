# Supabase Setup

Follow steps 1-4 to get the app running on real data. Step 5 is optional
(automated reminders) — do that later if at all.

## Step 1: Run the schema

1. Open your project at **supabase.com/dashboard**.
2. In the left sidebar, click the **SQL Editor** icon (looks like `</>`).
3. Click **+ New query** (top left).
4. Open the file `supabase/migrations/0001_init.sql` in this project, select
   all its text, copy it.
5. Paste into the SQL Editor box, then click **Run** (bottom right, or
   Ctrl+Enter).
6. You should see "Success. No rows returned." That means the tables were
   created.

## Step 2: Turn on anonymous sign-ins

The app has no login screen — it uses a PIN instead. But it still needs
*some* way to identify "this install's data" to the database, invisibly.
That's what this step enables.

1. Left sidebar → **Authentication** icon (looks like a person outline).
2. Along the top of that page, click the **Sign In / Providers** tab.
3. Scroll down to find **Anonymous Sign-Ins**.
4. Toggle it **on**.

## Step 3: Get your API keys

1. Left sidebar → **Project Settings** (gear icon, near the bottom).
2. Click **Data API** in the settings submenu (older dashboards call this
   just **API**).
3. You'll see a **Project URL** — copy it.
4. On the same page, find **Project API keys** → copy the key labeled
   **anon** / **public** (NOT the "service_role" one — that one's secret and
   this app never needs it).

## Step 4: Paste them into the app

1. Open the file `frontend/.env` in this project (already created for you).
2. It looks like this:
   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```
3. Paste your Project URL after the first `=`, and your anon key after the
   second `=`. No quotes, no spaces. Save the file.
4. Restart the dev server (stop it with Ctrl+C in the terminal, run
   `npm run dev` again inside `frontend/`).

That's it — the app now talks to Supabase instead of just the browser.

---

## Step 5 (optional, later): Automated daily reminders

Skip this unless you specifically want SMS/Messenger reminders to send
themselves on a schedule. The in-app "tap to send, then confirm" flow on the
Reminders page works fine without any of this.

This step needs the [Supabase CLI](https://supabase.com/docs/guides/cli)
installed on your computer (a terminal tool, not a webpage) — ask me when
you're ready and I'll walk you through installing and running it.
