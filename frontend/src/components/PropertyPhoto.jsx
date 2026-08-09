import Icon from './Icon.jsx'

export default function PropertyPhoto({ photo, size = 48, rounded = 'rounded-lg' }) {
  const style = { width: size, height: size }
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={style}
        className={`${rounded} object-cover flex-shrink-0 bg-surface-variant`}
      />
    )
  }
  return (
    <div
      style={{ ...style, fontSize: `${size * 0.45}px` }}
      className={`${rounded} bg-surface-variant flex items-center justify-center flex-shrink-0`}
    >
      <Icon name="apartment" className="text-on-surface-variant" />
    </div>
  )
}
