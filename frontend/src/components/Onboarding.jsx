import { useState } from 'react'
import { db } from '../lib/store.js'
import Icon from './Icon.jsx'
import Card from './Card.jsx'

export const ONBOARDED_KEY = 'renta-onboarded'

const TOUR_SLIDES = [
  {
    icon: 'home',
    title: 'Welcome to Renta',
    body: "Here's a quick look around before you get started. This only takes a minute.",
  },
  {
    icon: 'assessment',
    title: 'Dashboard',
    body: 'See rent collected, expenses, and money left at a glance, plus who still needs to pay this month.',
  },
  {
    icon: 'group',
    title: 'Tenants',
    body: 'Add each tenant once — their rent, due day, and contact info. Tap any tenant to see their full history.',
  },
  {
    icon: 'payments',
    title: 'Payments & Reports',
    body: 'Log rent as it comes in, and export a formatted PDF or Excel report for any month.',
  },
  {
    icon: 'notifications',
    title: 'Reminders',
    body: "Send a friendly reminder over Messenger or text — it's only marked as sent once you confirm you actually sent it.",
  },
]

function BalanceStep({ onDone }) {
  const [value, setValue] = useState('')

  function save(e) {
    e.preventDefault()
    if (value) db.updateSettings({ openingBalance: Number(value) || 0 })
    onDone()
  }

  return (
    <form onSubmit={save} className="flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
        <Icon name="payments" className="text-[32px] text-primary" />
      </div>
      <h2 className="text-xl font-bold text-on-surface">Starting Balance</h2>
      <p className="text-on-surface-variant">
        Already have money saved up before tracking with Renta? Enter it here, once — it carries forward every month
        after. Leave blank if you're starting from zero.
      </p>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="0"
        className="w-full max-w-[200px] min-h-tap-target-min border-2 border-outline-variant rounded-lg px-4 text-lg text-center text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary"
      />
      <button type="submit" className="w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg hover:bg-primary-container transition-colors">
        Finish
      </button>
    </form>
  )
}

// Shown once automatically after a new account's first PIN is set (see
// App.jsx), and replayable anytime from Settings — the "seen it" flag lives
// in localStorage (per-device, not synced) so it's harmless to see again on
// a new device, and never blocks anything if it's skipped.
export default function Onboarding({ onFinish, includeBalanceStep = true }) {
  const [step, setStep] = useState(0)
  const totalSteps = TOUR_SLIDES.length + (includeBalanceStep ? 1 : 0)
  const onBalanceStep = includeBalanceStep && step === TOUR_SLIDES.length

  function next() {
    if (step < totalSteps - 1) setStep((s) => s + 1)
    else onFinish()
  }

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center px-container-padding py-8 gap-stack-gap">
      <Card className="w-full max-w-md flex flex-col gap-2">
        {onBalanceStep ? (
          <BalanceStep onDone={onFinish} />
        ) : (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
              <Icon name={TOUR_SLIDES[step].icon} className="text-[32px] text-primary" />
            </div>
            <h2 className="text-xl font-bold text-on-surface">{TOUR_SLIDES[step].title}</h2>
            <p className="text-on-surface-variant">{TOUR_SLIDES[step].body}</p>
          </div>
        )}
      </Card>

      {!onBalanceStep && (
        <>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-primary' : 'bg-outline-variant'}`} />
            ))}
          </div>

          <div className="flex items-center gap-4 w-full max-w-md">
            <button onClick={onFinish} className="text-sm font-semibold text-on-surface-variant hover:underline">
              Skip
            </button>
            <button
              onClick={next}
              className="flex-1 bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
            >
              {step < totalSteps - 1 ? 'Next' : 'Finish'}
              <Icon name="chevron_right" className="text-[20px]" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
