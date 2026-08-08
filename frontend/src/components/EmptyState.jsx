import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

export default function EmptyState({ icon, title, message, actionLabel, actionTo, onAction, actionIcon = 'add' }) {
  const actionCls =
    'mt-2 inline-flex items-center gap-2 bg-primary text-on-primary font-semibold px-6 py-3 rounded-full min-h-tap-target-min hover:bg-primary-container transition-colors'

  return (
    <div className="w-full flex flex-col items-center text-center gap-3 py-16 px-6">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
        <Icon name={icon} className="text-[32px] text-on-surface-variant" />
      </div>
      <h3 className="text-xl font-semibold text-on-surface">{title}</h3>
      <p className="text-on-surface-variant max-w-sm">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className={actionCls}>
          <Icon name={actionIcon} className="text-[20px]" />
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button onClick={onAction} className={actionCls}>
          <Icon name={actionIcon} className="text-[20px]" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
