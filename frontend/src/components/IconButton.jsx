import Icon from './Icon.jsx'

const VARIANT_CLASS = {
  default: 'text-on-surface-variant hover:bg-surface-container-high',
  danger: 'text-error hover:bg-error-container',
}

export default function IconButton({ icon, 'aria-label': ariaLabel, onClick, variant = 'default', className = '', iconClassName = 'text-[20px]' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex items-center justify-center min-h-tap-target-min min-w-tap-target-min rounded-full transition-colors ${VARIANT_CLASS[variant]} ${className}`}
    >
      <Icon name={icon} className={iconClassName} />
    </button>
  )
}
