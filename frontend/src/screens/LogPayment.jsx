import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore, db, paymentStatus, formatCurrency } from '../lib/store.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import PropertyPhoto from '../components/PropertyPhoto.jsx'

const STATUS_TONE = { paid: 'primary', partial: 'tertiary', unpaid: 'secondary' }
const STATUS_LABEL = { paid: 'Paid', partial: 'Partial', unpaid: 'Unpaid' }

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

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-gutter w-full items-start">
        <Card className="w-full">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Tenant" className="md:col-span-2">
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
            </Field>
            <Field label="Date">
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            {status && status.status !== 'paid' && (
              <p className="md:col-span-2 text-sm text-on-surface-variant -mt-3">
                Paying less than the full amount is fine — it'll show as partially paid.
              </p>
            )}
            <button type="submit" className="md:col-span-2 w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg mt-2 hover:bg-primary-container transition-colors">
              Save
            </button>
          </form>
        </Card>

        <Card className="flex flex-col items-center text-center gap-2 w-full">
          {tenant ? (
            <>
              <PropertyPhoto photo={tenant.photo} size={72} rounded="rounded-full" />
              <span className="font-semibold text-lg text-on-surface">{tenant.name}</span>
              <span className="text-on-surface-variant">
                {tenant.unit ? `Unit ${tenant.unit} - ` : ''}
                {tenant.property}
              </span>
              <span className="text-on-surface-variant">{formatCurrency(tenant.monthlyRent)}/mo</span>
              {status && (
                <Chip tone={STATUS_TONE[status.status]} className="mt-1">
                  {STATUS_LABEL[status.status]}
                </Chip>
              )}
            </>
          ) : (
            <>
              <Icon name="person" className="text-[40px] text-on-surface-variant" />
              <p className="text-on-surface-variant">Pick a tenant to see their details here.</p>
            </>
          )}
        </Card>
      </div>
    </>
  )
}

const inputCls = 'w-full min-h-tap-target-min border-2 border-outline-variant rounded-lg px-4 text-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="font-semibold text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}
