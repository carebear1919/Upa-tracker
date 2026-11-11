import { useState } from 'react'
import { useNotice, dismissNotice } from '../lib/notice.js'
import Icon from './Icon.jsx'

// Global confirmation / failure line, mounted once in App.
export default function Notices() {
  const notice = useNotice()
  const [retrying, setRetrying] = useState(false)

  if (!notice) return null

  if (notice.kind === 'success') {
    return (
      <div
        role="status"
        className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[70] max-w-[calc(100vw-2rem)] flex items-center gap-2 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-full shadow-level-2 text-sm font-semibold"
      >
        <Icon name="check_circle" className="text-[18px] flex-shrink-0" />
        {notice.text}
      </div>
    )
  }

  async function retry() {
    setRetrying(true)
    try {
      const ok = await notice.retry?.()
      if (ok) dismissNotice()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div
      role="alert"
      className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[70] bg-surface-urgent ring-1 ring-secondary/40 text-on-surface rounded-xl shadow-level-2 p-4 flex flex-col gap-3"
    >
      <p className="font-semibold">{notice.text}</p>
      <div className="flex items-center gap-4">
        {notice.retry && (
          <button
            onClick={retry}
            disabled={retrying}
            className="bg-secondary text-on-secondary min-h-tap-target-min px-5 rounded-lg font-semibold disabled:opacity-60"
          >
            {retrying ? 'Trying…' : 'Try again'}
          </button>
        )}
        <button onClick={dismissNotice} className="min-h-tap-target-min px-2 font-semibold text-on-surface-variant hover:underline">
          Dismiss
        </button>
      </div>
    </div>
  )
}
