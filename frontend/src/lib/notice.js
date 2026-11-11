import { useSyncExternalStore } from 'react'

// One app-wide message line: a short "saved" confirmation, or a "didn't save"
// warning that stays until it's dismissed or the retry works. Lives outside the
// screens so it survives the navigate() that follows every save.
const SUCCESS_MS = 3000

let notice = null
let timer = null
let counter = 0
const listeners = new Set()

function set(next) {
  clearTimeout(timer)
  notice = next
  listeners.forEach((l) => l())
  if (next && next.kind === 'success') {
    const id = next.id
    timer = setTimeout(() => {
      if (notice && notice.id === id) set(null)
    }, SUCCESS_MS)
  }
}

export function notify(text) {
  // Never hide an unresolved failure behind a success message.
  if (notice && notice.kind === 'error') return
  set({ id: ++counter, kind: 'success', text })
}

// `retry` should return a promise resolving true when the write finally worked.
export function notifyError(text, retry) {
  set({ id: ++counter, kind: 'error', text, retry })
}

export function dismissNotice() {
  set(null)
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useNotice() {
  return useSyncExternalStore(subscribe, () => notice)
}
