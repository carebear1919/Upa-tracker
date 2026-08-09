import Icon from './Icon.jsx'

// Tone -> filled background classes, used for status display and for
// selected filter/selector chips. Mirrors the app's meaning-by-color rule
// (see URGENCY_STYLES in lib/store.js): secondary = urgent/red, tertiary =
// caution/gold, primary = positive/brand, neutral = inactive/gray.
const TONE_FILLED = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary text-on-secondary',
  tertiary: 'bg-tertiary text-on-tertiary',
  neutral: 'bg-surface-container-highest text-on-surface-variant',
  error: 'bg-error-container text-on-error-container',
}

const TONE_CONTAINER = {
  primary: 'bg-primary-container text-on-primary-container',
  secondary: 'bg-secondary-container text-on-secondary-container',
  tertiary: 'bg-tertiary-container text-on-tertiary-container',
  neutral: 'bg-surface-container-highest text-on-surface-variant',
  error: 'bg-error-container text-on-error-container',
}

const UNSELECTED = 'bg-transparent text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'

const SIZE_CLASS = {
  sm: 'text-xs px-2.5 py-1 gap-1',
  md: 'text-sm px-3.5 py-2 gap-1.5',
}

export default function Chip({
  tone = 'neutral',
  variant = 'status',
  selected = false,
  icon,
  size = 'sm',
  onClick,
  count,
  children,
  className = '',
}) {
  const shape = 'inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap transition-colors'
  const sizing = SIZE_CLASS[variant === 'selector' ? 'md' : size]

  if (variant === 'status') {
    return (
      <span className={`${shape} ${sizing} uppercase ${TONE_FILLED[tone]} ${className}`}>
        {icon && <Icon name={icon} className="text-[14px]" />}
        {children}
      </span>
    )
  }

  const activeClass = variant === 'selector' ? TONE_CONTAINER[tone] : TONE_FILLED[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`${shape} ${sizing} min-h-tap-target-min ${selected ? activeClass : UNSELECTED} ${className}`}
    >
      {icon && <Icon name={icon} className="text-[16px]" />}
      {children}
      {typeof count === 'number' && <span className="opacity-70">({count})</span>}
    </button>
  )
}
