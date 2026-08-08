import { daysUntilDue, dueUrgency, dueLabel, URGENCY_STYLES } from '../lib/store.js'

export default function DueBadge({ dueDay }) {
  const diff = daysUntilDue(dueDay)
  const urgency = dueUrgency(diff)
  return (
    <span className={`text-sm font-semibold uppercase px-3 py-1 rounded-full whitespace-nowrap ${URGENCY_STYLES[urgency]}`}>
      {dueLabel(diff)}
    </span>
  )
}
