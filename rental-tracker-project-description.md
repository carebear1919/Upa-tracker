# Renta — Project Description

## 1. Overview

**Renta** is a simple, installable app for tracking rental/leasing income and the household expenses it funds — primarily medicine and related costs. It's built for a non-technical user, works on both a phone and a laptop, and needs no accounts or complicated setup.

| | |
|---|---|
| **Name** | Renta |
| **Primary user** | One family member, non-technical, prefers very simple interfaces |
| **Devices** | Android phone + laptop (Windows/Mac) |
| **Core purpose** | Track rent collected, track expenses paid from that income, remind tenants when rent is due — automatically where possible, at no ongoing cost |
| **Tone** | Calm, plain-language, "budgeting app for a parent" — not a technical dashboard |

---

## 2. Core Features

### 2.1 Dashboard (home screen)
- This month's total rent collected vs. expected
- This month's total expenses
- Net balance (money left over)
- Quick list of tenants who haven't paid yet this month
- One-glance summary — no digging required

### 2.2 Tenants / Properties
- List of tenants: name, property/unit, monthly rent, due day
- Add / edit / remove a tenant
- Tap a tenant to see their full payment history
- Reminder settings per tenant: phone number, Messenger opt-in status, preferred channel

### 2.3 Payments
- Log a payment: pick tenant → amount → date → done
- Automatically marks that tenant "paid" for the month
- Filterable history (by month, by tenant)

### 2.4 Expenses
- Log an expense: description → category (Medicine, Repairs, Other) → amount → date
- Running totals per category, with "Medicine & Health" highlighted since that's the main purpose of the fund

### 2.5 Monthly Report
- Auto-generated summary: rent collected, expenses, net balance for the month
- Viewable in-app, exportable as PDF/image for saving or sharing
- Generated entirely on the device — no backend needed for this part

### 2.6 Due Date Reminders
- In-app alert + push notification a few days before a tenant's rent is due
- Automatically sent to tenants via free channels (see Section 5)

### 2.7 PIN Lock
- 4–6 digit PIN required to open the app
- Stored hashed on-device, checked before any data is shown
- Works without internet

---

## 3. Branding

- **Name:** Renta
- **Feel:** warm, calm, trustworthy — closer to a simple budgeting app than a property-management tool
- **Suggested accent colors:** one warm tone for income/paid (e.g. soft green), one for expenses/unpaid or overdue (e.g. coral/red), on a light, airy background — used consistently so meaning is recognizable by color alone
- **Icon direction:** a simple house or coin motif, rounded and friendly rather than corporate
- **Voice:** plain everyday words in every label and message — "Paid," "Not paid yet," "Add a payment" — never technical terms like "sync," "record," or "transaction"

---

## 4. Technical Architecture

### 4.1 Type of app
A **Progressive Web App (PWA)** — installs like a real app on both platforms without needing an app store:
- **Phone:** "Add to Home Screen" → full-screen app icon, no browser bar, works offline
- **Laptop:** Chrome/Edge "Install app" → opens in its own window

One codebase, one set of data, synced automatically across both devices.

### 4.2 Stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite (PWA) | Installable, offline-capable, works identically on phone/laptop |
| Backend | Firebase Cloud Functions | No server to maintain, low cost, scheduled jobs built in |
| Database | Firestore | Realtime sync between devices, generous free tier |
| Scheduling | Cloud Scheduler | Triggers the daily reminder check automatically |
| Reports/export | Client-side (e.g. jsPDF) | No backend needed, works offline |

### 4.3 Data model (Firestore collections)

```
tenants/
  { id, name, phone, fbMessengerOptedIn, property, unit,
    monthlyRent, dueDay, notificationChannel }

payments/
  { id, tenantId, amount, datePaid, monthCovered }

expenses/
  { id, description, category, amount, date }

settings/
  { pinHash, businessName, currency }
```

### 4.4 Project layout

```
renta/
├── frontend/                    # React + Vite PWA
│   ├── public/
│   │   ├── manifest.json        # makes it installable, holds app name/icon "Renta"
│   │   └── icons/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tenants.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Reminders.jsx
│   │   │   └── PinLock.jsx
│   │   ├── components/
│   │   ├── lib/
│   │   │   ├── firebase.js
│   │   │   └── messageLinks.js  # builds sms: and m.me fallback links
│   │   └── App.jsx
│   └── service-worker.js        # offline support
│
├── backend/                      # Firebase project
│   ├── functions/
│   │   ├── checkDueDates.js      # daily scheduled reminder check
│   │   ├── sendSmsViaGateway.js  # relays to the SMS Gateway Android app
│   │   ├── sendMessenger.js      # sends via Messenger recurring notifications
│   │   └── index.js
│   ├── firestore.rules
│   └── firebase.json
│
└── docs/
    ├── data-model.md
    └── ui-design-prompt.md       # Google Stitch prompt (Section 8)
```

---

## 5. Tenant Reminder System

### 5.1 Goal
Automatically remind tenants their rent is due, at no ongoing per-message cost.

### 5.2 Cloud Functions Scheduler (the core logic)
Runs once daily (e.g. 8:00 AM) via Cloud Scheduler:

1. Reads every tenant's `dueDay` and `monthlyRent` from Firestore
2. Compares today's date to each due day:
   - 3 days before → "upcoming" reminder
   - On due day → "due today" reminder
   - Past due & unpaid → "overdue" reminder (optional)
3. Cross-checks the `payments` collection — skips anyone already paid this month
4. For everyone still owing, picks a channel and sends the reminder
5. Logs what was sent, so the app can show "reminders sent today"

