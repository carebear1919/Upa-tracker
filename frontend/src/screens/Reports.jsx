import { useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useStore, db, formatCurrency, startingBalance, EXPENSE_CATEGORIES } from '../lib/store.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import IconButton from '../components/IconButton.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import MonthlyTrendChart from '../components/MonthlyTrendChart.jsx'

const inputCls = 'w-full min-h-[44px] border-2 border-outline-variant rounded-lg px-3 text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

function ExpenseRow({ expense }) {
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
          <input required type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="Amount" />
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-outline-variant/30 last:border-0">
      <div className="min-w-0">
        <div className="font-semibold text-on-surface truncate">{expense.description}</div>
        <div className="text-sm text-on-surface-variant">{expense.date} · {expense.category}</div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
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

// Brand colors as RGB triples — jsPDF/autoTable want plain arrays, not CSS.
const PRIMARY_RGB = [15, 82, 56]
const SECONDARY_RGB = [167, 55, 59]
const CREAM_RGB = [250, 249, 246]
const INK_RGB = [26, 28, 26]

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

  // jsPDF's built-in fonts don't include the ₱ glyph, so the PDF spells it out as "PHP".
  function exportPdf() {
    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()

    doc.setFillColor(...PRIMARY_RGB)
    doc.rect(0, 0, pageW, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text(settings.businessName || 'Renta', 14, 14)
    doc.setFontSize(11)
    doc.text(`Monthly Report — ${monthLabel(month)}`, 14, 22)

    doc.setTextColor(...INK_RGB)

    autoTable(doc, {
      startY: 38,
      theme: 'plain',
      body: [
        ['Starting Balance', `PHP ${opening.toLocaleString()}`],
        ['Rent Collected', `PHP ${collected.toLocaleString()}`],
        ['Expenses', `PHP ${totalExpenses.toLocaleString()}`],
        ['Ending Balance', `PHP ${closing.toLocaleString()}`],
      ],
      styles: { fontSize: 11, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: INK_RGB }, 1: { halign: 'right', textColor: PRIMARY_RGB, fontStyle: 'bold' } },
      didParseCell: (data) => {
        if (data.row.index === 3) data.cell.styles.textColor = PRIMARY_RGB
      },
    })

    let y = doc.lastAutoTable.finalY + 10

    if (monthPayments.length > 0) {
      doc.setFontSize(13)
      doc.setTextColor(...PRIMARY_RGB)
      doc.text('Payments', 14, y)
      autoTable(doc, {
        startY: y + 4,
        head: [['Date', 'Tenant', 'Amount (PHP)']],
        body: monthPayments.map((p) => [p.datePaid, tenantName(p.tenantId), p.amount.toLocaleString()]),
        theme: 'striped',
        headStyles: { fillColor: PRIMARY_RGB, textColor: 255 },
        alternateRowStyles: { fillColor: CREAM_RGB },
        styles: { fontSize: 10 },
        columnStyles: { 2: { halign: 'right' } },
      })
      y = doc.lastAutoTable.finalY + 10
    }

    if (monthExpenses.length > 0) {
      doc.setFontSize(13)
      doc.setTextColor(...SECONDARY_RGB)
      doc.text('Expenses', 14, y)
      autoTable(doc, {
        startY: y + 4,
        head: [['Date', 'Description', 'Category', 'Amount (PHP)']],
        body: monthExpenses.map((e) => [e.date, e.description, e.category, e.amount.toLocaleString()]),
        theme: 'striped',
        headStyles: { fillColor: SECONDARY_RGB, textColor: 255 },
        alternateRowStyles: { fillColor: CREAM_RGB },
        styles: { fontSize: 10 },
        columnStyles: { 3: { halign: 'right' } },
      })
    }

    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(150)
      doc.text(`Generated by Renta — ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.getHeight() - 8)
    }

    doc.save(`renta-report-${month}.pdf`)
  }

  // Saved as .xls containing a styled HTML table — Excel opens this natively
  // with real formatting (colors, bold, borders), without pulling in a
  // spreadsheet-writing library with unpatched CVEs (SheetJS/xlsx).
  function exportExcel() {
    const rowStyle = 'font-family:Calibri,Arial,sans-serif;font-size:12px;padding:6px 10px;border:1px solid #ddd;'
    const headStyle = `${rowStyle}background:#0f5238;color:#fff;font-weight:bold;`
    const sectionStyle = `${rowStyle}background:#e9e8e5;font-weight:bold;font-size:13px;`
    const totalStyle = `${rowStyle}font-weight:bold;`

    const summaryRows = [
      ['Starting Balance', opening],
      ['Rent Collected', collected],
      ['Expenses', totalExpenses],
      ['Ending Balance', closing],
    ]
      .map(([label, val]) => `<tr><td style="${totalStyle}">${label}</td><td style="${totalStyle}text-align:right;">${val}</td></tr>`)
      .join('')

    const paymentRows = monthPayments
      .map(
        (p) =>
          `<tr><td style="${rowStyle}">${p.datePaid}</td><td style="${rowStyle}">${tenantName(p.tenantId)}</td><td style="${rowStyle}text-align:right;">${p.amount}</td></tr>`,
      )
      .join('')

    const expenseRows = monthExpenses
      .map(
        (e) =>
          `<tr><td style="${rowStyle}">${e.date}</td><td style="${rowStyle}">${e.description}</td><td style="${rowStyle}">${e.category}</td><td style="${rowStyle}text-align:right;">${e.amount}</td></tr>`,
      )
      .join('')

    const html = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
        <table style="border-collapse:collapse;">
          <tr><td colspan="4" style="font-family:Calibri;font-size:18px;font-weight:bold;color:#0f5238;padding:8px;">${settings.businessName || 'Renta'} — Monthly Report</td></tr>
          <tr><td colspan="4" style="font-family:Calibri;font-size:13px;color:#404943;padding:0 8px 12px;">${monthLabel(month)}</td></tr>
          ${summaryRows}
          <tr><td colspan="4" style="padding:8px;"></td></tr>
          <tr><td colspan="3" style="${sectionStyle}">Payments</td></tr>
          <tr><th style="${headStyle}">Date</th><th style="${headStyle}">Tenant</th><th style="${headStyle}">Amount (PHP)</th></tr>
          ${paymentRows}
          <tr><td colspan="4" style="padding:8px;"></td></tr>
          <tr><td colspan="4" style="${sectionStyle}">Expenses</td></tr>
          <tr><th style="${headStyle}">Date</th><th style="${headStyle}">Description</th><th style="${headStyle}">Category</th><th style="${headStyle}">Amount (PHP)</th></tr>
          ${expenseRows}
        </table>
      </body>
      </html>`

    downloadFile(`renta-report-${month}.xls`, html, 'application/vnd.ms-excel')
  }

  return (
    <>
      <div className="flex items-start justify-between mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-background mb-1">Monthly Report</h1>
          <p className="text-on-surface-variant">Pick a month below, then export it as a PDF or spreadsheet.</p>
          <Link to="/payments" className="text-primary font-semibold hover:underline inline-flex items-center gap-1 mt-1">
            <Icon name="payments" className="text-[18px]" />
            View all payments
          </Link>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border-2 border-outline-variant rounded-lg px-3 py-2 text-lg bg-surface-container-lowest"
        />
      </div>

      <Card className="flex flex-col gap-4 w-full">
        <SectionHeader title={monthLabel(month)} icon="assessment" />
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
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={exportExcel}
          className="w-full sm:w-auto flex-1 bg-surface-container-high text-on-surface px-8 h-14 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
        >
          <Icon name="table_view" className="text-[22px]" />
          Export Excel
        </button>
        <button
          onClick={exportPdf}
          className="w-full sm:w-auto flex-1 bg-primary text-on-primary px-8 h-14 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Icon name="ios_share" className="text-[22px]" />
          Export PDF
        </button>
      </div>

      {Object.keys(expensesByCategory).length > 0 && (
        <Card className="flex flex-col gap-3 w-full">
          <SectionHeader title="Expenses by Category" icon="receipt_long" />
          <div className="flex flex-col gap-2">
            {Object.entries(expensesByCategory).map(([cat, amt]) => {
              const meta = EXPENSE_CATEGORIES.find((c) => c.value === cat)
              return (
                <div key={cat} className="flex items-center justify-between">
                  <Chip size="sm" tone="neutral" icon={meta?.icon}>
                    {meta?.label ?? cat}
                  </Chip>
                  <span className="font-semibold text-on-surface">{formatCurrency(amt)}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-2 w-full">
        <SectionHeader title="Last 6 Months" icon="table_view" />
        <MonthlyTrendChart payments={payments} expenses={expenses} anchorMonth={month} />
      </Card>

      {monthExpenses.length > 0 && (
        <Card className="flex flex-col w-full">
          <SectionHeader title={`Expenses — ${monthLabel(month)}`} icon="receipt_long" />
          <p className="text-sm text-on-surface-variant my-2">Made a mistake? Tap the pencil to fix it, or the trash to remove it.</p>
          {monthExpenses.map((e) => (
            <ExpenseRow key={e.id} expense={e} />
          ))}
        </Card>
      )}
    </>
  )
}

function Stat({ label, value, color }) {
  return (
    <Card variant="nested" padding="md" className="flex flex-col gap-1">
      <span className="text-on-surface-variant font-semibold">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{formatCurrency(value)}</span>
    </Card>
  )
}
