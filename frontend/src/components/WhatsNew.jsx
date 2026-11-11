import { useEffect, useRef } from 'react'
import { UPDATES, hasSeenLatest, markLatestSeen, openWhatsNew, closeWhatsNew, useWhatsNewOpen } from '../lib/whatsNew.js'
import Icon from './Icon.jsx'

// Mounted once inside the signed-in app. Opens by itself the first time a new
// version is seen, and any time via openWhatsNew() (Settings).
export default function WhatsNew() {
  const open = useWhatsNewOpen()
  const doneRef = useRef(null)

  useEffect(() => {
    if (!hasSeenLatest()) {
      markLatestSeen() // "once shown" means once — even if she navigates away
      openWhatsNew()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    doneRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && closeWhatsNew()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[65] bg-on-surface/40 flex items-end md:items-center justify-center md:px-container-padding" onClick={closeWhatsNew}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsnew-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] flex flex-col bg-surface-container-lowest shadow-level-2 rounded-t-2xl md:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 p-6 pb-3">
          <div>
            <h2 id="whatsnew-title" className="text-2xl font-bold text-on-surface">What's New</h2>
            <p className="text-sm text-on-surface-variant">
              Version {UPDATES[0].version} · {UPDATES[0].date}
            </p>
          </div>
          <button
            onClick={closeWhatsNew}
            aria-label="Close"
            className="flex items-center justify-center min-h-tap-target-min min-w-tap-target-min -mt-2 -mr-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <Icon name="close" className="text-[22px]" />
          </button>
        </div>

        <div className="overflow-y-auto px-6">
          {UPDATES.map((u, i) => (
            <section key={u.version} aria-label={`Version ${u.version}`}>
              {i > 0 && (
                <h3 className="font-bold text-on-surface pt-4 pb-1">
                  Version {u.version} · {u.date}
                </h3>
              )}
              <ul className="flex flex-col divide-y divide-outline-variant/40">
                {u.items.map((item) => (
                  <li key={item.title} className="flex items-start gap-3 py-3">
                    <Icon name={item.icon} className="text-primary text-[22px] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-on-surface">{item.title}</p>
                      <p className="text-on-surface-variant">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="p-6 pt-4">
          <button
            ref={doneRef}
            onClick={closeWhatsNew}
            className="w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg hover:bg-primary-container transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
