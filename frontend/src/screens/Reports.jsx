import { useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useStore, db, formatCurrency, startingBalance, EXPENSE_CATEGORIES, PAYMENT_METHODS, paymentStatus } from '../lib/store.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import IconButton from '../components/IconButton.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import MonthlyTrendChart from '../components/MonthlyTrendChart.jsx'
import PieChart from '../components/PieChart.jsx'

const inputCls = 'w-full min-h-[44px] border-2 border-outline rounded-lg px-3 text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

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
          <input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="Amount" />
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

function WithdrawalRow({ withdrawal }) {
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
          <input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="Amount" />
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

function TransferRow({ transfer }) {
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

// Excel export builds raw HTML from user-typed text, so it has to be escaped
// or a name like "<b>x" would corrupt (or inject into) the downloaded file.
function esc(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
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
  const { tenants, payments, expenses, withdrawals, transfers, settings } = useStore()
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [choosingOrientation, setChoosingOrientation] = useState(false)

  const monthPayments = payments.filter((p) => p.monthCovered === month)
  const monthExpenses = expenses.filter((e) => e.date.startsWith(month))
  const collected = monthPayments.reduce((s, p) => s + Number(p.amount), 0)
  const totalExpenses = monthExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const monthWithdrawals = withdrawals.filter((w) => w.date.startsWith(month))
  const monthTransfers = transfers.filter((t) => t.date.startsWith(month))
  const totalWithdrawn = monthWithdrawals.reduce((s, w) => s + Number(w.amount), 0)
  const net = collected - totalExpenses - totalWithdrawn
  const opening = startingBalance(payments, expenses, month, settings.openingBalance, withdrawals)
  const closing = opening + net

  // How this month's rent actually arrived — Cash, GCash or Check.
  const collectedByMethod = Object.fromEntries(PAYMENT_METHODS.map((m) => [m, 0]))
  for (const p of monthPayments) collectedByMethod[p.method ?? 'Cash'] += Number(p.amount)

  const expensesByCategory = monthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount)
    return acc
  }, {})

  // Full transparency on who's behind, not just who paid — every tenant
  // shows up here, sorted so unpaid/partial (the ones that need attention)
  // come before anyone who's already fully paid.
  const STATUS_RANK = { unpaid: 0, partial: 1, paid: 2 }
  const tenantStatuses = tenants
    .map((t) => ({ tenant: t, ...paymentStatus(t, payments, month) }))
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])
  const behindCount = tenantStatuses.filter((x) => x.status !== 'paid').length

  function tenantName(id) {
    return tenants.find((t) => t.id === id)?.name ?? 'Unknown tenant'
  }

  // jsPDF's built-in fonts don't include the ₱ glyph, so the PDF spells it out as "PHP".
  function exportPdf(orientation) {
    setChoosingOrientation(false)
    const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14

    doc.setFillColor(...PRIMARY_RGB)
    doc.rect(0, 0, pageW, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text(settings.businessName || 'Renta', margin, 14)
    doc.setFontSize(11)
    doc.text(`Monthly Report — ${monthLabel(month)}`, margin, 22)

    doc.setTextColor(...INK_RGB)
    doc.setFontSize(12)
    doc.text('Summary', margin, 38)

    autoTable(doc, {
      startY: 42,
      theme: 'plain',
      body: [
        ['Starting Balance', `PHP ${opening.toLocaleString()}`],
        ['Rent Collected', `PHP ${collected.toLocaleString()}`],
        ['Expenses', `PHP ${totalExpenses.toLocaleString()}`],
        ['Money Withdrawn', `PHP ${totalWithdrawn.toLocaleString()}`],
        ['Ending Balance', `PHP ${closing.toLocaleString()}`],
      ],
      styles: { fontSize: 11, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: INK_RGB }, 1: { halign: 'right', textColor: PRIMARY_RGB, fontStyle: 'bold' } },
      didParseCell: (data) => {
        if (data.row.index === 4) data.cell.styles.textColor = PRIMARY_RGB
      },
    })

    let y = doc.lastAutoTable.finalY + 10

    doc.setFontSize(13)
    doc.setTextColor(...INK_RGB)
    doc.text('Rent Collected by Payment Method', margin, y)
    autoTable(doc, {
      startY: y + 4,
      head: [['Method', 'Amount (PHP)']],
      body: PAYMENT_METHODS.map((m) => [m, collectedByMethod[m].toLocaleString()]),
      foot: [['Total', collected.toLocaleString()]],
      theme: 'striped',
      headStyles: { fillColor: INK_RGB, textColor: 255 },
      footStyles: { fillColor: [255, 255, 255], textColor: INK_RGB, fontStyle: 'bold', lineWidth: { top: 0.4 }, lineColor: INK_RGB },
      alternateRowStyles: { fillColor: CREAM_RGB },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
    })
    y = doc.lastAutoTable.finalY + 10

    if (tenantStatuses.length > 0) {
      doc.setFontSize(13)
      doc.setTextColor(...INK_RGB)
      doc.text(`Tenant Payment Status${behindCount > 0 ? ` — ${behindCount} not fully paid` : ''}`, margin, y)
      autoTable(doc, {
        startY: y + 4,
        head: [['Tenant', 'Property', 'Status', 'Paid (PHP)', 'Balance (PHP)']],
        body: tenantStatuses.map(({ tenant, status, paid, balance }) => [
          tenant.name,
          tenant.unit ? `Unit ${tenant.unit} - ${tenant.property}` : tenant.property,
          status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Unpaid',
          paid.toLocaleString(),
          balance.toLocaleString(),
        ]),
        theme: 'striped',
        headStyles: { fillColor: INK_RGB, textColor: 255 },
        alternateRowStyles: { fillColor: CREAM_RGB },
        styles: { fontSize: 10 },
        columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' } },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const status = tenantStatuses[data.row.index].status
            data.cell.styles.fontStyle = 'bold'
            if (status === 'unpaid') data.cell.styles.textColor = SECONDARY_RGB
            else if (status === 'partial') data.cell.styles.textColor = [166, 124, 0]
            else data.cell.styles.textColor = PRIMARY_RGB
          }
        },
      })
      y = doc.lastAutoTable.finalY + 10
    }

    if (monthPayments.length > 0) {
      doc.setFontSize(13)
      doc.setTextColor(...PRIMARY_RGB)
      doc.text(`Payments (${monthPayments.length})`, margin, y)
      autoTable(doc, {
        startY: y + 4,
        head: [['Date', 'Tenant', 'Method', 'Amount (PHP)']],
        body: monthPayments.map((p) => [p.datePaid, tenantName(p.tenantId), p.method ?? 'Cash', p.amount.toLocaleString()]),
        foot: [['', '', 'Total', collected.toLocaleString()]],
        theme: 'striped',
        headStyles: { fillColor: PRIMARY_RGB, textColor: 255 },
        footStyles: { fillColor: [255, 255, 255], textColor: INK_RGB, fontStyle: 'bold', lineWidth: { top: 0.4 }, lineColor: PRIMARY_RGB },
        alternateRowStyles: { fillColor: CREAM_RGB },
        styles: { fontSize: 10 },
        columnStyles: { 3: { halign: 'right' } },
      })
      y = doc.lastAutoTable.finalY + 10
    }

    if (monthExpenses.length > 0) {
      doc.setFontSize(13)
      doc.setTextColor(...SECONDARY_RGB)
      doc.text(`Expenses (${monthExpenses.length})`, margin, y)
      autoTable(doc, {
        startY: y + 4,
        head: [['Date', 'Description', 'Category', 'Amount (PHP)']],
        body: monthExpenses.map((e) => [e.date, e.description, e.category, e.amount.toLocaleString()]),
        foot: [['', '', 'Total', totalExpenses.toLocaleString()]],
        theme: 'striped',
        headStyles: { fillColor: SECONDARY_RGB, textColor: 255 },
        footStyles: { fillColor: [255, 255, 255], textColor: INK_RGB, fontStyle: 'bold', lineWidth: { top: 0.4 }, lineColor: SECONDARY_RGB },
        alternateRowStyles: { fillColor: CREAM_RGB },
        styles: { fontSize: 10 },
        columnStyles: { 3: { halign: 'right' } },
      })
      y = doc.lastAutoTable.finalY + 10
    }

    if (monthWithdrawals.length > 0) {
      doc.setFontSize(13)
      doc.setTextColor(...INK_RGB)
      doc.text(`Money Withdrawn (${monthWithdrawals.length})`, margin, y)
      autoTable(doc, {
        startY: y + 4,
        head: [['Date', 'For', 'Taken from', 'Amount (PHP)']],
        body: monthWithdrawals.map((w) => [w.date, w.note || 'Withdrawal', w.method ?? 'Cash', w.amount.toLocaleString()]),
        foot: [['', '', 'Total', totalWithdrawn.toLocaleString()]],
        theme: 'striped',
        headStyles: { fillColor: INK_RGB, textColor: 255 },
        footStyles: { fillColor: [255, 255, 255], textColor: INK_RGB, fontStyle: 'bold', lineWidth: { top: 0.4 }, lineColor: INK_RGB },
        alternateRowStyles: { fillColor: CREAM_RGB },
        styles: { fontSize: 10 },
        columnStyles: { 3: { halign: 'right' } },
      })
      y = doc.lastAutoTable.finalY + 10
    }

    if (monthTransfers.length > 0) {
      doc.setFontSize(13)
      doc.setTextColor(...INK_RGB)
      doc.text(`Money Moved Between Cash / GCash / Check (${monthTransfers.length})`, margin, y)
      autoTable(doc, {
        startY: y + 4,
        head: [['Date', 'From', 'To', 'Note', 'Amount (PHP)']],
        body: monthTransfers.map((t) => [t.date, t.fromMethod, t.toMethod, t.note, t.amount.toLocaleString()]),
        theme: 'striped',
        headStyles: { fillColor: INK_RGB, textColor: 255 },
        alternateRowStyles: { fillColor: CREAM_RGB },
        styles: { fontSize: 10 },
        columnStyles: { 4: { halign: 'right' } },
      })
    }

    if (monthPayments.length === 0 && monthExpenses.length === 0) {
      doc.setFontSize(11)
      doc.setTextColor(...INK_RGB)
      doc.text(`No payments or expenses were logged for ${monthLabel(month)}.`, margin, y)
    }

    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(150)
      doc.text(`Generated by Renta — ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.getHeight() - 8)
      doc.text(`Page ${i} of ${pageCount}`, pageW - margin, doc.internal.pageSize.getHeight() - 8, { align: 'right' })
    }

    doc.save(`renta-report-${month}-${orientation}.pdf`)
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
      ['Money Withdrawn', totalWithdrawn],
      ['Ending Balance', closing],
    ]
      .map(([label, val]) => `<tr><td style="${totalStyle}">${label}</td><td style="${totalStyle}text-align:right;">${val}</td></tr>`)
      .join('')

    const statusColor = { unpaid: '#a7373b', partial: '#a67c00', paid: '#0f5238' }
    const statusLabel = { unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid' }
    const tenantStatusRows = tenantStatuses
      .map(
        ({ tenant, status, paid, balance }) =>
          `<tr><td style="${rowStyle}">${esc(tenant.name)}</td><td style="${rowStyle}">${tenant.unit ? `Unit ${esc(tenant.unit)} - ` : ''}${esc(tenant.property)}</td><td style="${rowStyle}font-weight:bold;color:${statusColor[status]};">${statusLabel[status]}</td><td style="${rowStyle}text-align:right;">${paid}</td><td style="${rowStyle}text-align:right;">${balance}</td></tr>`,
      )
      .join('')

    const paymentRows = monthPayments
      .map(
        (p) =>
          `<tr><td style="${rowStyle}">${p.datePaid}</td><td style="${rowStyle}">${esc(tenantName(p.tenantId))}</td><td style="${rowStyle}">${esc(p.method ?? 'Cash')}</td><td style="${rowStyle}text-align:right;">${p.amount}</td></tr>`,
      )
      .join('')
    const paymentsTotalRow = `<tr><td style="${totalStyle}"></td><td style="${totalStyle}"></td><td style="${totalStyle}">Total</td><td style="${totalStyle}text-align:right;">${collected}</td></tr>`

    const expenseRows = monthExpenses
      .map(
        (e) =>
          `<tr><td style="${rowStyle}">${e.date}</td><td style="${rowStyle}">${esc(e.description)}</td><td style="${rowStyle}">${esc(e.category)}</td><td style="${rowStyle}text-align:right;">${e.amount}</td></tr>`,
      )
      .join('')
    const expensesTotalRow = `<tr><td style="${totalStyle}"></td><td style="${totalStyle}"></td><td style="${totalStyle}">Total</td><td style="${totalStyle}text-align:right;">${totalExpenses}</td></tr>`

    const methodRows = PAYMENT_METHODS.map(
      (m) => `<tr><td style="${rowStyle}">${m}</td><td style="${rowStyle}text-align:right;">${collectedByMethod[m]}</td></tr>`,
    ).join('')
    const withdrawalRows = monthWithdrawals
      .map(
        (w) =>
          `<tr><td style="${rowStyle}">${w.date}</td><td style="${rowStyle}">${esc(w.note || 'Withdrawal')}</td><td style="${rowStyle}">${esc(w.method ?? 'Cash')}</td><td style="${rowStyle}text-align:right;">${w.amount}</td></tr>`,
      )
      .join('')
    const withdrawalsTotalRow = `<tr><td style="${totalStyle}"></td><td style="${totalStyle}"></td><td style="${totalStyle}">Total</td><td style="${totalStyle}text-align:right;">${totalWithdrawn}</td></tr>`
    const transferRows = monthTransfers
      .map(
        (t) =>
          `<tr><td style="${rowStyle}">${t.date}</td><td style="${rowStyle}">${esc(t.fromMethod)}</td><td style="${rowStyle}">${esc(t.toMethod)}</td><td style="${rowStyle}">${esc(t.note)}</td><td style="${rowStyle}text-align:right;">${t.amount}</td></tr>`,
      )
      .join('')

    const html = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
        <table style="border-collapse:collapse;">
          <tr><td colspan="4" style="font-family:Calibri;font-size:18px;font-weight:bold;color:#0f5238;padding:8px;">${esc(settings.businessName || 'Renta')} — Monthly Report</td></tr>
          <tr><td colspan="4" style="font-family:Calibri;font-size:13px;color:#404943;padding:0 8px 12px;">${monthLabel(month)}</td></tr>
          ${summaryRows}
          <tr><td colspan="4" style="padding:8px;"></td></tr>
          <tr><td colspan="2" style="${sectionStyle}">Rent Collected by Payment Method</td></tr>
          <tr><th style="${headStyle}">Method</th><th style="${headStyle}">Amount (PHP)</th></tr>
          ${methodRows}
          <tr><td colspan="4" style="padding:8px;"></td></tr>
          <tr><td colspan="5" style="${sectionStyle}">Tenant Payment Status${behindCount > 0 ? ` — ${behindCount} not fully paid` : ''}</td></tr>
          <tr><th style="${headStyle}">Tenant</th><th style="${headStyle}">Property</th><th style="${headStyle}">Status</th><th style="${headStyle}">Paid (PHP)</th><th style="${headStyle}">Balance (PHP)</th></tr>
          ${tenantStatusRows}
          <tr><td colspan="4" style="padding:8px;"></td></tr>
          <tr><td colspan="4" style="${sectionStyle}">Payments (${monthPayments.length})</td></tr>
          <tr><th style="${headStyle}">Date</th><th style="${headStyle}">Tenant</th><th style="${headStyle}">Method</th><th style="${headStyle}">Amount (PHP)</th></tr>
          ${paymentRows}
          ${monthPayments.length > 0 ? paymentsTotalRow : ''}
          <tr><td colspan="4" style="padding:8px;"></td></tr>
          <tr><td colspan="4" style="${sectionStyle}">Expenses (${monthExpenses.length})</td></tr>
          <tr><th style="${headStyle}">Date</th><th style="${headStyle}">Description</th><th style="${headStyle}">Category</th><th style="${headStyle}">Amount (PHP)</th></tr>
          ${expenseRows}
          ${monthExpenses.length > 0 ? expensesTotalRow : ''}
          <tr><td colspan="4" style="padding:8px;"></td></tr>
          <tr><td colspan="4" style="${sectionStyle}">Money Withdrawn (${monthWithdrawals.length})</td></tr>
          <tr><th style="${headStyle}">Date</th><th style="${headStyle}">For</th><th style="${headStyle}">Taken from</th><th style="${headStyle}">Amount (PHP)</th></tr>
          ${withdrawalRows}
          ${monthWithdrawals.length > 0 ? withdrawalsTotalRow : ''}
          <tr><td colspan="4" style="padding:8px;"></td></tr>
          <tr><td colspan="5" style="${sectionStyle}">Money Moved Between Cash / GCash / Check (${monthTransfers.length})</td></tr>
          <tr><th style="${headStyle}">Date</th><th style="${headStyle}">From</th><th style="${headStyle}">To</th><th style="${headStyle}">Note</th><th style="${headStyle}">Amount (PHP)</th></tr>
          ${transferRows}
        </table>
      </body>
      </html>`

    downloadFile(`renta-report-${month}.xls`, html, 'application/vnd.ms-excel')
  }

  return (
    <>
      <div className="flex items-start justify-between mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-background mb-1">Monthly Report</h1>
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
          className="border-2 border-outline rounded-lg px-3 py-2 text-lg bg-surface-container-lowest"
        />
      </div>

      <Card className="flex flex-col gap-4 w-full">
        <SectionHeader title={monthLabel(month)} icon="assessment" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-5 gap-x-4">
          <Stat label="Starting Balance" value={opening} color="text-on-background" />
          <Stat label="Rent Collected" value={collected} color="text-primary" />
          <Stat label="Expenses" value={totalExpenses} color="text-secondary" />
          <Stat label="Withdrawn" value={totalWithdrawn} color="text-on-background" />
          <Stat label="Ending Balance" value={closing} color="text-on-background" />
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <span className="text-sm font-semibold text-on-surface-variant">Rent collected by payment method</span>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <span key={m} className="inline-flex items-center rounded-full bg-surface-container-highest text-on-surface-variant font-semibold text-sm px-3.5 py-2">
                {m}: {formatCurrency(collectedByMethod[m])}
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm text-on-surface-variant">
          Money left carries into next month — {monthLabel(month)} ends at {formatCurrency(closing)}.
        </p>

        {monthPayments.length === 0 && monthExpenses.length === 0 && (
          <p className="text-on-surface-variant text-sm">No payments or expenses logged for {monthLabel(month)} yet.</p>
        )}
      </Card>

      {tenantStatuses.length > 0 && (
        <Card className="flex flex-col gap-3 w-full">
          <SectionHeader
            title="Tenant Payment Status"
            icon="group"
            subtitle={behindCount > 0 ? `${behindCount} tenant${behindCount === 1 ? '' : 's'} not fully paid this month` : "Everyone's paid up this month"}
          />
          <div className="flex flex-col gap-2">
            {tenantStatuses.map(({ tenant, status, balance }) => (
              <div key={tenant.id} className="flex items-center justify-between gap-3 py-2 border-b border-outline-variant/30 last:border-0">
                <div className="min-w-0">
                  <div className="font-semibold text-on-surface truncate">{tenant.name}</div>
                  <div className="text-sm text-on-surface-variant truncate">
                    {tenant.unit ? `Unit ${tenant.unit} - ` : ''}
                    {tenant.property}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {status !== 'paid' && <span className="text-sm text-secondary font-semibold">{formatCurrency(balance)} left</span>}
                  <Chip tone={status === 'paid' ? 'primary' : status === 'partial' ? 'tertiary' : 'secondary'} size="sm">
                    {status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Unpaid'}
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={exportExcel}
          className="w-full sm:w-auto flex-1 bg-surface-container-high text-on-surface px-8 h-14 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
        >
          <Icon name="table_view" className="text-[22px]" />
          Export Excel
        </button>
        <button
          onClick={() => setChoosingOrientation(true)}
          className="w-full sm:w-auto flex-1 bg-primary text-on-primary px-8 h-14 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Icon name="ios_share" className="text-[22px]" />
          Export PDF
        </button>
      </div>

      {choosingOrientation && (
        <div className="fixed inset-0 z-[60] bg-on-surface/40 flex items-center justify-center px-container-padding" onClick={() => setChoosingOrientation(false)}>
          <Card className="w-full max-w-sm flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-on-surface text-center">Choose page orientation</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => exportPdf('portrait')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-outline-variant hover:border-primary hover:bg-primary-container/10 transition-colors"
              >
                <div className="w-8 h-11 rounded border-2 border-on-surface-variant flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-on-surface">Portrait</div>
                  <div className="text-sm text-on-surface-variant">Taller than wide — good for printing</div>
                </div>
              </button>
              <button
                onClick={() => exportPdf('landscape')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-outline-variant hover:border-primary hover:bg-primary-container/10 transition-colors"
              >
                <div className="w-11 h-8 rounded border-2 border-on-surface-variant flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-on-surface">Landscape</div>
                  <div className="text-sm text-on-surface-variant">Wider than tall — more room for tables</div>
                </div>
              </button>
            </div>
            <button onClick={() => setChoosingOrientation(false)} className="text-sm font-semibold text-on-surface-variant hover:underline">
              Cancel
            </button>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter w-full items-start">
        {Object.keys(expensesByCategory).length > 0 && (
          <Card className="flex flex-col gap-3 w-full">
            <SectionHeader title="Expenses by Category" icon="receipt_long" />
            <PieChart
              slices={Object.entries(expensesByCategory).map(([cat, amt]) => ({
                label: EXPENSE_CATEGORIES.find((c) => c.value === cat)?.label ?? cat,
                value: amt,
              }))}
            />
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
      </div>

      {monthExpenses.length > 0 && (
        <Card className="flex flex-col w-full">
          <SectionHeader title={`Expenses — ${monthLabel(month)}`} icon="receipt_long" />
          <p className="text-sm text-on-surface-variant my-2">Made a mistake? Tap the pencil to fix it, or the trash to remove it.</p>
          {monthExpenses.map((e) => (
            <ExpenseRow key={e.id} expense={e} />
          ))}
        </Card>
      )}

      <Card className="flex flex-col w-full">
        <SectionHeader
          title={`Money Withdrawn — ${monthLabel(month)}`}
          icon="logout"
          subtitle={monthWithdrawals.length > 0 ? `${formatCurrency(totalWithdrawn)} taken out this month` : undefined}
          action={{ label: 'Withdraw', to: '/withdraw', icon: 'add' }}
        />
        {monthWithdrawals.length === 0 ? (
          <p className="text-sm text-on-surface-variant my-2">No money withdrawn in {monthLabel(month)}.</p>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant my-2">Tap the pencil to fix one, or the trash to remove it.</p>
            {monthWithdrawals.map((w) => (
              <WithdrawalRow key={w.id} withdrawal={w} />
            ))}
          </>
        )}
      </Card>

      <Card className="flex flex-col w-full">
        <SectionHeader
          title={`Money Moved — ${monthLabel(month)}`}
          icon="payments"
          subtitle="Cash, GCash and Check moves"
          action={{ label: 'Move money', to: '/move-money', icon: 'add' }}
        />
        {monthTransfers.length === 0 ? (
          <p className="text-sm text-on-surface-variant my-2">No money moved between Cash, GCash or Check in {monthLabel(month)}.</p>
        ) : (
          monthTransfers.map((t) => <TransferRow key={t.id} transfer={t} />)
        )}
      </Card>
    </>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col gap-1 md:px-4 md:first:pl-0 md:border-l md:first:border-l-0 border-outline-variant/40">
      <span className="text-on-surface-variant font-semibold">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{formatCurrency(value)}</span>
    </div>
  )
}
