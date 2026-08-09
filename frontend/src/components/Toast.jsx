import { useCallback, useRef, useState } from 'react'
import Icon from './Icon.jsx'

const DISMISS_MS = 2500

export function useToast() {
  const [message, setMessage] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((text) => {
    clearTimeout(timerRef.current)
    setMessage(text)
    timerRef.current = setTimeout(() => setMessage(null), DISMISS_MS)
  }, [])

  return [message, showToast]
}

export default function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-full shadow-level-2 text-sm font-semibold whitespace-nowrap">
      <Icon name="check_circle" className="text-[18px]" />
      {message}
    </div>
  )
}
