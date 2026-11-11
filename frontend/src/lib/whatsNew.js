import { useSyncExternalStore } from 'react'

// Newest first. To announce an update: add an entry at the top with a new
// `version`. Everyone sees it once automatically, and it stays viewable from
// Settings → What's New. Keep the wording plain — the reader isn't technical.
export const UPDATES = [
  {
    version: '1.1',
    date: 'November 2026',
    items: [
      { icon: 'payments', title: 'Cash, GCash or Check', text: 'When you log a payment, choose how it was paid.' },
      { icon: 'home', title: 'Where the money is', text: 'Home and Reports now show how much is in Cash, GCash and Check.' },
      { icon: 'logout', title: 'Withdraw money', text: 'Record money you take out. It comes off Money Left.' },
      { icon: 'chevron_right', title: 'Move money', text: 'Cashed a check? Move it between places. Nothing is lost.' },
      { icon: 'assessment', title: 'Clearer reports', text: 'PDF and Excel reports list the money in each place, and the numbers line up.' },
      { icon: 'check_circle', title: 'Safer saving', text: "You'll see \"saved\" after each entry, and a warning if something didn't reach the cloud." },
      { icon: 'edit', title: 'Fix mistakes anywhere', text: "Edit or remove this month's entries right on the Withdraw, Add Expense and Move Money screens." },
    ],
  },
]

export const LATEST_VERSION = UPDATES[0].version

const SEEN_KEY = 'renta-whatsnew-seen'

export function hasSeenLatest() {
  try {
    return localStorage.getItem(SEEN_KEY) === LATEST_VERSION
  } catch {
    return true // storage blocked: never nag
  }
}

export function markLatestSeen() {
  try {
    localStorage.setItem(SEEN_KEY, LATEST_VERSION)
  } catch {
    // nothing to do — worst case she sees it once more
  }
}

let open = false
const listeners = new Set()

function setOpen(next) {
  open = next
  listeners.forEach((l) => l())
}

export const openWhatsNew = () => setOpen(true)
export const closeWhatsNew = () => setOpen(false)

export function useWhatsNewOpen() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => open,
  )
}
