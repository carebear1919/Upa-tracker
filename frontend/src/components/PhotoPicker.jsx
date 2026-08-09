import { useRef, useState } from 'react'
import { fileToResizedDataUrl } from '../lib/image.js'
import PropertyPhoto from './PropertyPhoto.jsx'
import Icon from './Icon.jsx'

export default function PhotoPicker({ photo, onChange }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await fileToResizedDataUrl(file, 480)
      onChange(dataUrl)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex items-center gap-4">
      <PropertyPhoto photo={photo} size={64} />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border-2 border-outline-variant hover:bg-surface-container-high transition-colors min-h-tap-target-min disabled:opacity-60"
        >
          <Icon name="add_circle" className="text-[20px]" />
          {busy ? 'Adding...' : photo ? 'Change Photo' : 'Add Property Photo'}
        </button>
        {photo && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="px-4 py-2 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors min-h-tap-target-min"
          >
            Remove
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  )
}
