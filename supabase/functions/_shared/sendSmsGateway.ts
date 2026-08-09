// Relays reminder text to the SMS Gateway Android app running on her phone
// (project spec section 5.3.2) so the message goes out on her own SIM, no
// per-message fee. SMS_GATEWAY_URL is the gateway's public cloud-relay
// endpoint (not a local IP — Edge Functions can't reach her home Wi-Fi).
export async function sendSmsGateway(phone: string, message: string) {
  const gatewayUrl = Deno.env.get('SMS_GATEWAY_URL')
  const gatewayKey = Deno.env.get('SMS_GATEWAY_KEY')
  if (!gatewayUrl) throw new Error('SMS_GATEWAY_URL secret not set')

  const res = await fetch(`${gatewayUrl}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(gatewayKey ? { Authorization: `Bearer ${gatewayKey}` } : {}),
    },
    body: JSON.stringify({ phoneNumbers: [phone], message }),
  })
  if (!res.ok) throw new Error(`SMS gateway responded ${res.status}`)
}
