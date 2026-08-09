// Self-hosted stroke icons — no external font/network dependency, so icons
// still render offline (the app is offline-first per the project spec).
const PATHS = {
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
  group: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20.5v-1.2a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1.2" /><circle cx="18" cy="9" r="2.4" /><path d="M16 9.3a4.2 4.2 0 0 1 5.5 4v1.2" /></>,
  assessment: <><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M2.5 20h19" /></>,
  notifications: <><path d="M18 8.5a6 6 0 1 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17s-2.5-2-2.5-8.5" /><path d="M13.7 20.5a2 2 0 0 1-3.4 0" /></>,
  settings: <><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c0 .7.4 1.3 1 1.6H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  payments: <><rect x="2" y="6" width="20" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.8" /><path d="M6 12h.01M18 12h.01" /></>,
  receipt_long: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
  add: <path d="M12 5v14M5 12h14" />,
  arrow_back: <path d="M19 12H5M11 18l-6-6 6-6" />,
  apartment: <><rect x="4" y="3" width="16" height="18" /><path d="M9 21v-4h6v4M9 8h.01M9 12h.01M15 8h.01M15 12h.01" /></>,
  call: <path d="M21.9 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2.1h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L7.9 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.9 2.1z" />,
  calendar_today: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  add_circle: <><circle cx="12" cy="12" r="9.5" /><path d="M12 8v8M8 12h8" /></>,
  person: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></>,
  medication: <><rect x="9.5" y="3" width="5" height="18" rx="1.5" /><rect x="3" y="9.5" width="18" height="5" rx="1.5" /></>,
  home_repair_service: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L2.5 18.5l3 3L12.3 15a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2z" />,
  ios_share: <><path d="M12 15.5V3.5M8 7.5l4-4 4 4" /><path d="M4.5 15v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15" /></>,
  chat: <path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 9 9 0 0 1-4-1L3 20l1.1-4.9A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z" />,
  sms: <><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 9 9 0 0 1-4-1L3 20l1.1-4.9A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z" /><path d="M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01" /></>,
  forum: <><path d="M17 8h-1a4 4 0 0 0-4 4v1.5a4 4 0 0 0 4 4h.3l2.7 2.2v-2.4a4 4 0 0 0 2-3.3V12a4 4 0 0 0-4-4z" /><path d="M9.5 3.5h-1a4 4 0 0 0-4 4V9a4 4 0 0 0 2 3.5" /></>,
  check_circle: <><circle cx="12" cy="12" r="9.5" /><path d="M8 12.3l2.6 2.6L16.5 9" /></>,
  lock_reset: <><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.9-.8" /><path d="M16.5 3.5v3h-3" /></>,
  lock: <><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  backspace: <><path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z" /><path d="M12.5 10l4 4M16.5 10l-4 4" /></>,
  account_circle: <><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="10" r="3" /><path d="M5.7 18.5a6.5 6.5 0 0 1 12.6 0" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  delete_forever: <><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
  table_view: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 10v10" /></>,
  storefront: <><path d="M3 9l1.5-5h15L21 9" /><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" /><path d="M5 9v10h14V9" /><path d="M9 19v-6h6v6" /></>,
  chevron_left: <path d="M15 18l-6-6 6-6" />,
  chevron_right: <path d="M9 18l6-6-6-6" />,
  more_vert: <><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></>,
  close: <path d="M18 6L6 18M6 6l12 12" />,
}

export default function Icon({ name, className = '', filled = false }) {
  const path = PATHS[name]
  if (!path) return null
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block flex-shrink-0 ${className}`}
      width="1em"
      height="1em"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}
