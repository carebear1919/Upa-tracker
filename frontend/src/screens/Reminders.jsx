import { useStore, db, currentMonth, paymentStatus, formatCurrency, daysUntilDue, dueUrgency } from '../lib/store.js'
import { smsLink, messengerLink, dueReminderMessage } from '../lib/messageLinks.js'
import Icon from '../components/Icon.jsx'
import EmptyState from '../components/EmptyState.jsx'
import DueBadge from '../components/DueBadge.jsx'

const DOT_BY_URGENCY = {
  overdue: 'bg-secondary',
  today: 'bg-secondary',
  soon: 'bg-tertiary',
  later: 'bg-outline-variant',
}

const CHANNEL_ICON = { messenger: 'forum', sms: 'sms', manual: 'person' }
const CHANNEL_LABEL = { messenger: 'Sends via Messenger', sms: 'Sends via Text Message', manual: 'Needs manual follow-up' }

export default function Reminders() {
  const { tenants, payments } = useStore()
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
        const message = dueReminderMessage(tenant.name, balance, `day ${tenant.dueDay}`)
        const link =
          tenant.notificationChannel === 'sms' ? smsLink(tenant.phone, message) : messengerLink(null, message)
        const urgency = dueUrgency(diff)

        return (
          <div
            key={tenant.id}
            className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div className="flex items-start gap-4">
              <div className={`w-4 h-4 rounded-full mt-2 flex-shrink-0 ${DOT_BY_URGENCY[urgency]}`} aria-hidden />
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-xl font-semibold text-on-background">{tenant.name}</h2>
                  <DueBadge dueDay={tenant.dueDay} />
                  {status === 'partial' && (
                    <span className="text-sm font-semibold uppercase px-3 py-1 rounded-full bg-tertiary text-on-tertiary">
                      Partial
                    </span>
                  )}
                </div>
                <p className="text-on-surface-variant">Due on day {tenant.dueDay}</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {tenant.unit ? `Unit ${tenant.unit} - ` : ''}{formatCurrency(balance)} left of {formatCurrency(tenant.monthlyRent)}
                </p>
                <div className="flex items-center gap-2 mt-3 text-on-surface-variant text-sm">
                  <Icon name={CHANNEL_ICON[tenant.notificationChannel]} className="text-[18px]" />
                  {CHANNEL_LABEL[tenant.notificationChannel]}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {link ? (
                <a
                  href={link}
                  className="flex-1 sm:flex-none bg-secondary text-on-secondary font-semibold px-6 py-4 rounded-full min-h-tap-target-min flex items-center justify-center gap-2 hover:bg-secondary-container transition-colors shadow-level-2"
                >
                  <Icon name="chat" className="text-[22px]" />
                  Send Message
                </a>
              ) : (
                <span className="flex-1 sm:flex-none border-2 border-outline-variant text-on-surface-variant font-semibold px-6 py-4 rounded-full flex items-center justify-center gap-2">
                  No contact info
                </span>
              )}
              <button
                onClick={() => markPaid(tenant, balance)}
                className="flex-1 sm:flex-none border-2 border-outline text-on-surface font-semibold px-6 py-4 rounded-full min-h-tap-target-min flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
              >
                <Icon name="check_circle" className="text-[22px]" />
                {status === 'partial' ? 'Mark Balance Paid' : 'Mark as Paid'}
              </button>
            </div>
          </div>
        )
      })}
    </>
  )
}
