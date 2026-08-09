// Sends via Facebook Messenger recurring notifications (project spec section
// 5.3.1) — free, automatic, once the tenant has opted in through the family
// Page. Needs the tenant's Page-Scoped ID (PSID), captured via the opt-in
// webhook flow — separate from tenant.messenger_link, which is the manual
// profile/m.me link the app uses for one-tap sending from the Reminders screen.
export async function sendMessenger(psid: string, message: string) {
  const pageToken = Deno.env.get('FB_PAGE_ACCESS_TOKEN')
  if (!pageToken) throw new Error('FB_PAGE_ACCESS_TOKEN secret not set')

  const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${pageToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: psid },
      message: { text: message },
      messaging_type: 'MESSAGE_TAG',
      tag: 'CONFIRMED_EVENT_UPDATE',
    }),
  })
  if (!res.ok) throw new Error(`Messenger API responded ${res.status}`)
}
