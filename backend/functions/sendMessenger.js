// Sends via Facebook Messenger recurring notifications (section 5.3.1) —
// free, automatic, once the tenant has opted in through the family Page.
async function sendMessenger(tenant, message) {
  const pageToken = process.env.FB_PAGE_ACCESS_TOKEN
  if (!pageToken) throw new Error('FB_PAGE_ACCESS_TOKEN not configured')
  if (!tenant.messengerPsid) throw new Error(`Tenant ${tenant.id} has no Messenger PSID on file`)

  const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${pageToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: tenant.messengerPsid },
      message: { text: message },
      messaging_type: 'MESSAGE_TAG',
      tag: 'CONFIRMED_EVENT_UPDATE',
    }),
  })
  if (!res.ok) throw new Error(`Messenger API responded ${res.status}`)
}

module.exports = { sendMessenger }
