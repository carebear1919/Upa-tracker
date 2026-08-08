// Local-first data layer, shaped after the Firestore collections in docs/data-model.md.
// Swap the read/write internals for real Firestore calls once the Firebase project is live —
// callers only see get/add/update/remove, so screens don't need to change.
import { useSyncExternalStore } from 'react'

const KEY = 'renta-data-v1'

function seed() {
  return {
    tenants: [
      { id: 't1', name: 'Alice Johnson', property: 'Oakwood Apts', unit: '4B', phone: '555-0101', fbMessengerOptedIn: true, monthlyRent: 1200, dueDay: 1, notificationChannel: 'messenger' },
      { id: 't2', name: 'Robert Smith', property: '123 Elm St House', unit: '', phone: '555-0102', fbMessengerOptedIn: false, monthlyRent: 950, dueDay: 5, notificationChannel: 'sms' },
      { id: 't3', name: 'Carol White', property: 'Pine Apts', unit: '1A', phone: '', fbMessengerOptedIn: false, monthlyRent: 1050, dueDay: 7, notificationChannel: 'manual' },
    ],
    payments: [
      { id: 'p1', tenantId: 't1', amount: 1200, datePaid: '2026-06-01', monthCovered: '2026-06' },
      { id: 'p2', tenantId: 't1', amount: 1200, datePaid: '2026-07-01', monthCovered: '2026-07' },
    ],
    expenses: [
      { id: 'e1', description: 'Blood pressure medicine', category: 'Medicine', amount: 85, date: '2026-08-02' },
      { id: 'e2', description: 'Leaky faucet repair', category: 'Repairs', amount: 120, date: '2026-08-04' },
    ],
    settings: { pinHash: '', businessName: 'Renta', currency: 'PHP', openingBalance: 0 },
  }
}

function monthKeyOffset(offset, base = new Date()) {
  let year = base.getFullYear()
  let month = base.getMonth() + 1 + offset
  while (month < 1) {
    month += 12
    year -= 1
  }
  while (month > 12) {
    month -= 12
    year += 1
  }
  return `${year}-${String(month).padStart(2, '0')}`
}

function dateInMonth(monthKey, day) {
  return `${monthKey}-${String(day).padStart(2, '0')}`
}

function clampDay(d) {
  return Math.max(1, Math.min(28, d))
}

// Demo data with due dates relative to today, so the day-countdown/urgency
// coloring and month-to-month carry-forward balance all have something real
// to show right away.
function sampleData(today = new Date()) {
  const day = today.getDate()
  const curMonth = monthKeyOffset(0, today)
  const prevMonth = monthKeyOffset(-1, today)
  const prevMonth2 = monthKeyOffset(-2, today)

  return {
    tenants: [
      { id: 'demo-1', name: 'Alice Johnson', property: 'Oakwood Apartments', unit: '4B', phone: '', fbMessengerOptedIn: true, monthlyRent: 12000, dueDay: clampDay(day), notificationChannel: 'messenger' },
      { id: 'demo-2', name: 'Robert Smith', property: 'Elm Street House', unit: '', phone: '0917-555-0102', fbMessengerOptedIn: false, monthlyRent: 9500, dueDay: clampDay(day + 2), notificationChannel: 'sms' },
      { id: 'demo-3', name: 'Carol White', property: 'Pine Apartments', unit: '1A', phone: '', fbMessengerOptedIn: false, monthlyRent: 10500, dueDay: clampDay(day - 3 < 1 ? day + 25 : day - 3), notificationChannel: 'manual' },
      { id: 'demo-4', name: 'David Cruz', property: 'Maple Residences', unit: '2C', phone: '0917-555-0104', fbMessengerOptedIn: false, monthlyRent: 15000, dueDay: clampDay(day + 10), notificationChannel: 'sms' },
      { id: 'demo-5', name: 'Elena Reyes', property: 'Sunview Condo', unit: '5F', phone: '', fbMessengerOptedIn: true, monthlyRent: 8000, dueDay: clampDay(day + 15), notificationChannel: 'messenger' },
    ],
    payments: [
      { id: 'demo-p1', tenantId: 'demo-1', amount: 12000, datePaid: dateInMonth(prevMonth2, 1), monthCovered: prevMonth2 },
      { id: 'demo-p2', tenantId: 'demo-1', amount: 12000, datePaid: dateInMonth(prevMonth, 1), monthCovered: prevMonth },
      { id: 'demo-p3', tenantId: 'demo-4', amount: 15000, datePaid: dateInMonth(prevMonth, 2), monthCovered: prevMonth },
      { id: 'demo-p4', tenantId: 'demo-4', amount: 15000, datePaid: dateInMonth(curMonth, clampDay(day - 1)), monthCovered: curMonth },
      { id: 'demo-p5', tenantId: 'demo-5', amount: 8000, datePaid: dateInMonth(curMonth, clampDay(day)), monthCovered: curMonth },
    ],
    expenses: [
      { id: 'demo-e1', description: 'Maintenance medicine', category: 'Medicine', amount: 650, date: dateInMonth(prevMonth2, 10) },
      { id: 'demo-e2', description: 'Plumbing repair', category: 'Repairs', amount: 1800, date: dateInMonth(prevMonth2, 15) },
      { id: 'demo-e3', description: 'Blood pressure medicine', category: 'Medicine', amount: 850, date: dateInMonth(prevMonth, 8) },
      { id: 'demo-e4', description: 'Grocery run for meds', category: 'Other', amount: 400, date: dateInMonth(prevMonth, 20) },
      { id: 'demo-e5', description: 'Diabetes medication', category: 'Medicine', amount: 1200, date: dateInMonth(curMonth, clampDay(day - 2)) },
      { id: 'demo-e6', description: 'Ceiling fan repair', category: 'Repairs', amount: 950, date: dateInMonth(curMonth, clampDay(day - 1)) },
    ],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const data = JSON.parse(raw)
      // Backfill fields added after this browser's data was first created.
      data.settings.openingBalance ??= 0
      return data
    }
  } catch {
    // fall through to seed
  }
  const data = seed()
  save(data)
  return data
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

