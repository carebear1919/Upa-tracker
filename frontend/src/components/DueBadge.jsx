import { daysUntilDue, dueUrgency, dueLabel } from '../lib/store.js'
import Chip from './Chip.jsx'

const URGENCY_TONE = {
  overdue: 'secondary',
  today: 'secondary',
  soon: 'tertiary',
  later: 'neutral',
}

export default function DueBadge({ dueDay }) {
  const diff = daysUntilDue(dueDay)
  const urgency = dueUrgency(diff)
  return (
    <Chip tone={URGENCY_TONE[urgency]} size="md">
      {dueLabel(diff)}
    </Chip>
  )
}
