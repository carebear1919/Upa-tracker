// Builds one-tap fallback links for the manual reminder channel (section 5.3.3).
export function smsLink(phone, message) {
  if (!phone) return null
  return `sms:${phone}?body=${encodeURIComponent(message)}`
}

export function messengerLink(psid, message) {
  if (!psid) return null
  return `https://m.me/${psid}?text=${encodeURIComponent(message)}`
}

export function dueReminderMessage(tenantName, amount, dueDay) {
  return `Hi ${tenantName}, this is a reminder that your rent of ₱${amount} is due on the ${dueDay}. Thank you!`
}
