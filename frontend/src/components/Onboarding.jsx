import { useState } from 'react'
import { db } from '../lib/store.js'
import Icon from './Icon.jsx'
import Card from './Card.jsx'
import Chip from './Chip.jsx'

export const ONBOARDED_KEY = 'renta-onboarded'

function WelcomeSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center animate-[onboarding-pop-in_0.4s_ease-out]">
        <Icon name="home" className="text-[40px] text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-on-surface">Welcome to Renta</h2>
      <p className="text-on-surface-variant">Here's a quick, hands-on look around — try tapping things as we go.</p>
    </div>
  )
}

function DashboardSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <h2 className="text-xl font-bold text-on-surface">Dashboard</h2>
      <p className="text-on-surface-variant">See rent collected, expenses, and money left at a glance.</p>
      <div className="w-full grid grid-cols-3 gap-2">
        <Card variant="nested" padding="md" className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-on-surface-variant uppercase">Collected</span>
          <span className="text-sm font-bold text-primary">₱24,000</span>
        </Card>
        <Card variant="nested" padding="md" className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-on-surface-variant uppercase">Expenses</span>
          <span className="text-sm font-bold text-secondary">₱2,150</span>
        </Card>
        <Card variant="nested" padding="md" className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-on-surface-variant uppercase">Money Left</span>
          <span className="text-sm font-bold text-on-surface">₱56,150</span>
        </Card>
      </div>
    </div>
  )
}

const SAMPLE_HISTORY = [
  { date: 'Jul 1, 2026', amount: 8000 },
  { date: 'Jun 1, 2026', amount: 8000 },
  { date: 'May 1, 2026', amount: 8000 },
]

