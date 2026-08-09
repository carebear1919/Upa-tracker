// Scheduled daily (see supabase/migrations/0002_schedule_reminders.sql).
// Reads every household's tenants, cross-checks this month's payments, and
// sends a reminder through whichever channel is on file — Messenger (once a
// tenant has opted in and messenger_psid is set), else SMS, else the tenant
// is simply left for manual follow-up on the Reminders screen. A single
// daily sweep across every user (not per-tenant timers) keeps this simple
// and self-correcting if tenants or due dates change.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { sendSmsGateway } from '../_shared/sendSmsGateway.ts'
import { sendMessenger } from '../_shared/sendMessenger.ts'

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret && req.headers.get('x-cron-secret') !== cronSecret) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const today = new Date()
  const currentMonth = today.toISOString().slice(0, 7)

  const [{ data: tenants, error: tenantsErr }, { data: payments, error: paymentsErr }] = await Promise.all([
    supabase.from('tenants').select('*'),
    supabase.from('payments').select('tenant_id, amount').eq('month_covered', currentMonth),
  ])
  if (tenantsErr) throw tenantsErr
  if (paymentsErr) throw paymentsErr

  const paidByTenant = new Map<string, number>()
  for (const p of payments ?? []) {
    paidByTenant.set(p.tenant_id, (paidByTenant.get(p.tenant_id) ?? 0) + Number(p.amount))
  }

  const results: Array<{ tenantId: string; channel: string; ok: boolean }> = []

  for (const tenant of tenants ?? []) {
    const paid = paidByTenant.get(tenant.id) ?? 0
    if (paid >= Number(tenant.monthly_rent)) continue // fully paid this month

    const daysUntilDue = tenant.due_day - today.getDate()
    const stage = daysUntilDue === 3 ? 'upcoming' : daysUntilDue === 0 ? 'due' : daysUntilDue < 0 ? 'overdue' : null
    if (!stage) continue

    const balance = Number(tenant.monthly_rent) - paid
    const message = `Hi ${tenant.name}, this is a reminder that your rent of ₱${balance} is ${
      stage === 'overdue' ? 'now overdue' : `due on day ${tenant.due_day}`
    }. Thank you!`

    let channel: string | null = null
    try {
      if (tenant.messenger_psid) {
        await sendMessenger(tenant.messenger_psid, message)
        channel = 'messenger'
      } else if (tenant.phone) {
        await sendSmsGateway(tenant.phone, message)
        channel = 'sms'
      }
      // else: no channel on file — the app flags this tenant as "needs
      // reminder" via the Reminders screen, nothing silently fails.
    } catch (err) {
      results.push({ tenantId: tenant.id, channel: channel ?? 'unknown', ok: false })
      console.error(`Reminder failed for tenant ${tenant.id}:`, (err as Error).message)
      continue
    }

    if (channel) {
      await supabase.from('reminders').insert({
        user_id: tenant.user_id,
        tenant_id: tenant.id,
        channel,
        month: currentMonth,
      })
      results.push({ tenantId: tenant.id, channel, ok: true })
    }
  }

  return new Response(JSON.stringify({ sent: results.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
