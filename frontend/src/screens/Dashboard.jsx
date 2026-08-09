import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, db, currentMonth, paymentStatus, formatCurrency, balanceThroughMonth, daysUntilDue, dueUrgency, lastReminder } from '../lib/store.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import DueBadge from '../components/DueBadge.jsx'
import PropertyPhoto from '../components/PropertyPhoto.jsx'
import RemindButton from '../components/RemindButton.jsx'

const CARD_TINT_BY_URGENCY = {
  overdue: 'border-secondary bg-[#fdeceb]',
  today: 'border-secondary bg-[#fdeceb]',
  soon: 'border-tertiary bg-[#f7f3e2]',
  later: 'border-outline-variant bg-surface-container-lowest',
}

function StartingBalanceEditor({ settings, standalone = false }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(settings.openingBalance ?? 0)

  function save(e) {
    e.preventDefault()
    db.updateSettings({ openingBalance: Number(value) || 0 })
    setOpen(false)
  }

  function openEditor() {
    setValue(settings.openingBalance ?? 0)
    setOpen((o) => !o)
  }

  return (
    <div className="relative inline-block">
      {standalone ? (
        <button
          onClick={openEditor}
          className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline mt-1"
        >
          <Icon name="edit" className="text-[16px]" />
          {settings.openingBalance ? 'Edit starting balance' : 'Already have money saved up? Add it here'}
        </button>
      ) : (
        <button
          onClick={openEditor}
          aria-label="Edit starting balance"
          className="flex items-center justify-center w-8 h-8 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <Icon name="edit" className="text-[15px]" />
        </button>
      )}
      {open && (
        <Card padding="md" className="absolute z-30 top-full mt-2 right-0 w-60 shadow-level-2">
          <form onSubmit={save} className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface-variant">Starting balance</label>
            <input
              autoFocus
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full min-h-[40px] border-2 border-outline-variant rounded-lg px-2 text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-3 mt-1">
              <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-on-surface-variant hover:underline">
                Cancel
              </button>
              <button type="submit" className="text-sm font-semibold text-primary hover:underline">
                Save
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { tenants, payments, expenses, settings, reminders } = useStore()
  const month = currentMonth()

  if (tenants.length === 0) {
    return (
      <>
        <h1 className="text-2xl md:text-3xl font-bold text-on-background mb-4">Dashboard</h1>
        <EmptyState
          icon="home"
          title="Welcome to Renta"
          message="Add your first tenant to start tracking rent collected, expenses, and money left."
          actionLabel="Add a Tenant"
          actionTo="/tenants"
        />
        <div className="flex justify-center -mt-2">
          <StartingBalanceEditor settings={settings} standalone />
        </div>
      </>
    )
  }

  const expected = tenants.reduce((sum, t) => sum + Number(t.monthlyRent), 0)
  const collected = payments
    .filter((p) => p.monthCovered === month)
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const monthExpenses = expenses
    .filter((e) => e.date.startsWith(month))
    .reduce((sum, e) => sum + Number(e.amount), 0)
  const balance = balanceThroughMonth(payments, expenses, month, settings.openingBalance)
  const pct = expected ? Math.round((collected / expected) * 100) : 0

  const unpaid = tenants
    .map((t) => ({ tenant: t, ...paymentStatus(t, payments, month) }))
    .filter((x) => x.status !== 'paid')
    .sort((a, b) => daysUntilDue(a.tenant.dueDay) - daysUntilDue(b.tenant.dueDay))

  return (
    <>
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-on-background mb-2">Dashboard</h1>
        <p className="text-on-surface-variant">This month's rent, expenses, and money left at a glance.</p>
      </div>

      <SectionHeader title="This Month" icon="assessment" />
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full">
        <Card className="flex flex-col gap-2">
          <span className="font-semibold text-lg text-on-surface-variant">Rent Collected</span>
          <span className="text-2xl md:text-3xl font-bold text-primary">{formatCurrency(collected)}</span>
          <div className="w-full bg-surface-container-highest rounded-full h-3 mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="text-sm text-on-surface-variant mt-1">{pct}% of expected ({formatCurrency(expected)})</span>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="font-semibold text-lg text-on-surface-variant">Expenses</span>
          <span className="text-2xl md:text-3xl font-bold text-secondary">{formatCurrency(monthExpenses)}</span>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <span className="font-semibold text-lg text-on-surface-variant">Money Left</span>
            <StartingBalanceEditor settings={settings} />
          </div>
          <span className="text-2xl md:text-3xl font-bold text-on-background">{formatCurrency(balance)}</span>
          <span className="text-on-surface-variant mt-auto pt-2">Carried forward, all months</span>
        </Card>
      </section>

      <SectionHeader title="Quick Actions" icon="add_circle" className="mt-2" />
      <section className="flex flex-col md:flex-row gap-gutter w-full">
        <Link
          to="/log-payment"
          className="w-full min-h-tap-target-min flex-1 bg-primary text-on-primary rounded-xl p-4 flex items-center justify-center gap-3 shadow-level-2 active:scale-95 transition-transform"
        >
          <Icon name="payments" className="text-[28px]" />
          <span className="font-semibold text-lg">Log Rent</span>
        </Link>
        <Link
          to="/add-expense"
          className="w-full min-h-tap-target-min flex-1 bg-secondary text-on-secondary rounded-xl p-4 flex items-center justify-center gap-3 shadow-level-2 active:scale-95 transition-transform"
        >
          <Icon name="receipt_long" className="text-[28px]" />
          <span className="font-semibold text-lg">Add Expense</span>
        </Link>
      </section>

      <Link
        to="/payments"
        className="flex items-center justify-between gap-2 bg-surface-container-lowest shadow-level-1 rounded-xl px-5 py-3 text-primary font-semibold hover:bg-surface-container-high transition-colors w-full"
      >
        <span className="flex items-center gap-2">
          <Icon name="payments" className="text-[18px]" />
          View all payments
        </span>
        <Icon name="chevron_right" className="text-[18px]" />
      </Link>

      <section className="flex flex-col gap-4 w-full mt-4">
        <SectionHeader title="Need to Pay" icon="notifications" />
        {unpaid.length === 0 && (
          <Card className="flex items-center gap-3">
            <Icon name="check_circle" className="text-primary text-[24px]" />
            <span className="text-on-surface-variant">Everyone's paid up this month.</span>
          </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          {unpaid.map(({ tenant: t, status, balance }) => {
            const urgency = dueUrgency(daysUntilDue(t.dueDay))
            const reminded = lastReminder(reminders, t.id, month)
            return (
              <div
                key={t.id}
                className={`shadow-level-1 rounded-xl p-4 flex flex-col gap-3 border-l-4 ${CARD_TINT_BY_URGENCY[urgency]}`}
              >
                <Link to={`/tenants/${t.id}`} className="flex items-center justify-between gap-3 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-3 min-w-0">
                    <PropertyPhoto photo={t.photo} size={48} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-lg text-on-surface truncate">{t.name}</span>
                      <span className="text-on-surface-variant truncate">
                        {t.unit ? `Unit ${t.unit} - ` : ''}
                        {t.property}
                      </span>
                      {status === 'partial' && (
                        <span className="text-sm font-semibold text-tertiary">Partially paid — {formatCurrency(balance)} left</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-semibold text-lg text-secondary">{formatCurrency(balance)}</span>
                    <DueBadge dueDay={t.dueDay} />
                  </div>
                </Link>
                <div className="border-t border-outline-variant/30 pt-3 flex items-center justify-between gap-2 flex-wrap">
                  <RemindButton tenant={t} balance={balance} template={settings.reminderTemplate} size="sm" />
                  {reminded && (
                    <span className="text-xs text-on-surface-variant">
                      Reminded {new Date(reminded.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
