import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/store.js'
import Icon from '../components/Icon.jsx'

const CATEGORIES = [
  { value: 'Medicine', label: 'Medicine & Health', icon: 'medication' },
  { value: 'Repairs', label: 'Repairs', icon: 'home_repair_service' },
  { value: 'Other', label: 'Other', icon: 'receipt_long' },
]

export default function AddExpense() {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Medicine')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  function submit(e) {
    e.preventDefault()
    db.addExpense({ description, category, amount: Number(amount), date })
    navigate('/')
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-on-background mb-2">Add Expense</h1>
      <form onSubmit={submit} className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-5 w-full">
        <Field label="Description">
          <input required value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Category">
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`flex flex-col items-center gap-2 py-4 rounded-lg border-2 min-h-tap-target-min transition-colors ${
                  category === c.value
                    ? 'border-secondary bg-secondary-container/20 text-secondary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <Icon name={c.icon} className="text-[24px]" />
                <span className="text-sm font-medium text-center">{c.label}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Amount">
          <input required type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Date">
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <button type="submit" className="w-full bg-secondary text-on-secondary h-14 rounded-xl font-semibold text-lg mt-2 hover:bg-secondary-container transition-colors">
          Save
        </button>
      </form>
    </>
  )
}

const inputCls = 'w-full min-h-tap-target-min border-2 border-outline-variant rounded-lg px-4 text-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-semibold text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}
