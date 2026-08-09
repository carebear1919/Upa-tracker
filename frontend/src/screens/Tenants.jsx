import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, db, currentMonth, paymentStatus, formatCurrency, PROPERTY_TYPES, PROPERTY_TYPE_ICON } from '../lib/store.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import DueBadge from '../components/DueBadge.jsx'
import PropertyPhoto from '../components/PropertyPhoto.jsx'
import PhotoPicker from '../components/PhotoPicker.jsx'

const emptyForm = { name: '', property: '', unit: '', monthlyRent: '', dueDay: '', phone: '', messengerLink: '', photo: null, propertyType: 'Housing' }

export default function Tenants() {
  const { tenants, payments } = useStore()
  const month = currentMonth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState('All')

  const visibleTenants = filter === 'All' ? tenants : tenants.filter((t) => (t.propertyType ?? 'Housing') === filter)

  function submit(e) {
    e.preventDefault()
    db.addTenant({
      ...form,
      monthlyRent: Number(form.monthlyRent),
      dueDay: Number(form.dueDay),
    })
    setForm(emptyForm)
    setShowForm(false)
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-background mb-1">Tenants</h1>
          <p className="text-on-surface-variant">Tap a tenant to see their history, or add a new one below.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-primary text-on-primary font-semibold px-6 py-3 rounded-full min-h-tap-target-min flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Icon name="add" className="text-[20px]" />
          Add Tenant
        </button>
      </div>

      {showForm && (
        <Card className="w-full">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormGroup label="Photo & Type">
              <PhotoPicker photo={form.photo} onChange={(photo) => setForm({ ...form, photo })} />
              <div className="flex gap-3 mt-3">
                {PROPERTY_TYPES.map((type) => (
                  <Chip
                    key={type}
                    variant="selector"
                    tone="primary"
                    icon={PROPERTY_TYPE_ICON[type]}
                    selected={form.propertyType === type}
                    onClick={() => setForm({ ...form, propertyType: type })}
                    className="flex-1"
                  >
                    {type}
                  </Chip>
                ))}
              </div>
            </FormGroup>

            <FormGroup label="Basic Info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Name">
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Property">
                  <input required value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Unit (optional)">
                  <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputCls} />
                </Field>
              </div>
            </FormGroup>

            <FormGroup label="Rent & Due Date">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Monthly Rent">
                  <input required type="number" min="0" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Due Day (1-31)">
                  <input required type="number" min="1" max="31" value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} className={inputCls} />
                </Field>
              </div>
            </FormGroup>

            <FormGroup label="Contact">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Phone (optional)">
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="For text message reminders" />
                </Field>
                <Field label="Messenger / Facebook (optional)">
                  <input
                    value={form.messengerLink}
                    onChange={(e) => setForm({ ...form, messengerLink: e.target.value })}
                    className={inputCls}
                    placeholder="Username, m.me link, or Facebook profile link"
                  />
                </Field>
              </div>
            </FormGroup>

            <button type="submit" className="md:col-span-2 w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg mt-2 hover:bg-primary-container transition-colors">
              Save Tenant
            </button>
          </form>
        </Card>
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

      {tenants.length > 0 && (
        <>
          <div className="flex gap-2 w-full overflow-x-auto pb-1">
            {['All', ...PROPERTY_TYPES].map((type) => {
              const count = type === 'All' ? tenants.length : tenants.filter((t) => (t.propertyType ?? 'Housing') === type).length
              return (
                <Chip
                  key={type}
                  variant="filter"
                  tone="primary"
                  selected={filter === type}
                  icon={type !== 'All' ? PROPERTY_TYPE_ICON[type] : undefined}
                  count={count}
                  onClick={() => setFilter(type)}
                >
                  {type}
                </Chip>
              )
            })}
          </div>

          <SectionHeader title="All Tenants" icon="group" className="mt-2" />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full items-start">
        {visibleTenants.length === 0 && tenants.length > 0 && (
          <p className="text-on-surface-variant py-8 text-center lg:col-span-2">No {filter.toLowerCase()} tenants yet.</p>
        )}
        {visibleTenants.map((t) => {
          const { status, balance } = paymentStatus(t, payments, month)
          const type = t.propertyType ?? 'Housing'
          return (
            <Link
              key={t.id}
              to={`/tenants/${t.id}`}
              className="bg-surface-container-lowest shadow-level-1 rounded-xl p-4 min-h-[64px] flex items-center justify-between hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <PropertyPhoto photo={t.photo} size={48} />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-on-surface truncate">{t.name}</span>
                    <Chip size="sm" tone="neutral" icon={PROPERTY_TYPE_ICON[type]} className="flex-shrink-0">
                      {type}
                    </Chip>
                  </div>
                  <span className="text-on-surface-variant truncate">
                    {t.unit ? `Unit ${t.unit} - ` : ''}
                    {t.property} · {formatCurrency(t.monthlyRent)}/mo
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {status === 'paid' && (
                  <Chip tone="primary" size="md">Paid</Chip>
                )}
                {status === 'partial' && (
                  <Chip tone="tertiary" size="md">Partial</Chip>
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

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="font-semibold text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}

function FormGroup({ label, children }) {
  return (
    <div className="md:col-span-2 flex flex-col gap-3 pb-4 border-b border-outline-variant/30 last:border-b-0 last:pb-0">
      <span className="text-sm font-bold uppercase tracking-wide text-on-surface-variant/70">{label}</span>
      {children}
    </div>
  )
}
