import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, db, formatCurrency } from '../lib/store.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'
import IconButton from '../components/IconButton.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PropertyPhoto from '../components/PropertyPhoto.jsx'

const inputCls = 'min-h-[48px] border-2 border-outline-variant rounded-lg px-3 text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

function PaymentRow({ payment, tenant }) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [form, setForm] = useState({ amount: payment.amount, datePaid: payment.datePaid })

  function save(e) {
    e.preventDefault()
    db.updatePayment(payment.id, {
      amount: Number(form.amount),
      datePaid: form.datePaid,
      monthCovered: form.datePaid.slice(0, 7),
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <form onSubmit={save} className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="Amount" />
          <input required type="date" value={form.datePaid} onChange={(e) => setForm({ ...form, datePaid: e.target.value })} className={inputCls} />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="bg-primary text-on-primary px-5 py-2 rounded-lg font-semibold hover:bg-primary-container transition-colors">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="text-on-surface-variant font-semibold hover:underline">Cancel</button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-outline-variant/30 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <PropertyPhoto photo={tenant?.photo} size={40} />
        <div className="min-w-0">
          <div className="font-semibold text-on-surface truncate">{tenant?.name ?? 'Unknown tenant'}</div>
          <div className="text-sm text-on-surface-variant">{payment.datePaid}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-semibold text-primary">{formatCurrency(payment.amount)}</span>
        {!confirmingDelete ? (
          <>
            <IconButton icon="edit" aria-label="Edit payment" onClick={() => setEditing(true)} iconClassName="text-[18px]" />
            <IconButton icon="delete_forever" aria-label="Delete payment" variant="danger" onClick={() => setConfirmingDelete(true)} iconClassName="text-[18px]" />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => db.removePayment(payment.id)} className="text-error font-semibold text-sm hover:underline">Delete</button>
            <button onClick={() => setConfirmingDelete(false)} className="text-on-surface-variant font-semibold text-sm hover:underline">Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Payments() {
  const { tenants, payments } = useStore()
  const [tenantFilter, setTenantFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')

  const filtered = payments
    .filter((p) => tenantFilter === 'all' || p.tenantId === tenantFilter)
    .filter((p) => monthFilter === 'all' || p.monthCovered === monthFilter)
    .sort((a, b) => b.datePaid.localeCompare(a.datePaid))

  const total = filtered.reduce((s, p) => s + Number(p.amount), 0)

  function tenantFor(id) {
    return tenants.find((t) => t.id === id)
  }

  return (
    <>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-on-background mb-1">Payments</h1>
        <p className="text-on-surface-variant">Every rent payment ever logged, across all tenants. Filter below to find one.</p>
      </div>

      {tenants.length === 0 ? (
        <EmptyState
          icon="payments"
          title="No tenants yet"
          message="Add a tenant first, then payments you log for them will show up here."
          actionLabel="Add a Tenant"
          actionTo="/tenants"
        />
      ) : (
        <>
          <Card className="flex items-center justify-between w-full">
            <div>
              <div className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
                {filtered.length} payment{filtered.length === 1 ? '' : 's'}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-primary">{formatCurrency(total)}</div>
            </div>
            <Icon name="payments" className="text-primary text-[32px]" />
          </Card>

          <Card className="flex flex-col gap-4 w-full">
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex flex-col gap-1 flex-1">
                <span className="font-semibold text-on-surface-variant">Tenant</span>
                <select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} className={inputCls}>
                  <option value="all">All tenants</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 flex-1">
                <span className="font-semibold text-on-surface-variant">Month</span>
                <input
                  type="month"
                  value={monthFilter === 'all' ? '' : monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value || 'all')}
                  className={inputCls}
                />
                {monthFilter !== 'all' && (
                  <button type="button" onClick={() => setMonthFilter('all')} className="text-sm text-primary font-semibold hover:underline self-start mt-1">
                    Clear month filter
                  </button>
                )}
              </label>
            </div>
          </Card>

          <Card className="flex flex-col w-full">
            {filtered.length === 0 ? (
              <p className="text-on-surface-variant text-center py-8">No payments match these filters.</p>
            ) : (
              filtered.map((p) => <PaymentRow key={p.id} payment={p} tenant={tenantFor(p.tenantId)} />)
            )}
          </Card>

          <Link
            to="/log-payment"
            className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-primary text-on-primary w-14 h-14 rounded-full shadow-level-2 flex items-center justify-center hover:bg-primary-container transition-colors z-40"
            aria-label="Log a payment"
          >
            <Icon name="add" className="text-[26px]" />
          </Link>
        </>
      )}
    </>
  )
}
