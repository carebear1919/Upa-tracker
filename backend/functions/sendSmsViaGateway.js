// Relays reminder text to the SMS Gateway Android app running on her phone
// (section 5.3.2) so the message goes out on her own SIM, no per-message fee.
async function sendSmsViaGateway(tenant, message) {
  const gatewayUrl = process.env.SMS_GATEWAY_URL
  if (!gatewayUrl) throw new Error('SMS_GATEWAY_URL not configured')

  const res = await fetch(`${gatewayUrl}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumbers: [tenant.phone], message }),
  })
  if (!res.ok) throw new Error(`SMS gateway responded ${res.status}`)
}

module.exports = { sendSmsViaGateway }