let state = load()
const listeners = new Set()

function emit() {
  save(state)
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export const db = {
  addTenant(tenant) {
    state = { ...state, tenants: [...state.tenants, { id: makeId(), ...tenant }] }
    emit()
  },
  updateTenant(id, patch) {
    state = { ...state, tenants: state.tenants.map((t) => (t.id === id ? { ...t, ...patch } : t)) }
    emit()
  },
  removeTenant(id) {
    state = { ...state, tenants: state.tenants.filter((t) => t.id !== id) }
    emit()
  },
  addPayment(payment) {
    state = { ...state, payments: [...state.payments, { id: makeId(), ...payment }] }
    emit()
  },
  addExpense(expense) {
    state = { ...state, expenses: [...state.expenses, { id: makeId(), ...expense }] }
    emit()
  },
  updateSettings(patch) {
    state = { ...state, settings: { ...state.settings, ...patch } }
    emit()
  },
  // Wipes tenants/payments/expenses. Keeps settings (PIN, business name,
  // currency) as-is — clearing data doesn't remove the app's lock.
  clearAllData() {
    state = { ...state, tenants: [], payments: [], expenses: [] }
    emit()
  },
  // Replaces tenants/payments/expenses with demo data so every screen has
  // something to show. Keeps settings (PIN etc.) untouched.
  loadSampleData() {
    state = { ...state, ...sampleData() }
    emit()
  },
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

// Sum of everything a tenant has paid toward a given month — payments don't
// have to cover the full rent in one go, so this adds up partial payments too.
export function paidAmountThisMonth(payments, tenantId, month = currentMonth()) {
  return payments
    .filter((p) => p.tenantId === tenantId && p.monthCovered === month)
    .reduce((sum, p) => sum + Number(p.amount), 0)
}

// 'unpaid' (nothing logged), 'partial' (something logged but short of full
// rent), or 'paid' (covers full rent) — plus how much is still owed.
export function paymentStatus(tenant, payments, month = currentMonth()) {
  const paid = paidAmountThisMonth(payments, tenant.id, month)
  const rent = Number(tenant.monthlyRent)
  const balance = Math.max(rent - paid, 0)
  const status = paid <= 0 ? 'unpaid' : paid < rent ? 'partial' : 'paid'
  return { status, paid, balance }
}

// Days until (negative = past) this tenant's due day in the current month.
// Clamps to the month's actual last day so a dueDay of 31 lands on Feb 28/29.
export function daysUntilDue(dueDay, today = new Date()) {
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const effectiveDueDay = Math.min(Number(dueDay), daysInMonth)
  return effectiveDueDay - today.getDate()
}

export function dueUrgency(diff) {
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 3) return 'soon'
  return 'later'
}

export function dueLabel(diff) {
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  return `Due in ${diff}d`
}

// Consistent color coding for due-date urgency across screens:
// overdue/today = terracotta (secondary), soon = muted gold (tertiary),
// later = neutral gray — matches the Serene Hearth design system's meaning-by-color rule.
export const URGENCY_STYLES = {
  overdue: 'bg-secondary text-on-secondary',
  today: 'bg-secondary text-on-secondary',
  soon: 'bg-tertiary text-on-tertiary',
  later: 'bg-surface-container-highest text-on-surface-variant',
}

export function formatCurrency(amount) {
  return `₱${Number(amount).toLocaleString('en-PH')}`
}

// Running balance carried forward across months — the money on hand before
// tracking even started (settings.openingBalance), plus every payment ever
// logged, minus every expense ever logged, up to and including `throughMonth`
// (YYYY-MM). This is "money left" and rolls into the next month rather than
// resetting to zero.
export function balanceThroughMonth(payments, expenses, throughMonth, openingBalance = 0) {
  const collected = payments
    .filter((p) => p.monthCovered <= throughMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const spent = expenses
    .filter((e) => e.date.slice(0, 7) <= throughMonth)
    .reduce((sum, e) => sum + Number(e.amount), 0)
  return Number(openingBalance) + collected - spent
}

// Balance carried in from before `month` starts — the previous month's
// ending balance, used as this month's "Starting Balance".
// Pure string/integer math on the "YYYY-MM" key — no Date/toISOString, which
// would convert through UTC and roll the month back a day in +offset zones.
export function startingBalance(payments, expenses, month, openingBalance = 0) {
  const [year, mon] = month.split('-').map(Number)
  const prevYear = mon === 1 ? year - 1 : year
  const prevMon = mon === 1 ? 12 : mon - 1
  const prevMonthKey = `${prevYear}-${String(prevMon).padStart(2, '0')}`
  return balanceThroughMonth(payments, expenses, prevMonthKey, openingBalance)
}
