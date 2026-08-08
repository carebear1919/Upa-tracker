# Data Model

Firestore collections (mirrored locally by `frontend/src/lib/store.js` until the Firebase project is live):

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

`notificationChannel` is one of `messenger`, `sms`, `manual` — decided per the
priority order in section 5.4 of the project description (Messenger opt-in,
else phone on file, else manual follow-up).

`monthCovered` on a payment is `YYYY-MM`; a tenant counts as paid for a month
when a payment with that `monthCovered` exists for their `tenantId`.
