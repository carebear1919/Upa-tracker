import { formatCurrency } from '../lib/store.js'

function monthKeyOffset(offset, base) {
  let year = base.getFullYear()
  let month = base.getMonth() + 1 + offset
  while (month < 1) {
    month += 12
    year -= 1
  }
  while (month > 12) {
    month -= 12
    year += 1
  }
  return `${year}-${String(month).padStart(2, '0')}`
}

function shortLabel(monthKey) {
  const [y, m] = monthKey.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleString(undefined, { month: 'short' })
}

// The one chart that matters for a small rental ledger: are you collecting
// more than you're spending, month over month. Kept to a simple grouped bar
// per the design system's "avoid dense charts" rule — no axes, no legend clutter.
export default function MonthlyTrendChart({ payments, expenses, anchorMonth }) {
  const anchorDate = new Date(`${anchorMonth}-01T00:00:00`)
  const months = Array.from({ length: 6 }, (_, i) => monthKeyOffset(i - 5, anchorDate))

  const data = months.map((m) => ({
    month: m,
    collected: payments.filter((p) => p.monthCovered === m).reduce((s, p) => s + Number(p.amount), 0),
    spent: expenses.filter((e) => e.date.startsWith(m)).reduce((s, e) => s + Number(e.amount), 0),
  }))

  const max = Math.max(1, ...data.flatMap((d) => [d.collected, d.spent]))
  const chartH = 160
  const barW = 22
  const groupGap = 44
  const width = data.length * groupGap + 20

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-4 mb-3 text-sm text-on-surface-variant">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary inline-block" /> Rent Collected</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-secondary inline-block" /> Expenses</span>
      </div>
      <svg viewBox={`0 0 ${width} ${chartH + 30}`} width="100%" height={chartH + 30} role="img" aria-label="Rent collected vs expenses, last 6 months">
        {data.map((d, i) => {
          const groupX = 10 + i * groupGap
          const collectedH = (d.collected / max) * chartH
          const spentH = (d.spent / max) * chartH
          return (
            <g key={d.month}>
              <rect x={groupX} y={chartH - collectedH} width={barW} height={collectedH} rx="3" className="fill-primary" />
              <rect x={groupX + barW + 4} y={chartH - spentH} width={barW} height={spentH} rx="3" className="fill-secondary" />
              <text x={groupX + barW + 2} y={chartH + 18} textAnchor="middle" fontSize="11" className="fill-current text-on-surface-variant">
                {shortLabel(d.month)}
              </text>
              <title>
                {shortLabel(d.month)}: Collected {formatCurrency(d.collected)}, Expenses {formatCurrency(d.spent)}
              </title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
