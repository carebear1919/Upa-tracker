const { onSchedule } = require('firebase-functions/v2/scheduler')
const { getFirestore } = require('firebase-admin/firestore')
const { sendSmsViaGateway } = require('./sendSmsViaGateway')
const { sendMessenger } = require('./sendMessenger')

// Runs once daily (section 5.2). Reads every tenant's dueDay, cross-checks
// this month's payments, and sends a reminder through whichever channel the
// tenant has on file — Messenger first, then SMS, else flagged for manual follow-up.
const checkDueDates = onSchedule('every day 08:00', async () => {
  const db = getFirestore()
  const today = new Date()
  const currentMonth = today.toISOString().slice(0, 7)

  const [tenantsSnap, paymentsSnap] = await Promise.all([
    db.collection('tenants').get(),
    db.collection('payments').where('monthCovered', '==', currentMonth).get(),
  ])

  const paidTenantIds = new Set(paymentsSnap.docs.map((d) => d.data().tenantId))

  for (const doc of tenantsSnap.docs) {
    const tenant = { id: doc.id, ...doc.data() }
    if (paidTenantIds.has(tenant.id)) continue

    const daysUntilDue = tenant.dueDay - today.getDate()
    const stage = daysUntilDue === 3 ? 'upcoming' : daysUntilDue === 0 ? 'due' : daysUntilDue < 0 ? 'overdue' : null
    if (!stage) continue

    const message = `Hi ${tenant.name}, this is a reminder that your rent of ₱${tenant.monthlyRent} is ${
      stage === 'overdue' ? 'now overdue' : `due on day ${tenant.dueDay}`
    }. Thank you!`

    if (tenant.fbMessengerOptedIn) {
      await sendMessenger(tenant, message)
    } else if (tenant.phone) {
      await sendSmsViaGateway(tenant, message)
    }
    // else: no channel on file — app flags this tenant as "needs reminder" via the Reminders screen.
  }
})

module.exports = { checkDueDates }
