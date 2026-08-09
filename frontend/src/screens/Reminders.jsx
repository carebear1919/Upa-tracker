import { useState } from 'react'
import { useStore, db, currentMonth, paymentStatus, daysUntilDue, dueUrgency, lastReminder, formatCurrency } from '../lib/store.js'
import { fillReminderTemplate } from '../lib/messageLinks.js'
import Icon from '../components/Icon.jsx'
import Chip from '../components/Chip.jsx'
import EmptyState from '../components/EmptyState.jsx'
import DueBadge from '../components/DueBadge.jsx'
import PropertyPhoto from '../components/PropertyPhoto.jsx'
import RemindButton from '../components/RemindButton.jsx'

const DOT_BY_URGENCY = {
  overdue: 'bg-secondary',
  today: 'bg-secondary',
  soon: 'bg-tertiary',
  later: 'bg-outline-variant',
}

function MessageFormatEditor({ template }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(template)
  const [saved, setSaved] = useState(false)

  function save(e) {
    e.preventDefault()
    db.updateSettings({ reminderTemplate: value })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const preview = fillReminderTemplate(value, { name: 'Alice', amount: formatCurrency(12000), dueDay: 5 })

  return (
    <section className="bg-surface-container-lowest shadow-level-1 rounded-xl p-6 flex flex-col gap-3 w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 text-left"
      >
        <span className="text-lg font-semibold text-on-surface flex items-center gap-2">
          <Icon name="edit" className="text-[20px]" />
          Message Format
        </span>
        <Icon name={open ? 'chevron_left' : 'chevron_right'} className="text-[20px] text-on-surface-variant" />
      </button>
      {!open && <p className="text-on-surface-variant text-sm">Same wording is used for every tenant's reminder. Tap to edit.</p>}
      {open && (
        <form onSubmit={save} className="flex flex-col gap-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="w-full border-2 border-outline-variant rounded-lg px-4 py-3 text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary"
          />
          <p className="text-sm text-on-surface-variant">
            Use <code className="font-semibold">{'{name}'}</code>, <code className="font-semibold">{'{amount}'}</code>, and{' '}
            <code className="font-semibold">{'{due_day}'}</code> — they'll be swapped in per tenant.
          </p>
          <div className="bg-surface-container-low rounded-lg p-3 text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface-variant">Preview: </span>
            {preview}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-container transition-colors">
              Save
            </button>
            {saved && <span className="text-primary font-semibold text-sm">Saved!</span>}
          </div>
        </form>
      )}
    </section>
  )
}

export default function Reminders() {
  const { tenants, payments, reminders, settings } = useStore()
  const month = currentMonth()
  const today = new Date()

  const due = tenants
    .map((t) => ({ tenant: t, diff: daysUntilDue(t.dueDay, today), ...paymentStatus(t, payments, month) }))
    .filter((x) => x.status !== 'paid' && x.diff <= 3)
    .sort((a, b) => a.diff - b.diff)

  function markPaid(tenant, balance) {
    db.addPayment({
      tenantId: tenant.id,
      amount: balance,
      datePaid: today.toISOString().slice(0, 10),
      monthCovered: month,
    })
  }

  return (
    <>
      <div className="w-full mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Upcoming Reminders</h1>
        <p className="text-on-surface-variant">Manage your upcoming rent collections and tenant communications.</p>
      </div>

      {due.length === 0 && (
        <EmptyState
          icon="notifications"
          title={tenants.length === 0 ? 'No tenants yet' : "Nothing due soon"}
          message={
            tenants.length === 0
              ? 'Add a tenant to start getting rent-due reminders.'
              : "Everyone's on track — reminders will show up here as due dates approach."
          }
          actionLabel={tenants.length === 0 ? 'Add a Tenant' : undefined}
          actionTo={tenants.length === 0 ? '/tenants' : undefined}
        />
      )}

      {due.map(({ tenant, diff, status, balance }) => {
        const urgency = dueUrgency(diff)
        const reminded = lastReminder(reminders, tenant.id, month)

        return (
          <div
            key={tenant.id}
            className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div className="flex items-start gap-4">
              <div className={`w-4 h-4 rounded-full mt-2 flex-shrink-0 ${DOT_BY_URGENCY[urgency]}`} aria-hidden />
              <PropertyPhoto photo={tenant.photo} size={56} />
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-xl font-semibold text-on-background">{tenant.name}</h2>
                  <DueBadge dueDay={tenant.dueDay} />
                  {status === 'partial' && <Chip tone="tertiary" size="md">Partial</Chip>}
                </div>
                <p className="text-on-surface-variant">Due on day {tenant.dueDay}</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {tenant.unit ? `Unit ${tenant.unit} - ` : ''}{formatCurrency(balance)} left of {formatCurrency(tenant.monthlyRent)}
                </p>
                {reminded && (
                  <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                    <Icon name="check_circle" className="text-[14px]" />
                    Reminded via {reminded.channel === 'sms' ? 'text' : 'Messenger'} on{' '}
                    {new Date(reminded.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-wrap items-start sm:items-center">
              <RemindButton tenant={tenant} balance={balance} template={settings.reminderTemplate} />
              <button
                onClick={() => markPaid(tenant, balance)}
                className="flex-1 sm:flex-none border-2 border-outline text-on-surface font-semibold px-6 py-3 rounded-full min-h-tap-target-min flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
              >
                <Icon name="check_circle" className="text-[22px]" />
                {status === 'partial' ? 'Mark Balance Paid' : 'Mark as Paid'}
              </button>
            </div>
          </div>
        )
      })}

      <MessageFormatEditor template={settings.reminderTemplate} />
    </>
  )
}
