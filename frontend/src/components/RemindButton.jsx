import { useState } from 'react'
import { db, formatCurrency } from '../lib/store.js'
import { smsLink, messengerLink, fillReminderTemplate } from '../lib/messageLinks.js'
import Icon from './Icon.jsx'

// Sending happens in another app (Messenger/SMS) this app can't see into, so
// a reminder is only logged once the user explicitly confirms they sent it —
// never assumed just because they tapped the link.
function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {})
}

export default function RemindButton({ tenant, balance, template, size = 'md' }) {
  const [pendingChannel, setPendingChannel] = useState(null)
  const [justLogged, setJustLogged] = useState(null)

  const message = fillReminderTemplate(template, { name: tenant.name, amount: formatCurrency(balance), dueDay: tenant.dueDay })
  const fbHref = messengerLink(tenant.messengerLink, message)
  const smsHref = smsLink(tenant.phone, message)

  function confirmSent() {
    db.logReminder(tenant.id, pendingChannel)
    setJustLogged(pendingChannel)
    setPendingChannel(null)
    setTimeout(() => setJustLogged(null), 3000)
  }

  const btnCls =
    size === 'sm'
      ? 'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold min-h-[36px]'
      : 'flex items-center gap-2 px-5 py-3 rounded-full font-semibold min-h-tap-target-min'

  if (pendingChannel) {
    return (
      <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm text-on-surface-variant">Sent it?</span>
        <button
          type="button"
          onClick={confirmSent}
          className={`${btnCls} bg-primary text-on-primary hover:bg-primary-container transition-colors`}
        >
          <Icon name="check_circle" className="text-[18px]" />
          Yes, log it
        </button>
        <button
          type="button"
          onClick={() => setPendingChannel(null)}
          className="text-sm font-semibold text-on-surface-variant hover:underline"
        >
          Not yet
        </button>
      </div>
    )
  }

  if (justLogged) {
    return (
      <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
        <Icon name="check_circle" className="text-[18px]" />
        Reminder logged
      </span>
    )
  }

  if (!fbHref && !smsHref) {
    return <span className="text-sm text-on-surface-variant">No contact info on file</span>
  }

  return (
    <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
      {fbHref && (
        <a
          href={fbHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            copyToClipboard(message)
            setPendingChannel('messenger')
          }}
          className={`${btnCls} bg-secondary text-on-secondary hover:bg-secondary-container transition-colors`}
        >
          <Icon name="forum" className="text-[18px]" />
          Messenger
        </a>
      )}
      {smsHref && (
        <a
          href={smsHref}
          onClick={() => setPendingChannel('sms')}
          className={`${btnCls} bg-secondary text-on-secondary hover:bg-secondary-container transition-colors`}
        >
          <Icon name="sms" className="text-[18px]" />
          Text
        </a>
      )}
    </div>
  )
}
