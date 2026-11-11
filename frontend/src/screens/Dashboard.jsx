import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, db, currentMonth, paymentStatus, formatCurrency, balanceThroughMonth, balancesByMethod, PAYMENT_METHODS, daysUntilDue, dueUrgency, lastReminder } from '../lib/store.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import DueBadge from '../components/DueBadge.jsx'
import PropertyPhoto from '../components/PropertyPhoto.jsx'
import RemindButton from '../components/RemindButton.jsx'

// Rent that needs attention gets a tinted card and a thin full outline; the
// DueBadge carries the exact wording so color is never the only signal.
const CARD_TINT_BY_URGENCY = {
  overdue: 'bg-surface-urgent ring-1 ring-secondary/40',
  today: 'bg-surface-urgent ring-1 ring-secondary/40',
  soon: 'bg-surface-soon ring-1 ring-tertiary/40',
  later: 'bg-surface-container-lowest',
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
          className="flex items-center justify-center w-11 h-11 -mr-2 -mt-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
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
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full min-h-[40px] border-2 border-outline rounded-lg px-2 text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary"
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
  const { tenants, payments, expenses, withdrawals, transfers, settings, reminders } = useStore()
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
  const monthWithdrawn = withdrawals
    .filter((w) => w.date.startsWith(month))
    .reduce((sum, w) => sum + Number(w.amount), 0)
  const balance = balanceThroughMonth(payments, expenses, month, settings.openingBalance, withdrawals)
  const { pots, unassigned } = balancesByMethod(payments, withdrawals, transfers, month, expenses, settings.openingBalance)
  const pct = expected ? Math.round((collected / expected) * 100) : 0

  const unpaid = tenants
    .map((t) => ({ tenant: t, ...paymentStatus(t, payments, month) }))
    .filter((x) => x.status !== 'paid')
    .sort((a, b) => daysUntilDue(a.tenant.dueDay) - daysUntilDue(b.tenant.dueDay))

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-on-background mb-2">Dashboard</h1>

      <Card className="flex flex-col gap-6 w-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-lg text-on-surface-variant">Money Left</p>
            <p className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{formatCurrency(balance)}</p>
            <p className="text-sm text-on-surface-variant mt-1">Carried forward, all months</p>
          </div>
          <StartingBalanceEditor settings={settings} />
        </div>

        <dl className="grid grid-cols-3 divide-x divide-outline-variant/40 border-t border-outline-variant/40 pt-5">
          <div className="pr-3 sm:pr-5">
            <dt className="text-sm sm:text-base font-semibold text-on-surface-variant">Rent Collected</dt>
            <dd className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(collected)}</dd>
          </div>
          <div className="px-3 sm:px-5">
            <dt className="text-sm sm:text-base font-semibold text-on-surface-variant">Expenses</dt>
            <dd className="text-xl sm:text-2xl font-bold text-secondary">{formatCurrency(monthExpenses)}</dd>
          </div>
          <div className="pl-3 sm:pl-5">
            <dt className="text-sm sm:text-base font-semibold text-on-surface-variant">Withdrawn</dt>
            <dd className="text-xl sm:text-2xl font-bold text-on-background">{formatCurrency(monthWithdrawn)}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2">
          <div
            className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(pct, 100)}
            aria-label="Rent collected this month"
          >
            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="text-sm text-on-surface-variant">{pct}% of the {formatCurrency(expected)} expected rent collected</span>
        </div>
      </Card>

      <section className="grid grid-cols-3 gap-3 w-full" aria-label="Quick actions">
        <Link
          to="/log-payment"
          className="min-h-[88px] md:min-h-tap-target-min bg-primary text-on-primary rounded-xl p-3 flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3 shadow-level-2 active:scale-[0.98] transition-transform"
        >
          <Icon name="payments" className="text-[28px]" />
          <span className="font-semibold md:text-lg text-center leading-tight">Log Rent</span>
        </Link>
        <Link
          to="/add-expense"
          className="min-h-[88px] md:min-h-tap-target-min bg-surface-container-lowest text-on-surface border-2 border-outline rounded-xl p-3 flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3 hover:bg-surface-container-high active:scale-[0.98] transition"
        >
          <Icon name="receipt_long" className="text-[28px] text-secondary" />
          <span className="font-semibold md:text-lg text-center leading-tight">Add Expense</span>
        </Link>
        <Link
          to="/withdraw"
          className="min-h-[88px] md:min-h-tap-target-min bg-surface-container-lowest text-on-surface border-2 border-outline rounded-xl p-3 flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3 hover:bg-surface-container-high active:scale-[0.98] transition"
        >
          <Icon name="logout" className="text-[28px] text-on-surface-variant" />
          <span className="font-semibold md:text-lg text-center leading-tight">Withdraw</span>
        </Link>
      </section>

      <section className="flex flex-col gap-4 w-full">
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
                className={`shadow-level-1 rounded-xl p-4 flex flex-col gap-3 ${CARD_TINT_BY_URGENCY[urgency]}`}
              >
                <Link to={`/tenants/${t.id}`} className="flex items-center justify-between gap-3 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-3 min-w-0">
                    <PropertyPhoto photo={t.photo} size={48} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-lg text-on-surface truncate">{t.name}</span>
                      <span className="text-on-surface-variant break-words">
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

      <SectionHeader
        title="Where the Money Is"
        icon="payments"
        className="mt-2"
        action={{ label: 'Move money', to: '/move-money', icon: 'chevron_right' }}
      />
      <Card className="w-full flex flex-col gap-4">
        <dl className="grid grid-cols-3 divide-x divide-outline-variant/40">
          {PAYMENT_METHODS.map((m) => (
            <div key={m} className="px-3 sm:px-5 first:pl-0 last:pr-0">
              <dt className="text-sm sm:text-base font-semibold text-on-surface-variant">{m}</dt>
              <dd className="text-lg sm:text-xl font-bold text-on-background">{formatCurrency(pots[m])}</dd>
            </div>
          ))}
        </dl>
        {unassigned !== 0 && (
          <p className="text-sm text-on-surface-variant">
            Starting balance minus expenses ({formatCurrency(unassigned)}) isn't tied to Cash, GCash or Check. Add it to the
            three above and you get your {formatCurrency(balance)} Money Left.
          </p>
        )}
      </Card>

    </>
  )
}
