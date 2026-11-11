// Data layer. Backed by Supabase Postgres when frontend/.env has
// VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set (see supabase/migrations/0001_init.sql
// for the schema); falls back to localStorage otherwise, so the app still
// runs fully offline before Supabase is wired up. Either way, callers only
// ever see get/add/update/remove — screens never know which backend is live.
import { useSyncExternalStore } from 'react'
import { DEFAULT_REMINDER_TEMPLATE } from './messageLinks.js'
import { supabase, isSupabaseConfigured } from './supabase.js'

const KEY = 'renta-data-v1'

function seed() {
  return {
    tenants: [
      { id: 't1', name: 'Alice Johnson', property: 'Oakwood Apts', unit: '4B', phone: '555-0101', messengerLink: 'alice.johnson', monthlyRent: 1200, dueDay: 1, propertyType: 'Housing' },
      { id: 't2', name: 'Robert Smith', property: '123 Elm St House', unit: '', phone: '555-0102', messengerLink: '', monthlyRent: 950, dueDay: 5, propertyType: 'Housing' },
      { id: 't3', name: 'Carol White', property: 'Pine Apts', unit: '1A', phone: '', messengerLink: '', monthlyRent: 1050, dueDay: 7, propertyType: 'Housing' },
    ],
    payments: [
      { id: 'p1', tenantId: 't1', amount: 1200, datePaid: '2026-06-01', monthCovered: '2026-06' },
      { id: 'p2', tenantId: 't1', amount: 1200, datePaid: '2026-07-01', monthCovered: '2026-07' },
    ],
    expenses: [
      { id: 'e1', description: 'Blood pressure medicine', category: 'Medicine', amount: 85, date: '2026-08-02' },
      { id: 'e2', description: 'Leaky faucet repair', category: 'Repairs', amount: 120, date: '2026-08-04' },
    ],
    reminders: [],
    withdrawals: [],
    transfers: [],
    settings: { pinHash: '', businessName: 'Renta', currency: 'PHP', openingBalance: 0, reminderTemplate: DEFAULT_REMINDER_TEMPLATE },
  }
}

// Installations created before the Tagalog wording was the default may still
// hold the old English template in their settings row. Reset straight English
// wording back to the Tagalog default so every tenant gets the same message.
function normalizeReminderTemplate(template) {
  const legacy =
    /this is a reminder|your rent of|due on day|remind ko lang/i.test(template ?? '')
  return legacy && template !== DEFAULT_REMINDER_TEMPLATE ? DEFAULT_REMINDER_TEMPLATE : template
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

  const tenants = [
    { id: makeId(), name: 'Alice Johnson', property: 'Oakwood Apartments', unit: '4B', phone: '', messengerLink: 'alice.johnson', monthlyRent: 12000, dueDay: clampDay(day), propertyType: 'Housing' },
    { id: makeId(), name: 'Robert Smith', property: 'Elm Street House', unit: '', phone: '0917-555-0102', messengerLink: '', monthlyRent: 9500, dueDay: clampDay(day + 2), propertyType: 'Housing' },
    { id: makeId(), name: 'Carol White', property: 'Pine Apartments', unit: '1A', phone: '', messengerLink: '', monthlyRent: 10500, dueDay: clampDay(day - 3 < 1 ? day + 25 : day - 3), propertyType: 'Housing' },
    { id: makeId(), name: 'David Cruz', property: 'Maple Residences', unit: '2C', phone: '0917-555-0104', messengerLink: '', monthlyRent: 15000, dueDay: clampDay(day + 10), propertyType: 'Business' },
    { id: makeId(), name: 'Elena Reyes', property: 'Sunview Condo', unit: '5F', phone: '', messengerLink: 'elena.reyes.renta', monthlyRent: 8000, dueDay: clampDay(day + 15), propertyType: 'Business' },
  ]
  const [alice, , , david, elena] = tenants

  return {
    tenants,
    payments: [
      { id: makeId(), tenantId: alice.id, amount: 12000, datePaid: dateInMonth(prevMonth2, 1), monthCovered: prevMonth2, method: 'Cash' },
      { id: makeId(), tenantId: alice.id, amount: 12000, datePaid: dateInMonth(prevMonth, 1), monthCovered: prevMonth, method: 'GCash' },
      { id: makeId(), tenantId: david.id, amount: 15000, datePaid: dateInMonth(prevMonth, 2), monthCovered: prevMonth, method: 'Check' },
      { id: makeId(), tenantId: david.id, amount: 15000, datePaid: dateInMonth(curMonth, clampDay(day - 1)), monthCovered: curMonth, method: 'Check' },
      { id: makeId(), tenantId: elena.id, amount: 8000, datePaid: dateInMonth(curMonth, clampDay(day)), monthCovered: curMonth, method: 'GCash' },
    ],
    expenses: [
      { id: makeId(), description: 'Maintenance medicine', category: 'Medicine', amount: 650, date: dateInMonth(prevMonth2, 10) },
      { id: makeId(), description: 'Plumbing repair', category: 'Repairs', amount: 1800, date: dateInMonth(prevMonth2, 15) },
      { id: makeId(), description: 'Blood pressure medicine', category: 'Medicine', amount: 850, date: dateInMonth(prevMonth, 8) },
      { id: makeId(), description: 'Grocery run for meds', category: 'Other', amount: 400, date: dateInMonth(prevMonth, 20) },
      { id: makeId(), description: 'Diabetes medication', category: 'Medicine', amount: 1200, date: dateInMonth(curMonth, clampDay(day - 2)) },
      { id: makeId(), description: 'Ceiling fan repair', category: 'Repairs', amount: 950, date: dateInMonth(curMonth, clampDay(day - 1)) },
    ],
    withdrawals: [
      { id: makeId(), note: 'Cash for groceries', amount: 5000, date: dateInMonth(prevMonth, 15), method: 'Cash' },
      { id: makeId(), note: 'Withdrawn from GCash', amount: 8000, date: dateInMonth(curMonth, clampDay(day - 1)), method: 'GCash' },
    ],
    transfers: [
      { id: makeId(), fromMethod: 'Check', toMethod: 'Cash', amount: 15000, date: dateInMonth(curMonth, clampDay(day - 1)), note: 'Check cashed at the bank' },
    ],
  }
}

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10)
}

