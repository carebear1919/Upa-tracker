import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, db, currentMonth, formatCurrency, EXPENSE_CATEGORIES } from '../lib/store.js'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'

export default function AddExpense() {
  const { expenses } = useStore()
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Medicine')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const month = currentMonth()
  const monthExpenses = expenses.filter((e) => e.date.startsWith(month))
  const totalsByCategory = EXPENSE_CATEGORIES.map((c) => ({
    ...c,
    total: monthExpenses.filter((e) => e.category === c.value).reduce((s, e) => s + Number(e.amount), 0),
  }))
  const monthTotal = monthExpenses.reduce((s, e) => s + Number(e.amount), 0)

  function submit(e) {
    e.preventDefault()
    db.addExpense({ description, category, amount: Number(amount), date })
    navigate('/')
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-on-background mb-2">Add Expense</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-gutter w-full items-start">
        <Card className="w-full">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Description" className="md:col-span-2">
              <input required value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Category" className="md:col-span-2">
              <div className="flex flex-wrap gap-3">
                {EXPENSE_CATEGORIES.map((c) => (
                  <Chip
                    key={c.value}
                    variant="selector"
                    tone="secondary"
                    icon={c.icon}
                    selected={category === c.value}
                    onClick={() => setCategory(c.value)}
                  >
                    {c.label}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Amount">
              <input required type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Date">
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            <button type="submit" className="md:col-span-2 w-full bg-secondary text-on-secondary h-14 rounded-xl font-semibold text-lg mt-2 hover:bg-secondary-container transition-colors">
              Save
            </button>
          </form>
        </Card>

        <Card className="flex flex-col gap-3 w-full">
          <h2 className="font-semibold text-on-surface">This Month's Expenses</h2>
          <span className="text-2xl font-bold text-secondary">{formatCurrency(monthTotal)}</span>
          <div className="flex flex-col gap-2 mt-2">
            {totalsByCategory.map((c) => (
              <div
                key={c.value}
                className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors ${
                  category === c.value ? 'bg-secondary-container/15' : ''
                }`}
              >
                <Chip size="sm" tone="neutral" icon={c.icon}>
                  {c.label}
                </Chip>
                <span className="font-semibold text-on-surface">{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

const inputCls = 'w-full min-h-tap-target-min border-2 border-outline-variant rounded-lg px-4 text-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="font-semibold text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}
