import { Link } from 'react-router-dom'
import { useStore, currentMonth, paymentStatus, formatCurrency, balanceThroughMonth, daysUntilDue, dueUrgency } from '../lib/store.js'
import Icon from '../components/Icon.jsx'
import EmptyState from '../components/EmptyState.jsx'
import DueBadge from '../components/DueBadge.jsx'

const BORDER_BY_URGENCY = {
  overdue: 'border-secondary',
  today: 'border-secondary',
  soon: 'border-tertiary',
  later: 'border-outline-variant',
}

export default function Dashboard() {
  const { tenants, payments, expenses, settings } = useStore()
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
      <h1 className="text-2xl md:text-3xl font-bold text-on-background mb-4">Dashboard</h1>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full">
        <div className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-2">
          <span className="font-semibold text-lg text-on-surface-variant">Rent Collected</span>
          <span className="text-2xl md:text-3xl font-bold text-primary">{formatCurrency(collected)}</span>
          <div className="w-full bg-surface-container-highest rounded-full h-3 mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="text-sm text-on-surface-variant mt-1">{pct}% of expected ({formatCurrency(expected)})</span>
        </div>

        <div className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-2">
          <span className="font-semibold text-lg text-on-surface-variant">Expenses</span>
          <span className="text-2xl md:text-3xl font-bold text-secondary">{formatCurrency(monthExpenses)}</span>
        </div>

        <div className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-2">
          <span className="font-semibold text-lg text-on-surface-variant">Money Left</span>
          <span className="text-2xl md:text-3xl font-bold text-on-background">{formatCurrency(balance)}</span>
          <span className="text-on-surface-variant mt-auto pt-2">Carried forward, all months</span>
        </div>
      </section>

      <section className="flex flex-col md:flex-row gap-gutter w-full py-4">
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

      <section className="flex flex-col gap-4 w-full mt-4">
        <h2 className="text-xl font-semibold text-on-background">Need to Pay</h2>
        {unpaid.length === 0 && (
          <p className="text-on-surface-variant">Everyone's paid up this month.</p>
        )}
        <div className="flex flex-col gap-2">
          {unpaid.map(({ tenant: t, status, balance }) => {
            const urgency = dueUrgency(daysUntilDue(t.dueDay))
            return (
              <Link
                key={t.id}
                to={`/tenants/${t.id}`}
                className={`bg-surface shadow-level-1 rounded-xl p-4 min-h-[80px] flex items-center justify-between border-l-4 hover:bg-surface-container-low transition-colors ${BORDER_BY_URGENCY[urgency]}`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-on-surface">{t.name}</span>
                  <span className="text-on-surface-variant">
                    {t.unit ? `Unit ${t.unit} - ` : ''}
                    {t.property}
                  </span>
                  {status === 'partial' && (
                    <span className="text-sm font-semibold text-tertiary">Partially paid — {formatCurrency(balance)} left</span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-semibold text-lg text-secondary">{formatCurrency(balance)}</span>
                  <DueBadge dueDay={t.dueDay} />
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