let state = { tenants: [], payments: [], expenses: [], reminders: [], withdrawals: [], transfers: [], settings: seed().settings, loading: true, authNeeded: false }
const listeners = new Set()

function emit() {
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

// ---------------------------------------------------------------------------
// localStorage backend — used whenever Supabase isn't configured.
// ---------------------------------------------------------------------------

function localLoad() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const data = JSON.parse(raw)
      data.settings.openingBalance ??= 0
      data.settings.reminderTemplate = normalizeReminderTemplate(data.settings.reminderTemplate ?? DEFAULT_REMINDER_TEMPLATE)
      data.reminders ??= []
      data.withdrawals = (data.withdrawals ?? []).map((w) => ({ ...w, method: w.method ?? 'Cash' }))
      data.transfers ??= []
      data.payments = data.payments.map((p) => ({ ...p, method: p.method ?? 'Cash' }))
      return data
    }
  } catch {
    // fall through to seed
  }
  const data = seed()
  localSave(data)
  return data
}

function localSave(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

function initLocal() {
  console.log('[renta/init] Using LOCAL STORAGE only — Supabase is not configured or failed to connect. Data stays in this browser only.')
  state = { ...localLoad(), loading: false }
  emit()
}

function localCommit() {
  localSave(state)
  emit()
}

const localDb = {
  addTenant(tenant) {
    state = { ...state, tenants: [...state.tenants, { id: makeId(), ...tenant }] }
    localCommit()
  },
  updateTenant(id, patch) {
    state = { ...state, tenants: state.tenants.map((t) => (t.id === id ? { ...t, ...patch } : t)) }
    localCommit()
  },
  removeTenant(id) {
    state = {
      ...state,
      tenants: state.tenants.filter((t) => t.id !== id),
      payments: state.payments.filter((p) => p.tenantId !== id),
      reminders: state.reminders.filter((r) => r.tenantId !== id),
    }
    localCommit()
  },
  addPayment(payment) {
    state = { ...state, payments: [...state.payments, { id: makeId(), ...payment }] }
    localCommit()
  },
  updatePayment(id, patch) {
    state = { ...state, payments: state.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)) }
    localCommit()
  },
  removePayment(id) {
    state = { ...state, payments: state.payments.filter((p) => p.id !== id) }
    localCommit()
  },
  addExpense(expense) {
    state = { ...state, expenses: [...state.expenses, { id: makeId(), ...expense }] }
    localCommit()
  },
  updateExpense(id, patch) {
    state = { ...state, expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) }
    localCommit()
  },
  removeExpense(id) {
    state = { ...state, expenses: state.expenses.filter((e) => e.id !== id) }
    localCommit()
  },
  addWithdrawal(withdrawal) {
    state = { ...state, withdrawals: [...state.withdrawals, { id: makeId(), ...withdrawal }] }
    localCommit()
  },
  updateWithdrawal(id, patch) {
    state = { ...state, withdrawals: state.withdrawals.map((w) => (w.id === id ? { ...w, ...patch } : w)) }
    localCommit()
  },
  removeWithdrawal(id) {
    state = { ...state, withdrawals: state.withdrawals.filter((w) => w.id !== id) }
    localCommit()
  },
  addTransfer(transfer) {
    state = { ...state, transfers: [...state.transfers, { id: makeId(), ...transfer }] }
    localCommit()
  },
  updateTransfer(id, patch) {
    state = { ...state, transfers: state.transfers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }
    localCommit()
  },
  removeTransfer(id) {
    state = { ...state, transfers: state.transfers.filter((t) => t.id !== id) }
    localCommit()
  },
  updateSettings(patch) {
    state = { ...state, settings: { ...state.settings, ...patch } }
    localCommit()
  },
  logReminder(tenantId, channel) {
    state = {
      ...state,
      reminders: [...state.reminders, { id: makeId(), tenantId, channel, sentAt: new Date().toISOString(), month: currentMonth() }],
    }
    localCommit()
  },
  clearAllData() {
    state = { ...state, tenants: [], payments: [], expenses: [], reminders: [], withdrawals: [], transfers: [] }
    localCommit()
  },
  loadSampleData() {
    state = { ...state, ...sampleData() }
    localCommit()
  },
}

