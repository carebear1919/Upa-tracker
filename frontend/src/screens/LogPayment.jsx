import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore, db, paymentStatus, formatCurrency } from '../lib/store.js'

export default function LogPayment() {
  const { tenants, payments } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselect = params.get('tenantId') ?? ''

  const [tenantId, setTenantId] = useState(preselect)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const tenant = tenants.find((t) => t.id === tenantId)
  const status = tenant ? paymentStatus(tenant, payments, date.slice(0, 7)) : null

  function submit(e) {
    e.preventDefault()
    db.addPayment({
      tenantId,
      amount: Number(amount),
      datePaid: date,
      monthCovered: date.slice(0, 7),
    })
    navigate(`/tenants/${tenantId}`)
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-on-background mb-2">Log a Payment</h1>
      <form onSubmit={submit} className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-5 w-full">
        <Field label="Tenant">
          <select required value={tenantId} onChange={(e) => setTenantId(e.target.value)} className={inputCls}>
            <option value="" disabled>Pick a tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Amount">
          <input
            required
            type="number"
            min="0"
            placeholder={status ? String(status.balance) : ''}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputCls}
          />
          {status && status.status !== 'paid' && (
            <span className="text-sm text-on-surface-variant">
              {status.status === 'partial' ? `Already paid ${formatCurrency(status.paid)} — ` : ''}
              {formatCurrency(status.balance)} left of {formatCurrency(tenant.monthlyRent)}. Paying less is fine, it'll show as partially paid.
            </span>
          )}
        </Field>
        <Field label="Date">
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <button type="submit" className="w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg mt-2 hover:bg-primary-container transition-colors">
          Save
        </button>
      </form>
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
