const VARIANT_CLASS = {
  default: 'bg-surface-container-lowest shadow-level-1 rounded-xl',
  nested: 'bg-surface-container-low rounded-lg',
  danger: 'bg-surface-container-lowest shadow-level-1 border-2 border-error/30 rounded-xl',
}

const PADDING_CLASS = {
  none: '',
  md: 'p-4',
  lg: 'p-6',
}

export default function Card({ variant = 'default', padding = 'lg', className = '', children, ...props }) {
  return (
    <div className={`${VARIANT_CLASS[variant]} ${PADDING_CLASS[padding]} ${className}`} {...props}>
      {children}
    </div>
  )
}