// ---------------------------------------------------------------------------
// Supabase backend — row <-> camelCase mapping, optimistic local updates,
// realtime sync so other tabs/devices logged into the same account stay
// current.
// ---------------------------------------------------------------------------

const ROW_TO_APP = {
  tenants: (r) => ({ id: r.id, name: r.name, property: r.property, unit: r.unit, phone: r.phone, messengerLink: r.messenger_link, monthlyRent: Number(r.monthly_rent), dueDay: r.due_day, propertyType: r.property_type, photo: r.photo }),
  payments: (r) => ({ id: r.id, tenantId: r.tenant_id, amount: Number(r.amount), datePaid: r.date_paid, monthCovered: r.month_covered, method: r.method ?? 'Cash' }),
  expenses: (r) => ({ id: r.id, description: r.description, category: r.category, amount: Number(r.amount), date: r.date }),
  reminders: (r) => ({ id: r.id, tenantId: r.tenant_id, channel: r.channel, sentAt: r.sent_at, month: r.month }),
  withdrawals: (r) => ({ id: r.id, note: r.note, amount: Number(r.amount), date: r.date, method: r.method ?? 'Cash' }),
  transfers: (r) => ({ id: r.id, fromMethod: r.from_method, toMethod: r.to_method, amount: Number(r.amount), date: r.date, note: r.note }),
}

const APP_TO_ROW = {
  tenants: (t, uid) => ({ id: t.id, user_id: uid, name: t.name, property: t.property, unit: t.unit ?? '', phone: t.phone ?? '', messenger_link: t.messengerLink ?? '', monthly_rent: t.monthlyRent, due_day: t.dueDay, property_type: t.propertyType ?? 'Housing', photo: t.photo ?? null }),
  payments: (p, uid) => ({ id: p.id, user_id: uid, tenant_id: p.tenantId, amount: p.amount, date_paid: p.datePaid, month_covered: p.monthCovered, method: p.method ?? 'Cash' }),
  expenses: (e, uid) => ({ id: e.id, user_id: uid, description: e.description, category: e.category, amount: e.amount, date: e.date }),
  reminders: (r, uid) => ({ id: r.id, user_id: uid, tenant_id: r.tenantId, channel: r.channel, sent_at: r.sentAt, month: r.month }),
  withdrawals: (w, uid) => ({ id: w.id, user_id: uid, note: w.note ?? '', amount: w.amount, date: w.date, method: w.method ?? 'Cash' }),
  transfers: (t, uid) => ({ id: t.id, user_id: uid, from_method: t.fromMethod, to_method: t.toMethod, amount: t.amount, date: t.date, note: t.note ?? '' }),
}

