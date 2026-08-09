import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore, db, formatCurrency, currentMonth, paymentStatus, PROPERTY_TYPES, PROPERTY_TYPE_ICON } from '../lib/store.js'
import { messengerLink as buildMessengerLink, fillReminderTemplate } from '../lib/messageLinks.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import IconButton from '../components/IconButton.jsx'
import PhotoPicker from '../components/PhotoPicker.jsx'

// Facebook doesn't support pre-filling message text on m.me links for a
// regular chat open (only ad/plugin contexts) — copy it so it's a paste, not retyping.
function copyMessage(message, setCopied) {
  navigator.clipboard?.writeText(message).then(
    () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    },
    () => {},
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

function TenantMenu({ tenant, onDelete }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function close() {
    setOpen(false)
    setConfirming(false)
  }

  return (
    <div className="relative">
      <IconButton icon="more_vert" aria-label="Tenant options" onClick={() => setOpen((o) => !o)} />
      {open && (
        <Card padding="md" className="absolute z-30 top-full mt-2 right-0 w-64 shadow-level-2 flex flex-col gap-3">
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex items-center gap-2 text-secondary font-semibold"
            >
              <Icon name="delete_forever" className="text-[20px]" />
              Delete this tenant
            </button>
          ) : (
            <>
              <span className="text-sm text-secondary font-medium">
                Delete {tenant.name} and their payment history? This can't be undone.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex-1 bg-error text-on-error px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  )
}

export default function TenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tenants, payments, settings } = useStore()
  const tenant = tenants.find((t) => t.id === id)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [copied, setCopied] = useState(false)

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

  const { balance } = paymentStatus(tenant, payments, currentMonth())
  const reminderMessage = fillReminderTemplate(settings.reminderTemplate, {
    name: tenant.name,
    amount: formatCurrency(balance),
    dueDay: tenant.dueDay,
  })

  function startEditing() {
    setForm({
      name: tenant.name,
      property: tenant.property,
      unit: tenant.unit ?? '',
      monthlyRent: tenant.monthlyRent,
      dueDay: tenant.dueDay,
      phone: tenant.phone ?? '',
      messengerLink: tenant.messengerLink ?? '',
      photo: tenant.photo ?? null,
      propertyType: tenant.propertyType ?? 'Housing',
    })
    setEditing(true)
  }

  function saveEdit(e) {
    e.preventDefault()
    db.updateTenant(tenant.id, {
      ...form,
      monthlyRent: Number(form.monthlyRent),
      dueDay: Number(form.dueDay),
    })
    setEditing(false)
  }

  function deleteTenant() {
    db.removeTenant(tenant.id)
    navigate('/tenants')
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
          <div className="flex items-center gap-1">
            <button
              onClick={startEditing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors min-h-tap-target-min"
            >
              <Icon name="edit" className="text-[20px]" />
              Edit
            </button>
            <TenantMenu tenant={tenant} onDelete={deleteTenant} />
          </div>
        )}
      </div>

      {editing ? (
        <Card className="w-full">
          <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Field label="Property Photo (optional)" className="md:col-span-2">
              <PhotoPicker photo={form.photo} onChange={(photo) => setForm({ ...form, photo })} />
            </Field>
            <Field label="Type" className="md:col-span-2">
              <div className="flex gap-3">
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
            </Field>
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
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="For text message reminders" />
            </Field>
            <Field label="Messenger / Facebook (optional)" className="md:col-span-2">
              <input
                value={form.messengerLink}
                onChange={(e) => setForm({ ...form, messengerLink: e.target.value })}
                className={inputCls}
                placeholder="Username, m.me link, or Facebook profile link"
              />
            </Field>
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" className="flex-1 bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg hover:bg-primary-container transition-colors">
                Save Changes
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-6 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <Card padding="none" className="w-full overflow-hidden">
          <div className="w-full aspect-video max-h-56 bg-surface-variant flex items-center justify-center">
            {tenant.photo ? (
              <img src={tenant.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <Icon name="apartment" className="text-[56px] text-on-surface-variant" />
            )}
          </div>
          <div className="p-6 flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-on-surface">{tenant.name}</h2>
              <Chip size="sm" tone="neutral" icon={PROPERTY_TYPE_ICON[tenant.propertyType ?? 'Housing']}>
                {tenant.propertyType ?? 'Housing'}
              </Chip>
            </div>
            <p className="text-on-surface-variant flex items-center gap-2">
              <Icon name="apartment" className="text-[20px]" />
              {tenant.unit ? `Unit ${tenant.unit} - ` : ''}
              {tenant.property}
            </p>
            <p className="text-on-surface-variant">{formatCurrency(tenant.monthlyRent)}/mo · due day {tenant.dueDay}</p>
            {(tenant.phone || tenant.messengerLink) && (
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {tenant.phone && (
                  <a href={`tel:${tenant.phone}`} className="bg-surface-container-high hover:bg-surface-variant text-on-surface rounded-lg py-3 px-6 flex items-center justify-center gap-2 transition-colors">
                    <Icon name="call" className="text-[20px]" />
                    <span className="font-semibold">Call</span>
                  </a>
                )}
                {tenant.messengerLink && (
                  <div className="flex flex-col items-center gap-1">
                    <a
                      href={buildMessengerLink(tenant.messengerLink, reminderMessage)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => copyMessage(reminderMessage, setCopied)}
                      className="bg-surface-container-high hover:bg-surface-variant text-on-surface rounded-lg py-3 px-6 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Icon name="forum" className="text-[20px]" />
                      <span className="font-semibold">Message</span>
                    </a>
                    <span className="text-xs text-on-surface-variant">
                      {copied ? 'Copied! Paste it in the chat.' : 'Message copies when you tap this'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      <section>
        <h3 className="text-xl font-semibold text-on-surface mb-4">Payment History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {history.length === 0 && <p className="text-on-surface-variant md:col-span-2">No payments logged yet.</p>}
          {history.map((p) => (
            <Card key={p.id} variant="nested" padding="md" className="min-h-[64px] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center">
                  <Icon name="calendar_today" className="text-primary text-[20px]" />
                </div>
                <div>
                  <div className="font-semibold text-lg text-on-surface">{p.datePaid}</div>
                  <div className="text-on-surface-variant">Monthly Rent</div>
                </div>
              </div>
              <div className="text-xl font-semibold text-on-surface">{formatCurrency(p.amount)}</div>
            </Card>
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
