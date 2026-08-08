import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { useStore, formatCurrency, startingBalance } from '../lib/store.js'
import Icon from '../components/Icon.jsx'

function csvCell(value) {
  const str = String(value ?? '')
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function monthLabel(month) {
  const [y, m] = month.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

export default function Reports() {
  const { tenants, payments, expenses, settings } = useStore()
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  const monthPayments = payments.filter((p) => p.monthCovered === month)
  const monthExpenses = expenses.filter((e) => e.date.startsWith(month))
  const collected = monthPayments.reduce((s, p) => s + Number(p.amount), 0)
  const totalExpenses = monthExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const net = collected - totalExpenses
  const opening = startingBalance(payments, expenses, month, settings.openingBalance)
  const closing = opening + net

  const expensesByCategory = monthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount)
    return acc
  }, {})

  function tenantName(id) {
    return tenants.find((t) => t.id === id)?.name ?? 'Unknown tenant'
  }

  function exportPdf() {
    const doc = new jsPDF()
    let y = 20
    doc.setFontSize(18)
    doc.text(`${settings.businessName ?? 'Renta'} — Monthly Report`, 14, y)
    y += 8
    doc.setFontSize(12)
    doc.text(monthLabel(month), 14, y)
    y += 12

    // jsPDF's built-in fonts don't include the ₱ glyph, so the PDF spells it out as "PHP".
    doc.setFontSize(14)
    doc.text(`Starting Balance: PHP ${opening.toLocaleString()}`, 14, y); y += 8
    doc.text(`Rent Collected: PHP ${collected.toLocaleString()}`, 14, y); y += 8
    doc.text(`Expenses: PHP ${totalExpenses.toLocaleString()}`, 14, y); y += 8
    doc.text(`Ending Balance: PHP ${closing.toLocaleString()}`, 14, y); y += 12

    doc.setFontSize(13)
    doc.text('Payments', 14, y); y += 7
    doc.setFontSize(11)
    monthPayments.forEach((p) => {
      doc.text(`${p.datePaid}  ${tenantName(p.tenantId)}  PHP ${p.amount}`, 14, y)
      y += 6
    })
    y += 6

    doc.setFontSize(13)
    doc.text('Expenses', 14, y); y += 7
    doc.setFontSize(11)
    monthExpenses.forEach((e) => {
      doc.text(`${e.date}  ${e.description} (${e.category})  PHP ${e.amount}`, 14, y)
      y += 6
    })

    doc.save(`renta-report-${month}.pdf`)
  }

  function exportCsv() {
    const rows = [
      ['Renta Monthly Report', monthLabel(month)],
      [],
      ['Starting Balance', opening],
      ['Rent Collected', collected],
      ['Expenses', totalExpenses],
      ['Ending Balance', closing],
      [],
      ['Payments'],
      ['Date', 'Tenant', 'Amount'],
      ...monthPayments.map((p) => [p.datePaid, tenantName(p.tenantId), p.amount]),
      [],
      ['Expenses'],
      ['Date', 'Description', 'Category', 'Amount'],
      ...monthExpenses.map((e) => [e.date, e.description, e.category, e.amount]),
    ]
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
    // Leading BOM so Excel opens the ₱ symbol as UTF-8 instead of guessing wrong.
    downloadFile(`renta-report-${month}.csv`, '﻿' + csv, 'text/csv;charset=utf-8;')
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-on-background">Monthly Report</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border-2 border-outline-variant rounded-lg px-3 py-2 text-lg bg-surface-container-lowest"
        />
      </div>

      <section className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-4 w-full">
        <h2 className="text-xl font-semibold text-on-surface">{monthLabel(month)}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <Stat label="Starting Balance" value={opening} color="text-on-background" />
          <Stat label="Rent Collected" value={collected} color="text-primary" />
          <Stat label="Expenses" value={totalExpenses} color="text-secondary" />
          <Stat label="Ending Balance" value={closing} color="text-on-background" />
        </div>
        <p className="text-sm text-on-surface-variant">
          Money left carries into next month — {monthLabel(month)} ends at {formatCurrency(closing)}.
        </p>

        {monthPayments.length === 0 && monthExpenses.length === 0 && (
          <p className="text-on-surface-variant text-sm">No payments or expenses logged for {monthLabel(month)} yet.</p>
        )}

        {Object.keys(expensesByCategory).length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-on-surface-variant mb-2">Expenses by Category</h3>
            <div className="flex flex-col gap-2">
              {Object.entries(expensesByCategory).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between text-on-surface">
                  <span>{cat}{cat === 'Medicine' ? ' & Health' : ''}</span>
                  <span className="font-semibold">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:self-end mt-4 w-full sm:w-auto">
          <button
            onClick={exportCsv}
            className="w-full sm:w-auto border-2 border-outline text-on-surface px-8 h-14 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
          >
            <Icon name="table_view" className="text-[22px]" />
            Export Spreadsheet
          </button>
          <button
            onClick={exportPdf}
            className="w-full sm:w-auto bg-primary text-on-primary px-8 h-14 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-colors"
          >
            <Icon name="ios_share" className="text-[22px]" />
            Export PDF
          </button>
        </div>
      </section>
    </>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-surface-container-lowest rounded-lg p-4 flex flex-col gap-1">
      <span className="text-on-surface-variant font-semibold">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{formatCurrency(value)}</span>
    </div>
  )
}