// Only maps keys actually present on a patch — unlike APP_TO_ROW (used for
// inserts, which needs every column), this must NOT fill in defaults for
// missing fields, or an update() would silently blank out every column the
// caller didn't happen to include.
const FIELD_TO_COLUMN = {
  tenants: { name: 'name', property: 'property', unit: 'unit', phone: 'phone', messengerLink: 'messenger_link', monthlyRent: 'monthly_rent', dueDay: 'due_day', propertyType: 'property_type', photo: 'photo' },
  payments: { tenantId: 'tenant_id', amount: 'amount', datePaid: 'date_paid', monthCovered: 'month_covered', method: 'method' },
  expenses: { description: 'description', category: 'category', amount: 'amount', date: 'date' },
  reminders: { tenantId: 'tenant_id', channel: 'channel', sentAt: 'sent_at', month: 'month' },
  withdrawals: { note: 'note', amount: 'amount', date: 'date', method: 'method' },
  transfers: { fromMethod: 'from_method', toMethod: 'to_method', amount: 'amount', date: 'date', note: 'note' },
}

function patchToRow(table, patch) {
  const map = FIELD_TO_COLUMN[table]
  const row = {}
  for (const key of Object.keys(patch)) {
    if (map[key]) row[map[key]] = patch[key]
  }
  return row
}

let userId = null
let dataLoaded = false

function mergeLocal(table, row) {
  const item = ROW_TO_APP[table](row)
  const list = state[table]
  const exists = list.some((x) => x.id === item.id)
  state = { ...state, [table]: exists ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item] }
  emit()
}

function removeLocalRow(table, id) {
  state = { ...state, [table]: state[table].filter((x) => x.id !== id) }
  emit()
}

async function writeRow(table, appRow, isUpdate) {
  const { id, ...patch } = appRow
  const row = isUpdate ? patchToRow(table, patch) : APP_TO_ROW[table](appRow, userId)
  console.log(`[renta/db] ${isUpdate ? 'UPDATE' : 'INSERT'} ${table} →`, row)
  const query = isUpdate ? supabase.from(table).update(row).eq('id', id) : supabase.from(table).insert(row)
  const { error } = await query
  if (error) console.error(`[renta/db] ✗ ${isUpdate ? 'update' : 'insert'} ${table} FAILED:`, error.message, error)
  else console.log(`[renta/db] ✓ ${isUpdate ? 'update' : 'insert'} ${table} saved to Supabase`)
}

async function deleteRow(table, id) {
  console.log(`[renta/db] DELETE ${table} id=${id}`)
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) console.error(`[renta/db] ✗ delete ${table} FAILED:`, error.message, error)
  else console.log(`[renta/db] ✓ delete ${table} confirmed in Supabase`)
}

