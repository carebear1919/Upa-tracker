import { useState } from 'react'
import { useStore, db } from '../lib/store.js'
import { hashPin, verifyPin } from '../lib/pin.js'
import Icon from '../components/Icon.jsx'

const MIN_LENGTH = 4
const MAX_LENGTH = 6
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

export default function PinLock({ onUnlock }) {
  const { settings } = useStore()
  const isFirstRun = !settings.pinHash
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState(null)
  const [error, setError] = useState('')

  async function handleComplete(value) {
    if (isFirstRun) {
      if (confirmPin === null) {
        setConfirmPin(value)
        setPin('')
        return
      }
      if (value !== confirmPin) {
        setError("PINs didn't match. Try again.")
        setConfirmPin(null)
        setPin('')
        return
      }
      db.updateSettings({ pinHash: await hashPin(value) })
      onUnlock()
      return
    }
    const ok = await verifyPin(value, settings.pinHash)
    if (ok) {
      onUnlock()
    } else {
      setError('Wrong PIN. Try again.')
      setPin('')
    }
  }

  async function press(key) {
    setError('')
    if (key === 'back') {
      setPin((p) => p.slice(0, -1))
      return
    }
    if (key === '') return
    const next = pin + key
    setPin(next)

    if (!isFirstRun && next.length >= MIN_LENGTH) {
      // PINs can be 4-6 digits, so try verifying as soon as enough digits are
      // in — a shorter PIN would otherwise never reach a fixed length to check.
      const ok = await verifyPin(next, settings.pinHash)
      if (ok) {
        onUnlock()
        return
      }
    }
    if (next.length === MAX_LENGTH) {
      if (isFirstRun) {
        handleComplete(next)
      } else {
        setError('Wrong PIN. Try again.')
      }
      setPin('')
    }
  }

  const prompt = isFirstRun
    ? confirmPin === null
      ? 'Create a PIN (4-6 digits)'
      : 'Enter it again'
    : 'Enter PIN'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-container-padding py-8 gap-stack-gap">
      <div className="flex items-center gap-2">
        <Icon name="home" className="text-primary text-[36px]" />
        <span className="font-bold text-3xl text-primary">Renta</span>
      </div>
      <p className="text-lg text-on-surface-variant">{prompt}</p>
      <div className="flex gap-3" aria-live="polite">
        {Array.from({ length: MAX_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full border-2 border-primary ${i < pin.length ? 'bg-primary' : 'bg-transparent'}`}
          />
        ))}
      </div>
      {error && <p className="text-secondary font-medium">{error}</p>}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs mt-4">
        {KEYS.map((key, i) => {
          if (key === '') return <div key={i} />
          if (key === 'back') {
            return (
              <button
                key={i}
                onClick={() => press('back')}
                aria-label="Delete"
                className="min-h-tap-target-min aspect-square rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-transform"
              >
                <Icon name="backspace" className="text-[24px]" />
              </button>
            )
          }
          return (
            <button
              key={i}
              onClick={() => press(key)}
              className="min-h-tap-target-min aspect-square rounded-full bg-surface-container-lowest shadow-level-1 text-2xl font-semibold text-on-surface hover:bg-surface-container-high active:scale-95 transition-transform"
            >
              {key}
            </button>
          )
        })}
      </div>
      {isFirstRun && pin.length >= MIN_LENGTH && (
        <button
          onClick={() => handleComplete(pin)}
          className="mt-2 px-8 py-3 rounded-full bg-primary text-on-primary font-semibold text-lg hover:bg-primary-container transition-colors"
        >
          Done
        </button>
      )}
    </div>
  )
}
