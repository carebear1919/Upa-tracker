import { formatCurrency } from '../lib/store.js'

const SLICE_COLORS = ['fill-secondary', 'fill-tertiary', 'fill-primary', 'fill-on-surface-variant']
const DOT_COLORS = ['bg-secondary', 'bg-tertiary', 'bg-primary', 'bg-on-surface-variant']

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeSlice(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

// Self-hosted SVG pie chart — no chart library, matches MonthlyTrendChart's
// approach so the app stays offline-first with zero added dependencies.
export default function PieChart({ slices, size = 160 }) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  const r = size / 2
  const cx = r
  const cy = r

  let angle = 0
  const paths = slices.map((slice, i) => {
    const sliceAngle = total > 0 ? (slice.value / total) * 360 : 0
    const start = angle
    const end = angle + sliceAngle
    angle = end
    return { ...slice, start, end, colorClass: SLICE_COLORS[i % SLICE_COLORS.length] }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Breakdown by category">
        {total <= 0 ? (
          <circle cx={cx} cy={cy} r={r} className="fill-surface-container-high" />
        ) : paths.length === 1 ? (
          <circle cx={cx} cy={cy} r={r} className={paths[0].colorClass} />
        ) : (
          paths.map((p) => (
            <path key={p.label} d={describeSlice(cx, cy, r, p.start, p.end)} className={p.colorClass}>
              <title>
                {p.label}: {formatCurrency(p.value)} ({Math.round((p.value / total) * 100)}%)
              </title>
            </path>
          ))
        )}
      </svg>
      <div className="flex flex-col gap-2 min-w-0">
        {paths.map((p, i) => (
          <div key={p.label} className="flex items-center gap-2 text-sm">
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${DOT_COLORS[i % DOT_COLORS.length]}`} />
            <span className="text-on-surface-variant truncate">{p.label}</span>
            <span className="font-semibold text-on-surface flex-shrink-0">
              {total > 0 ? Math.round((p.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