async function initSupabase(session) {
  console.log('[renta/init] Supabase configured, loading data for logged-in session…', { url: import.meta.env.VITE_SUPABASE_URL })
  try {
    userId = session.user.id
    console.log('[renta/init] ✓ using session, auth.uid() =', userId)

    console.log('[renta/init] step 1/2: fetching tenants/payments/expenses/reminders/settings…')
    const [tenantsRes, paymentsRes, expensesRes, remindersRes, withdrawalsRes, transfersRes, settingsRes] = await Promise.all([
      supabase.from('tenants').select('*'),
      supabase.from('payments').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('reminders').select('*'),
      supabase.from('withdrawals').select('*'),
      supabase.from('transfers').select('*'),
      supabase.from('settings').select('*').eq('user_id', userId).maybeSingle(),
    ])

    for (const [name, res] of [['tenants', tenantsRes], ['payments', paymentsRes], ['expenses', expensesRes], ['reminders', remindersRes], ['withdrawals', withdrawalsRes], ['transfers', transfersRes], ['settings', settingsRes]]) {
      if (res.error) console.error(`[renta/init] ✗ fetching "${name}" FAILED — likely means the table doesn't exist yet, or Row Level Security is blocking it:`, res.error.message, res.error)
      else console.log(`[renta/init] ✓ fetched "${name}":`, Array.isArray(res.data) ? `${res.data.length} row(s)` : res.data)
    }

    let settings = { pinHash: '', businessName: 'Renta', currency: 'PHP', openingBalance: 0, reminderTemplate: DEFAULT_REMINDER_TEMPLATE }
    if (settingsRes.data) {
      settings = {
        pinHash: settingsRes.data.pin_hash,
        businessName: settingsRes.data.business_name,
        currency: settingsRes.data.currency,
        openingBalance: Number(settingsRes.data.opening_balance),
        reminderTemplate: normalizeReminderTemplate(settingsRes.data.reminder_template),
      }
    } else {
      console.log('[renta/init] no settings row yet for this install — creating one')
      const { error } = await supabase.from('settings').insert({ user_id: userId })
      if (error) console.error('[renta/init] ✗ creating settings row FAILED:', error.message, error)
    }

    state = {
      tenants: (tenantsRes.data ?? []).map(ROW_TO_APP.tenants),
      payments: (paymentsRes.data ?? []).map(ROW_TO_APP.payments),
      expenses: (expensesRes.data ?? []).map(ROW_TO_APP.expenses),
      reminders: (remindersRes.data ?? []).map(ROW_TO_APP.reminders),
      withdrawals: (withdrawalsRes.data ?? []).map(ROW_TO_APP.withdrawals),
      transfers: (transfersRes.data ?? []).map(ROW_TO_APP.transfers),
      settings,
      loading: false,
      authNeeded: false,
    }
    emit()
    console.log('[renta/init] step 2/2: subscribing to realtime updates…')

    for (const table of ['tenants', 'payments', 'expenses', 'reminders', 'withdrawals', 'transfers']) {
      supabase
        .channel(`${table}-${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` }, (payload) => {
          console.log(`[renta/realtime] ${payload.eventType} on ${table}:`, payload.new ?? payload.old)
          if (payload.eventType === 'DELETE') removeLocalRow(table, payload.old.id)
          else mergeLocal(table, payload.new)
        })
        .subscribe((status) => console.log(`[renta/realtime] ${table} channel status:`, status))
    }

    console.log('[renta/init] ✓ ALL DONE — app is live on Supabase.')
  } catch (err) {
    console.error('[renta/init] ✗ INIT FAILED, falling back to local storage only:', err.message, err)
    initLocal()
  }
}