A single daily check (rather than a timer per tenant) keeps the logic simple and self-correcting if due dates or tenants change.

### 5.3 Reminder channels (in priority order)

**1. Facebook Messenger — recurring notifications (free, automatic)**
- One-time setup: family gets a Facebook Page; each tenant taps a one-time "Get rent reminders" opt-in inside Messenger
- After that, reminders send automatically with no per-message cost, since it's an opted-in subscription message, not a promotional one
- May require basic Facebook Page/business verification — to confirm at setup time

**2. SMS via her own phone (free of API fees)**
- An SMS Gateway Android app (e.g. "SMS Gateway for Android," open-source) runs on her phone and exposes a small local API
- Cloud Functions sends the message to that API; the SMS goes out through her own SIM — no third-party gateway fee, just her normal text usage (free with an unli-text plan)
- Requires her phone to be online at send time; scheduling reminders for a normal daytime hour keeps this reliable

**3. Fallback — manual one-tap send**
- If a tenant has neither Messenger opt-in nor a phone number on file, the app flags them as "needs reminder" so she can follow up manually
- Nothing silently fails

### 5.4 Decision logic per tenant
```
Has tenant opted into Messenger?
  → Yes: send via Messenger
  → No: does tenant have a phone number on file?
      → Yes: send via SMS Gateway (her phone)
      → No: flag in-app for manual follow-up
```

---

## 6. Security & Privacy Considerations
- PIN lock gates all data on open; no data shown before it's entered
- Financial data lives in Firestore under access rules scoped to the family's account only
- Tenant contact info (phone, Messenger opt-in) is used strictly for rent reminders, never shared elsewhere
- Offline-first design means the app still works if the connection drops — nothing is lost, it syncs once back online

---

## 7. Design Principles
- No logins/accounts — opens straight to PIN lock, then the app
- Big buttons, minimal typing (pick from lists instead of retyping names)
- No clutter — just money in, money out, and who still owes
- Plain, everyday language everywhere — no jargon
- Everything saves automatically, nothing to remember to "save"
- Works offline; syncs quietly when back online

---

## 8. UI Design Prompt (Google Stitch)

```
Design a simple, easy-to-use app called "Renta" for tracking rental income and expenses, built for a non-technical older user who is not comfortable with complicated apps.

APP PURPOSE:
Renta tracks rent collected from tenants and expenses paid for medicine and household needs. Two things matter most: money coming in, and money going out.

DESIGN PRIORITIES (most important):
- Extremely simple and uncluttered — one clear purpose per screen
- Large, legible text (nothing small or dense)
- Big, obvious tap targets — buttons should look unmistakably like buttons
- Minimal text labels, plain everyday words, no jargon or technical terms
- High contrast, calm and friendly color palette (avoid anything busy or "techy")
- Clear visual difference between "money in" (rent) and "money out" (expenses) — one warm accent color for income/paid, one cooler or coral accent for expenses/unpaid, used consistently
- Icons paired with every label, not text alone
- Generous spacing — nothing cramped
- Works well on both a phone screen and a laptop/desktop window
- App name "Renta" appears simply on the lock screen and dashboard header — no elaborate logo needed, a small house or coin mark is enough

SCREENS TO DESIGN:

1. PIN Lock screen — "Renta" name at top, large number pad, minimal text, simple "Enter PIN" prompt

2. Dashboard (home) — shows: this month's rent collected vs expected, this month's expenses, net balance, and a short list of tenants who haven't paid yet. Should feel like a clear "at a glance" summary, not a data table.

3. Tenants list — simple list of tenant name, property/unit, rent amount, and a colored status tag (Paid / Unpaid this month). Tapping a tenant opens their payment history.

4. Tenant detail / payment history — tenant's name and unit at top, full list of past payments with dates and amounts, a big "Log a payment" button.

5. Add/Log Payment — very short form: pick tenant from a list, enter amount, pick date, one big "Save" button.

6. Add Expense — short form: description, category (Medicine, Repairs, Other — shown as simple icon tabs), amount, date.

7. Monthly Report — a clean printable-looking summary: total rent collected, total expenses, net balance, with a big "Export" or "Share" button.

8. Reminders/Notifications view — simple list of upcoming or overdue rent reminders, showing tenant name and due date with a colored urgency indicator, and a note on how each reminder will be sent (Messenger or text message).

9. Settings — simple screen for PIN change and reminder channel setup (Messenger connection, phone number for texts), written in plain language, not technical settings-menu style.

STYLE DIRECTION:
Warm, approachable, and calm — like a simple banking or budgeting app made for someone's parent, not a startup dashboard. Rounded corners, soft shadows, no dense charts or graphs unless extremely simple (a single bar or progress indicator is fine). Avoid dark, "techy" themes — favor a light, airy background with one or two accent colors used consistently for meaning (e.g. green-ish for paid/income, coral/red for unpaid/overdue).
```

---

## 9. Build Order (suggested)
1. Core data model + Firestore setup
2. Frontend: Dashboard, Tenants, Payments, Expenses screens
3. PIN lock
4. PWA install support (manifest, service worker) on both devices, branded as Renta
5. Monthly report + export
6. Cloud Functions scheduler + due-date logic
7. One-tap SMS/Messenger link fallback (ships first, zero setup cost)
8. SMS Gateway (her phone) integration
9. Messenger recurring notifications integration

---

## 10. Possible Future Additions (not needed for v1)
- Overdue-payment escalation (e.g. a second, firmer reminder after X days)
- Simple yearly summary alongside the monthly one
- Multiple family members with separate PINs
- Backup/export of all data to a file, in case the phone is lost
