import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore, db, formatCurrency } from '../lib/store.js'
import Icon from '../components/Icon.jsx'

const inputCls = 'w-full min-h-tap-target-min border-2 border-outline-variant rounded-lg px-4 text-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-semibold text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}

export default function TenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tenants, payments } = useStore()
  const tenant = tenants.find((t) => t.id === id)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)

  if (!tenant) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-lg text-on-surface-variant">Tenant not found.</p>
        <Link to="/tenants" className="text-primary font-semibold">Back to Tenants</Link>
      </div>
    )
  }

  const history = payments
    .filter((p) => p.tenantId === id)
    .sort((a, b) => b.datePaid.localeCompare(a.datePaid))

  function startEditing() {
    setForm({
      name: tenant.name,
      property: tenant.property,
      unit: tenant.unit ?? '',
      monthlyRent: tenant.monthlyRent,
      dueDay: tenant.dueDay,
      phone: tenant.phone ?? '',
    })
    setEditing(true)
  }

  function saveEdit(e) {
    e.preventDefault()
    db.updateTenant(tenant.id, {
      ...form,
      monthlyRent: Number(form.monthlyRent),
      dueDay: Number(form.dueDay),
      notificationChannel: tenant.fbMessengerOptedIn ? 'messenger' : form.phone ? 'sms' : 'manual',
    })
    setEditing(false)
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 -mb-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="min-h-tap-target-min min-w-tap-target-min flex items-center justify-center">
            <Icon name="arrow_back" className="text-on-surface-variant text-[22px]" />
          </button>
          <h1 className="text-xl font-semibold text-primary">Tenant Details</h1>
        </div>
        {!editing && (
          <button
            onClick={startEditing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors min-h-tap-target-min"
          >
            <Icon name="edit" className="text-[20px]" />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={saveEdit} className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-4 w-full">
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
          <div className="flex gap-3 mt-2">
            <button type="submit" className="flex-1 bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg hover:bg-primary-container transition-colors">
              Save Changes
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-6 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <section className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 flex flex-col items-center text-center gap-1">
          <h2 className="text-2xl font-bold text-on-surface">{tenant.name}</h2>
          <p className="text-on-surface-variant flex items-center gap-2">
            <Icon name="apartment" className="text-[20px]" />
            {tenant.unit ? `Unit ${tenant.unit} - ` : ''}
            {tenant.property}
          </p>
          <p className="text-on-surface-variant">{formatCurrency(tenant.monthlyRent)}/mo · due day {tenant.dueDay}</p>
          {tenant.phone && (
            <a href={`tel:${tenant.phone}`} className="flex-1 mt-4 bg-surface-container-high hover:bg-surface-variant text-on-surface rounded-lg py-3 px-6 flex items-center justify-center gap-2 transition-colors">
              <Icon name="call" className="text-[20px]" />
              <span className="font-semibold">Call {tenant.phone}</span>
            </a>
          )}
        </section>
      )}

      <section>
        <h3 className="text-xl font-semibold text-on-surface mb-4">Payment History</h3>
        <div className="flex flex-col gap-4">
          {history.length === 0 && <p className="text-on-surface-variant">No payments logged yet.</p>}
          {history.map((p) => (
            <div key={p.id} className="bg-surface-container-lowest rounded-lg shadow-sm p-4 min-h-[64px] flex items-center justify-between border border-outline-variant/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center">
                  <Icon name="calendar_today" className="text-primary text-[20px]" />
                </div>
                <div>
                  <div className="font-semibold text-lg text-on-surface">{p.datePaid}</div>
                  <div className="text-on-surface-variant">Monthly Rent</div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-xl font-semibold text-on-surface">{formatCurrency(p.amount)}</div>
                <div className="bg-primary text-on-primary text-sm px-3 py-1 rounded-full uppercase mt-1">Paid</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/30 p-container-padding shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-40 md:static md:bg-transparent md:border-0 md:shadow-none md:p-0">
        <div className="max-w-[800px] mx-auto">
          <Link
            to={`/log-payment?tenantId=${tenant.id}`}
            className="w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
          >
            <Icon name="add_circle" className="text-[22px]" />
            Log a payment
          </Link>
        </div>
      </div>
    </>
  )
}