const supabaseDb = {
  addTenant(tenant) {
    const row = { id: makeId(), ...tenant }
    state = { ...state, tenants: [...state.tenants, row] }
    emit()
    writeRow('tenants', row, false)
  },
  updateTenant(id, patch) {
    state = { ...state, tenants: state.tenants.map((t) => (t.id === id ? { ...t, ...patch } : t)) }
    emit()
    writeRow('tenants', { id, ...patch }, true)
  },
  removeTenant(id) {
    state = {
      ...state,
      tenants: state.tenants.filter((t) => t.id !== id),
      payments: state.payments.filter((p) => p.tenantId !== id),
      reminders: state.reminders.filter((r) => r.tenantId !== id),
    }
    emit()
    deleteRow('tenants', id) // FK cascade removes its payments/reminders server-side too
  },
  addPayment(payment) {
    const row = { id: makeId(), ...payment }
    state = { ...state, payments: [...state.payments, row] }
    emit()
    writeRow('payments', row, false)
  },
  updatePayment(id, patch) {
    state = { ...state, payments: state.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)) }
    emit()
    writeRow('payments', { id, ...patch }, true)
  },
  removePayment(id) {
    state = { ...state, payments: state.payments.filter((p) => p.id !== id) }
    emit()
    deleteRow('payments', id)
  },
  addExpense(expense) {
    const row = { id: makeId(), ...expense }
    state = { ...state, expenses: [...state.expenses, row] }
    emit()
    writeRow('expenses', row, false)
  },
  updateExpense(id, patch) {
    state = { ...state, expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) }
    emit()
    writeRow('expenses', { id, ...patch }, true)
  },
  removeExpense(id) {
    state = { ...state, expenses: state.expenses.filter((e) => e.id !== id) }
    emit()
    deleteRow('expenses', id)
  },
  addWithdrawal(withdrawal) {
    const row = { id: makeId(), ...withdrawal }
    state = { ...state, withdrawals: [...state.withdrawals, row] }
    emit()
    writeRow('withdrawals', row, false)
  },
  updateWithdrawal(id, patch) {
    state = { ...state, withdrawals: state.withdrawals.map((w) => (w.id === id ? { ...w, ...patch } : w)) }
    emit()
    writeRow('withdrawals', { id, ...patch }, true)
  },
  removeWithdrawal(id) {
    state = { ...state, withdrawals: state.withdrawals.filter((w) => w.id !== id) }
    emit()
    deleteRow('withdrawals', id)
  },
  addTransfer(transfer) {
    const row = { id: makeId(), ...transfer }
    state = { ...state, transfers: [...state.transfers, row] }
    emit()
    writeRow('transfers', row, false)
  },
  updateTransfer(id, patch) {
    state = { ...state, transfers: state.transfers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }
    emit()
    writeRow('transfers', { id, ...patch }, true)
  },
  removeTransfer(id) {
    state = { ...state, transfers: state.transfers.filter((t) => t.id !== id) }
    emit()
    deleteRow('transfers', id)
  },
  updateSettings(patch) {
    state = { ...state, settings: { ...state.settings, ...patch } }
    emit()
    const row = { user_id: userId, pin_hash: state.settings.pinHash, business_name: state.settings.businessName, currency: state.settings.currency, opening_balance: state.settings.openingBalance, reminder_template: state.settings.reminderTemplate }
    supabase.from('settings').upsert(row).then(({ error }) => {
      if (error) console.error('[supabase] update settings failed:', error.message)
    })
  },
  logReminder(tenantId, channel) {
    const row = { id: makeId(), tenantId, channel, sentAt: new Date().toISOString(), month: currentMonth() }
    state = { ...state, reminders: [...state.reminders, row] }
    emit()
    writeRow('reminders', row, false)
  },
  async clearAllData() {
    state = { ...state, tenants: [], payments: [], expenses: [], reminders: [], withdrawals: [], transfers: [] }
    emit()
    await Promise.all([
      supabase.from('expenses').delete().eq('user_id', userId),
      supabase.from('withdrawals').delete().eq('user_id', userId),
      supabase.from('transfers').delete().eq('user_id', userId),
      supabase.from('tenants').delete().eq('user_id', userId), // cascades payments + reminders
    ])
  },
  async loadSampleData() {
    const demo = sampleData()
    state = { ...state, ...demo }
    emit()
    await supabase.from('tenants').insert(demo.tenants.map((t) => APP_TO_ROW.tenants(t, userId)))
    await Promise.all([
      supabase.from('payments').insert(demo.payments.map((p) => APP_TO_ROW.payments(p, userId))),
      supabase.from('expenses').insert(demo.expenses.map((e) => APP_TO_ROW.expenses(e, userId))),
      supabase.from('withdrawals').insert(demo.withdrawals.map((w) => APP_TO_ROW.withdrawals(w, userId))),
      supabase.from('transfers').insert(demo.transfers.map((t) => APP_TO_ROW.transfers(t, userId))),
    ])
  },
}

export const db = isSupabaseConfigured ? supabaseDb : localDb

console.log(
  isSupabaseConfigured
    ? '[renta/init] VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY found — attempting Supabase connection.'
    : '[renta/init] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY missing from frontend/.env — using local storage. (Check the file has both values, then restart `npm run dev`.)',
)

if (isSupabaseConfigured) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('[renta/auth]', event, session ? `uid=${session.user.id}` : '(no session)')
    if (session && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
      if (!dataLoaded) {
        dataLoaded = true
        initSupabase(session)
      }
    } else if (event === 'SIGNED_OUT') {
      dataLoaded = false
      userId = null
      state = { tenants: [], payments: [], expenses: [], reminders: [], withdrawals: [], transfers: [], settings: seed().settings, loading: false, authNeeded: true }
      emit()
    } else if (event === 'INITIAL_SESSION' && !session) {
      state = { ...state, loading: false, authNeeded: true }
      emit()
    }
  })
} else {
  initLocal()
}

// ---------------------------------------------------------------------------
// Pure helpers — identical regardless of which backend is active.
// ---------------------------------------------------------------------------

export function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