// Real tenant cards are tappable, opening their full history — so this demo
// card is too, revealing an actual sample history instead of just describing
// what would happen.
function TenantsSlide() {
  const [tapped, setTapped] = useState(false)

  return (
    <div className="flex flex-col items-center text-center gap-4">
      <h2 className="text-xl font-bold text-on-surface">Tenants</h2>
      <p className="text-on-surface-variant">Every tenant is a card like this — go ahead, tap it.</p>
      <button
        onClick={() => setTapped(true)}
        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
          tapped ? 'border-primary bg-primary-container/10 scale-[0.98]' : 'border-outline-variant hover:border-primary/50 active:scale-[0.98]'
        }`}
      >
        <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
          <Icon name="person" className="text-[20px] text-on-surface-variant" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-semibold text-on-surface">Maria Santos</div>
          <div className="text-sm text-on-surface-variant">Unit 2B · ₱8,000/mo</div>
        </div>
        <Chip tone="secondary" size="sm">Due in 3d</Chip>
      </button>

      {tapped ? (
        <div className="w-full flex flex-col gap-2 animate-[onboarding-slide-in_0.3s_ease-out]">
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <Icon name="check_circle" className="text-[16px]" />
            Maria's payment history:
          </p>
          {SAMPLE_HISTORY.map((p) => (
            <Card key={p.date} variant="nested" padding="md" className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Icon name="calendar_today" className="text-primary text-[16px]" />
                {p.date}
              </span>
              <span className="font-semibold text-on-surface">₱{p.amount.toLocaleString()}</span>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant min-h-[20px]">Tap the card above to see what happens.</p>
      )}
    </div>
  )
}

function PaymentsReportsSlide() {
  const [exported, setExported] = useState(false)

  return (
    <div className="flex flex-col items-center text-center gap-4">
      <h2 className="text-xl font-bold text-on-surface">Payments & Reports</h2>
      <p className="text-on-surface-variant">Log rent as it comes in, then export a report anytime.</p>
      <div className="w-full bg-surface-container-low rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="calendar_today" className="text-primary text-[18px]" />
          <span className="text-sm font-semibold text-on-surface">Aug 1 · Rent</span>
        </div>
        <span className="font-semibold text-primary">₱8,000</span>
      </div>
      <button
        onClick={() => setExported(true)}
        className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary rounded-xl py-3 font-semibold hover:bg-primary-container transition-colors"
      >
        <Icon name={exported ? 'check_circle' : 'ios_share'} className={`text-[18px] ${exported ? 'animate-[onboarding-check-in_0.4s_ease-out]' : ''}`} />
        {exported ? 'Exported!' : 'Try: Export PDF'}
      </button>
    </div>
  )
}

// Mirrors the real "tap to send, then confirm" reminder flow — reminders are
// only ever logged after an explicit yes, never assumed just from a tap.
function RemindersSlide() {
  const [phase, setPhase] = useState('idle')

  return (
    <div className="flex flex-col items-center text-center gap-4">
      <h2 className="text-xl font-bold text-on-surface">Reminders</h2>
      <p className="text-on-surface-variant">Try the real flow below — this one's just a demo.</p>
      <div className="w-full bg-surface-container-low rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-on-surface">Robert Cruz</span>
          <Chip tone="secondary" size="sm">Due today</Chip>
        </div>
        <div className="min-h-[40px] flex items-center justify-center">
          {phase === 'idle' && (
            <button
              onClick={() => setPhase('confirming')}
              className="flex items-center justify-center gap-2 bg-secondary text-on-secondary rounded-full px-5 py-2 font-semibold text-sm hover:bg-secondary-container transition-colors"
            >
              <Icon name="forum" className="text-[16px]" />
              Messenger
            </button>
          )}
          {phase === 'confirming' && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-sm text-on-surface-variant">Sent it?</span>
              <button onClick={() => setPhase('done')} className="bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-container transition-colors">
                Yes, log it
              </button>
              <button onClick={() => setPhase('idle')} className="text-sm text-on-surface-variant font-semibold hover:underline">
                Not yet
              </button>
            </div>
          )}
          {phase === 'done' && (
            <span className="flex items-center justify-center gap-2 text-primary font-semibold text-sm animate-[onboarding-check-in_0.4s_ease-out]">
              <Icon name="check_circle" className="text-[18px]" />
              Reminder logged!
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-on-surface-variant">It's only marked as sent once you confirm — never assumed automatically.</p>
    </div>
  )
}

function BalanceStep({ onDone }) {
  const [value, setValue] = useState('')

  function save(e) {
    e.preventDefault()
    if (value) db.updateSettings({ openingBalance: Number(value) || 0 })
    onDone()
  }

  return (
    <form onSubmit={save} className="flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center animate-[onboarding-pop-in_0.4s_ease-out]">
        <Icon name="payments" className="text-[32px] text-primary" />
      </div>
      <h2 className="text-xl font-bold text-on-surface">One Last Thing — Starting Balance</h2>
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
      <button type="submit" className="w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
        <Icon name="check_circle" className="text-[20px]" />
        You're All Set
      </button>
    </form>
  )
}

const SLIDES = [WelcomeSlide, DashboardSlide, TenantsSlide, PaymentsReportsSlide, RemindersSlide]

// Shown once automatically after a new account's first PIN is set (see
// App.jsx), and replayable anytime from Settings — the "seen it" flag lives
// in localStorage (per-device, not synced) so it's harmless to see again on
// a new device, and never blocks anything if it's skipped.
export default function Onboarding({ onFinish, includeBalanceStep = true }) {
  const [step, setStep] = useState(0)
  const totalSteps = SLIDES.length + (includeBalanceStep ? 1 : 0)
  const onBalanceStep = includeBalanceStep && step === SLIDES.length
  const isLastStep = step === totalSteps - 1
  const SlideComponent = SLIDES[step]

  function next() {
    if (step < totalSteps - 1) setStep((s) => s + 1)
    else onFinish()
  }

  function back() {
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center px-container-padding py-8 gap-stack-gap">
      {!onBalanceStep && (
        <div className="w-full max-w-md flex items-center gap-3">
          <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">
            Step {step + 1} of {totalSteps}
          </span>
          <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      <Card key={step} className="w-full max-w-md flex flex-col gap-2 animate-[onboarding-slide-in_0.35s_ease-out]">
        {onBalanceStep ? <BalanceStep onDone={onFinish} /> : <SlideComponent />}
      </Card>

      {!onBalanceStep && (
        <div className="flex items-center gap-3 w-full max-w-md">
          {step > 0 && (
            <button onClick={back} className="text-sm font-semibold text-on-surface-variant hover:underline flex-shrink-0">
              Back
            </button>
          )}
          <button onClick={onFinish} className="text-sm font-semibold text-on-surface-variant hover:underline flex-shrink-0">
            Skip
          </button>
          <button
            onClick={next}
            className="flex-1 bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
          >
            {isLastStep ? 'Finish' : 'Next'}
            <Icon name="chevron_right" className="text-[20px]" />
          </button>
        </div>
      )}
    </div>
  )
}
