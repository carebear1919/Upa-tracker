import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

export default function SectionHeader({ title, icon, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-lg font-bold text-on-surface">
          {icon && <Icon name={icon} className="text-primary text-[20px]" />}
          {title}
        </h2>
        {subtitle && <p className="text-sm text-on-surface-variant mt-0.5">{subtitle}</p>}
      </div>
      {action &&
        (action.to ? (
          <Link
            to={action.to}
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline flex-shrink-0"
          >
            {action.icon && <Icon name={action.icon} className="text-[16px]" />}
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline flex-shrink-0"
          >
            {action.icon && <Icon name={action.icon} className="text-[16px]" />}
            {action.label}
          </button>
        ))}
    </div>
  )
}