// Most recent confirmed reminder for a tenant this month, or null.
export function lastReminder(reminders, tenantId, month = currentMonth()) {
  const forTenant = reminders.filter((r) => r.tenantId === tenantId && r.month === month)
  if (forTenant.length === 0) return null
  return forTenant.reduce((latest, r) => (r.sentAt > latest.sentAt ? r : latest))
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
  const n = Number(amount)
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  // Whole pesos stay clean (₱12,000); anything with cents always shows two digits (₱12,000.50).
  // The minus sign goes in front of the peso sign (-₱5,850), not between them.
  return Number.isInteger(abs)
    ? `${sign}₱${abs.toLocaleString('en-PH')}`
    : `${sign}₱${abs.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Lets one household track a mix of rental housing and business spaces in
// the same list while still being able to tell them apart at a glance.
export const PROPERTY_TYPES = ['Housing', 'Business']
export const PROPERTY_TYPE_ICON = { Housing: 'apartment', Business: 'storefront' }

// How a tenant paid — Cash, GCash, or Check. Shown on every payment and
// broken out in Reports so it's clear where the money actually landed.
export const PAYMENT_METHODS = ['Cash', 'GCash', 'Check']

export const EXPENSE_CATEGORIES = [
  { value: 'Medicine', label: 'Medicine & Health', icon: 'medication' },
  { value: 'Repairs', label: 'Repairs', icon: 'home_repair_service' },
  { value: 'Other', label: 'Other', icon: 'receipt_long' },
]

// Running balance carried forward across months — the money on hand before
// tracking even started (settings.openingBalance), plus every payment ever
// logged, minus every expense ever logged, up to and including `throughMonth`
// (YYYY-MM). This is "money left" and rolls into the next month rather than
// resetting to zero.
export function balanceThroughMonth(payments, expenses, throughMonth, openingBalance = 0, withdrawals = []) {
  const collected = payments
    .filter((p) => p.monthCovered <= throughMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const spent = expenses
    .filter((e) => e.date.slice(0, 7) <= throughMonth)
    .reduce((sum, e) => sum + Number(e.amount), 0)
  const withdrawn = withdrawals
    .filter((w) => w.date.slice(0, 7) <= throughMonth)
    .reduce((sum, w) => sum + Number(w.amount), 0)
  return Number(openingBalance) + collected - spent - withdrawn
}

// Where the collected money physically is, split by Cash / GCash / Check:
// payments received, plus anything moved in, minus anything moved out or
// withdrawn from that pot — all up to and including `throughMonth`.
// Starting balance and expenses aren't tied to a pot, so they're returned
// separately as `unassigned` — the pots plus `unassigned` always add up to
// the Dashboard's "Money Left".
export function balancesByMethod(payments, withdrawals, transfers, throughMonth, expenses = [], openingBalance = 0) {
  const upTo = (d) => d.slice(0, 7) <= throughMonth
  const pots = Object.fromEntries(PAYMENT_METHODS.map((m) => [m, 0]))
  for (const p of payments) if (p.monthCovered <= throughMonth) pots[p.method ?? 'Cash'] += Number(p.amount)
  for (const w of withdrawals) if (upTo(w.date)) pots[w.method ?? 'Cash'] -= Number(w.amount)
  for (const t of transfers) {
    if (!upTo(t.date)) continue
    pots[t.fromMethod] -= Number(t.amount)
    pots[t.toMethod] += Number(t.amount)
  }
  const spent = expenses.filter((e) => upTo(e.date)).reduce((sum, e) => sum + Number(e.amount), 0)
  return { pots, unassigned: Number(openingBalance) - spent }
}

// Balance carried in from before `month` starts — the previous month's
// ending balance, used as this month's "Starting Balance".
// Pure string/integer math on the "YYYY-MM" key — no Date/toISOString, which
// would convert through UTC and roll the month back a day in +offset zones.
export function startingBalance(payments, expenses, month, openingBalance = 0, withdrawals = []) {
  const [year, mon] = month.split('-').map(Number)
  const prevYear = mon === 1 ? year - 1 : year
  const prevMon = mon === 1 ? 12 : mon - 1
  const prevMonthKey = `${prevYear}-${String(prevMon).padStart(2, '0')}`
  return balanceThroughMonth(payments, expenses, prevMonthKey, openingBalance, withdrawals)
}
