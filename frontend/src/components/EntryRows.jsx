import { useState } from 'react'
import { db, formatCurrency, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../lib/store.js'
import Chip from './Chip.jsx'
import IconButton from './IconButton.jsx'

// Editable list rows for expenses, withdrawals and moves. Shared by Reports and
// the screens that create them, so a mistake can be fixed where it was made.
const inputCls = 'w-full min-h-[44px] border-2 border-outline rounded-lg px-3 text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

export function ExpenseRow({ expense }) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [form, setForm] = useState({
    description: expense.description,
    category: expense.category,
    amount: expense.amount,
    date: expense.date,
  })

  function save(e) {
    e.preventDefault()
    db.updateExpense(expense.id, { ...form, amount: Number(form.amount) })
    setEditing(false)
  }

  if (editing) {
    return (
      <form onSubmit={save} className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="Description" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input required type="number" inputMode="decimal" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="Amount" />
          <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="bg-primary text-on-primary px-5 py-2 rounded-lg font-semibold hover:bg-primary-container transition-colors">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="text-on-surface-variant font-semibold hover:underline">Cancel</button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 border-b border-outline-variant/30 last:border-0">
      <div className="min-w-0 flex-1 basis-48">
        <div className="font-semibold text-on-surface break-words">{expense.description}</div>
        <div className="text-sm text-on-surface-variant">{expense.date} · {expense.category}</div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <span className="font-semibold text-secondary">{formatCurrency(expense.amount)}</span>
        {!confirmingDelete ? (
          <>
            <IconButton icon="edit" aria-label="Edit expense" onClick={() => setEditing(true)} iconClassName="text-[18px]" />
            <IconButton icon="delete_forever" aria-label="Delete expense" variant="danger" onClick={() => setConfirmingDelete(true)} iconClassName="text-[18px]" />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => db.removeExpense(expense.id)} className="text-error font-semibold text-sm hover:underline">Delete</button>
            <button onClick={() => setConfirmingDelete(false)} className="text-on-surface-variant font-semibold text-sm hover:underline">Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}

export function WithdrawalRow({ withdrawal }) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [form, setForm] = useState({ note: withdrawal.note, amount: withdrawal.amount, date: withdrawal.date, method: withdrawal.method ?? 'Cash' })

  function save(e) {
    e.preventDefault()
    db.updateWithdrawal(withdrawal.id, { ...form, amount: Number(form.amount) })
    setEditing(false)
  }

  if (editing) {
    return (
      <form onSubmit={save} className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputCls} placeholder="What is it for?" />
          <input required type="number" inputMode="decimal" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="Amount" />
          <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
          <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className={inputCls}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="bg-primary text-on-primary px-5 py-2 rounded-lg font-semibold hover:bg-primary-container transition-colors">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="text-on-surface-variant font-semibold hover:underline">Cancel</button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 border-b border-outline-variant/30 last:border-0">
      <div className="min-w-0 flex-1 basis-48">
        <div className="font-semibold text-on-surface break-words">{withdrawal.note || 'Withdrawal'}</div>
        <div className="text-sm text-on-surface-variant flex items-center gap-2 flex-wrap">
          <span className="whitespace-nowrap">{withdrawal.date}</span>
          <Chip tone="neutral" size="sm">{withdrawal.method ?? 'Cash'}</Chip>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <span className="font-semibold text-on-surface">{formatCurrency(withdrawal.amount)}</span>
        {!confirmingDelete ? (
          <>
            <IconButton icon="edit" aria-label="Edit withdrawal" onClick={() => setEditing(true)} iconClassName="text-[18px]" />
            <IconButton icon="delete_forever" aria-label="Delete withdrawal" variant="danger" onClick={() => setConfirmingDelete(true)} iconClassName="text-[18px]" />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => db.removeWithdrawal(withdrawal.id)} className="text-error font-semibold text-sm hover:underline">Delete</button>
            <button onClick={() => setConfirmingDelete(false)} className="text-on-surface-variant font-semibold text-sm hover:underline">Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}

export function TransferRow({ transfer }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 border-b border-outline-variant/30 last:border-0">
      <div className="min-w-0 flex-1 basis-48">
        <div className="font-semibold text-on-surface break-words">
          {transfer.fromMethod} → {transfer.toMethod}
        </div>
        <div className="text-sm text-on-surface-variant break-words">
          {transfer.date}{transfer.note ? ` · ${transfer.note}` : ''}
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <span className="font-semibold text-on-surface">{formatCurrency(transfer.amount)}</span>
        {!confirmingDelete ? (
          <IconButton icon="delete_forever" aria-label="Delete transfer" variant="danger" onClick={() => setConfirmingDelete(true)} iconClassName="text-[18px]" />
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => db.removeTransfer(transfer.id)} className="text-error font-semibold text-sm hover:underline">Delete</button>
            <button onClick={() => setConfirmingDelete(false)} className="text-on-surface-variant font-semibold text-sm hover:underline">Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}
