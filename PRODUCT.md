# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: the builder's mother, a non-technical landlord in the Philippines who runs a small family rental business (a few housing and business units). She tracks rent in pesos (₱), mostly on her phone, and needs to tell at a glance who has paid, who is behind, and how much money is left. The builder (her child) is the admin who sets things up and fixes issues. Other small landlords and family members are secondary, not the design target.

## Product Purpose

Renta replaces manual notebook/spreadsheet tracking of rent. It records rent collected (including partial payments), expenses, money withdrawn, and where the money sits (Cash, GCash, Check), and produces monthly PDF/Excel reports. Success: the primary user can run her whole month without help, trusts the numbers, and never loses data.

## Positioning

Plain-language rent tracking built for a non-technical landlord: it never assumes (a reminder is only logged after she confirms she actually sent it), shows full transparency on who is paid/partial/unpaid, tracks money per payment method, locks behind a PIN, and works offline as an installable app. Same account on every device shows the same data.

## Operating Context

Used on a phone and sometimes a laptop, by one household. Tenants pay by cash, GCash, or check. Reminders go out by SMS or Messenger in Taglish wording. Monthly reports are exported as PDF (portrait or landscape) or Excel for records. Data lives in Supabase (email/password account plus a local PIN lock asked on every open); the app is deployed to Netlify and Vercel.

## Capabilities and Constraints

- Screens: Dashboard, Tenants, Tenant detail, Payments, Log Payment, Add Expense, Withdraw, Move Money, Reports, Reminders, Settings, plus Login, PIN lock, and a replayable onboarding tour.
- Money in ₱; amounts accept cents. Payments record method (Cash/GCash/Check); withdrawals and moves relocate or remove money without deleting history.
- Must keep working offline (PWA, self-hosted SVG icons, no external fonts or icon libraries, no charting library).
- Stack is fixed: React, Vite, Tailwind CSS v4, Supabase.
- Never remove or rewrite existing user data; database changes are additive.

## Brand Commitments

Product name "Renta". Currency ₱. Reminder wording stays Taglish. No other binding brand rules; the current look is the incumbent, not a mandate.

## Evidence on Hand

Real usage by one family only. No testimonials, customer logos, benchmarks, or pricing exist; future work must not invent them.

## Product Principles

1. Never assume: confirm before recording something the app cannot observe.
2. Plain language and obvious next steps beat cleverness; the user is non-technical.
3. Show every number's source so totals can be checked (per-method balances, totals rows, status per tenant).
4. Protect data first: additive changes, no silent loss, visible failures.
5. Works the same on every device and offline.
