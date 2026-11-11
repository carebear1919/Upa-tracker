import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, db, formatCurrency, currentMonth, balancesByMethod, PAYMENT_METHODS } from '../lib/store.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import { notify } from '../lib/notice.js'

// Relocates money between Cash / GCash / Check — e.g. a check that was
// cashed, or GCash cashed out to cash. Nothing is added or removed from
// "Money Left"; it just changes which pot the money is sitting in.
export default function MoveMoney() {
  const { payments, withdrawals, transfers, expenses, settings } = useStore()
  const navigate = useNavigate()
  // Start from where the money mostly is, heading to the next place.
  const [from, setFrom] = useState(() => {
    const { pots } = balancesByMethod(payments, withdrawals, transfers, currentMonth(), expenses, settings.openingBalance)
    return [...PAYMENT_METHODS].sort((a, b) => pots[b] - pots[a])[0]
  })
  const [to, setTo] = useState(() => PAYMENT_METHODS.find((m) => m !== from) ?? 'Cash')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const submitted = useRef(false)

  const { pots } = balancesByMethod(payments, withdrawals, transfers, currentMonth(), expenses, settings.openingBalance)
  const sameMethod = from === to
  const tooMuch = Number(amount) > pots[from]

  function submit(e) {
    e.preventDefault()
    if (sameMethod || submitted.current) return
    submitted.current = true
    setSaving(true)
    db.addTransfer({ fromMethod: from, toMethod: to, amount: Number(amount), date, note: note.trim() })
    notify('Money moved')
    navigate('/')
  }

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-on-background mb-2">Move Money</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-gutter w-full items-start">
        <Card className="w-full">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Move from" className="md:col-span-2">
              <MethodPicker value={from} onChange={setFrom} />
            </Field>
            <div className="md:col-span-2 flex justify-center text-on-surface-variant">
              <Icon name="chevron_right" className="text-[28px] rotate-90" />
            </div>
            <Field label="Move to" className="md:col-span-2">
              <MethodPicker value={to} onChange={setTo} />
            </Field>
            {sameMethod && <p className="md:col-span-2 text-sm text-secondary font-medium -mt-2">Pick two different places to move money between.</p>}
            <Field label="Amount">
              <input required type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Date">
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            {tooMuch && !sameMethod && (
              <p className="md:col-span-2 text-sm text-on-surface-variant -mt-2">
                Heads up: that's more than the {formatCurrency(pots[from])} currently recorded in {from}. You can still save it.
              </p>
            )}
            <Field label="Note (optional)" className="md:col-span-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} placeholder="e.g. Check cashed at the bank" />
            </Field>
            <button
              type="submit"
              disabled={sameMethod || saving}
              className="md:col-span-2 w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg mt-2 hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Move Money'}
            </button>
          </form>
        </Card>

        <Card className="flex flex-col gap-3 w-full">
          <h2 className="font-semibold text-on-surface">Where the money is now</h2>
          {PAYMENT_METHODS.map((m) => (
            <div key={m} className="flex items-center justify-between">
              <Chip tone="neutral" size="sm">{m}</Chip>
              <span className="font-semibold text-on-surface">{formatCurrency(pots[m])}</span>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}

function MethodPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {PAYMENT_METHODS.map((m) => (
        <Chip key={m} variant="selector" tone="primary" selected={value === m} onClick={() => onChange(m)}>
          {m}
        </Chip>
      ))}
    </div>
  )
}

const inputCls = 'w-full min-h-tap-target-min border-2 border-outline rounded-lg px-4 text-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

function Field({ label, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="font-semibold text-on-surface-variant">{label}</span>
      {children}
    </div>
  )
}
