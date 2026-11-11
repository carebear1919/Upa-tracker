import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, db, currentMonth, formatCurrency, PAYMENT_METHODS } from '../lib/store.js'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'

// Money the owner takes out of what's been collected (cash-out, bank
// withdrawal, etc). It's tracked separately from expenses so "what the
// property cost to run" and "what was taken out" never get mixed together.
export default function Withdraw() {
  const { withdrawals } = useStore()
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState('Cash')

  const month = currentMonth()
  const monthWithdrawals = withdrawals.filter((w) => w.date.startsWith(month))
  const monthTotal = monthWithdrawals.reduce((s, w) => s + Number(w.amount), 0)

  function submit(e) {
    e.preventDefault()
    db.addWithdrawal({ note: note.trim(), amount: Number(amount), date, method })
    navigate('/')
  }

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-on-background mb-2">Withdraw Money</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-gutter w-full items-start">
        <Card className="w-full">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Amount">
              <input required type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Date">
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Taken from" className="md:col-span-2">
              <div className="flex flex-wrap gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <Chip key={m} variant="selector" tone="primary" selected={method === m} onClick={() => setMethod(m)}>
                    {m}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="What is it for? (optional)" className="md:col-span-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} placeholder="e.g. Groceries, bank deposit" />
            </Field>
            <button type="submit" className="md:col-span-2 w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg mt-2 hover:bg-primary-container transition-colors">
              Save Withdrawal
            </button>
          </form>
        </Card>

        <Card className="flex flex-col gap-3 w-full">
          <h2 className="font-semibold text-on-surface">Withdrawn This Month</h2>
          <span className="text-2xl font-bold text-primary">{formatCurrency(monthTotal)}</span>
          <p className="text-sm text-on-surface-variant">
            Withdrawals come out of "Money Left" on the Dashboard. See and fix every one under Reports.
          </p>
        </Card>
      </div>
    </>
  )
}

const inputCls = 'w-full min-h-tap-target-min border-2 border-outline rounded-lg px-4 text-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="font-semibold text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}
