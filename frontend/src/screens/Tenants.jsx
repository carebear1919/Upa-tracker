import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, db, currentMonth, paymentStatus, formatCurrency } from '../lib/store.js'
import Icon from '../components/Icon.jsx'
import EmptyState from '../components/EmptyState.jsx'
import DueBadge from '../components/DueBadge.jsx'

const emptyForm = { name: '', property: '', unit: '', monthlyRent: '', dueDay: '', phone: '', fbMessengerOptedIn: false }

export default function Tenants() {
  const { tenants, payments } = useStore()
  const month = currentMonth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  function submit(e) {
    e.preventDefault()
    db.addTenant({
      ...form,
      monthlyRent: Number(form.monthlyRent),
      dueDay: Number(form.dueDay),
      notificationChannel: form.fbMessengerOptedIn ? 'messenger' : form.phone ? 'sms' : 'manual',
    })
    setForm(emptyForm)
    setShowForm(false)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-on-background">Tenants</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-primary text-on-primary font-semibold px-6 py-3 rounded-full min-h-tap-target-min flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Icon name="add" className="text-[20px]" />
          Add Tenant
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-4 w-full">
          <Field label="Name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Property">
            <input required value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Unit (optional)">
            <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Monthly Rent">
            <input required type="number" min="0" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Due Day (1-31)">
            <input required type="number" min="1" max="31" value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Phone (optional)">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          </Field>
          <button type="submit" className="w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg mt-2 hover:bg-primary-container transition-colors">
            Save Tenant
          </button>
        </form>
      )}

      {tenants.length === 0 && !showForm && (
        <EmptyState
          icon="group"
          title="No tenants yet"
          message="Add your first tenant to start tracking rent, payments, and reminders."
          actionLabel="Add Tenant"
          onAction={() => setShowForm(true)}
        />
      )}

      <div className="flex flex-col gap-2 w-full">
        {tenants.map((t) => {
          const { status, balance } = paymentStatus(t, payments, month)
          return (
            <Link
              key={t.id}
              to={`/tenants/${t.id}`}
              className="bg-surface shadow-level-1 rounded-xl p-4 min-h-[64px] flex items-center justify-between hover:bg-surface-container-low transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-on-surface">{t.name}</span>
                <span className="text-on-surface-variant">
                  {t.unit ? `Unit ${t.unit} - ` : ''}
                  {t.property} · {formatCurrency(t.monthlyRent)}/mo
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                {status === 'paid' && (
                  <span className="text-sm font-semibold uppercase px-3 py-1 rounded-full bg-primary text-on-primary">
                    Paid
                  </span>
                )}
                {status === 'partial' && (
                  <span className="text-sm font-semibold uppercase px-3 py-1 rounded-full bg-tertiary text-on-tertiary">
                    Partial
                  </span>
                )}
                {status === 'unpaid' && <DueBadge dueDay={t.dueDay} />}
                {status !== 'paid' && (
                  <span className="text-sm text-on-surface-variant">{formatCurrency(balance)} left</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}

const inputCls = 'w-full min-h-tap-target-min border-2 border-outline-variant rounded-lg px-4 text-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-semibold text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}
