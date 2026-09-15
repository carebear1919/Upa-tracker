// Builds one-tap fallback links for the manual reminder channel (section 5.3.3).
export function smsLink(phone, message) {
  if (!phone) return null
  return `sms:${phone}?body=${encodeURIComponent(message)}`
}

// tenant.messengerLink can be a plain m.me username, an m.me/facebook.com URL,
// or just a username — normalize to a clickable link. Only m.me links support
// pre-filling the message text; other Facebook links just open as-is.
export function messengerLink(link, message) {
  if (!link) return null
  const trimmed = link.trim()
  if (!trimmed) return null

  const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://m.me/${trimmed.replace(/^@/, '')}`

  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'm.me') {
      parsed.searchParams.set('text', message)
      return parsed.toString()
    }
    return url
  } catch {
    return null
  }
}

export const DEFAULT_REMINDER_TEMPLATE =
  'Hello, remind ko lang sana ung due payment mo na {amount} this {month} {due_day} salamat!'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// One template, set once in Settings/Reminders, used for every tenant's
// reminder — no per-tenant wording to manage. {amount} comes pre-formatted
// with the ₱ sign so the template author doesn't have to add it. {month} is
// filled with the current month's name (same wording for every tenant).
export function fillReminderTemplate(template, { name, amount, dueDay, month }) {
  const monthName = month ?? MONTH_NAMES[new Date().getMonth()]
  return template
    .replaceAll('{name}', name)
    .replaceAll('{amount}', amount)
    .replaceAll('{due_day}', String(dueDay))
    .replaceAll('{month}', monthName)
}
