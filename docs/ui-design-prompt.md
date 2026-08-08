# UI Design Prompt (Google Stitch)

Source prompt used to generate the screen mockups in `home dashboard/`,
`pin lock/`, `reminders/`, `settings/`, `tenant history/`, and `logo/`
(each with a `DESIGN.md` design-system spec and a `code.html` reference).

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
