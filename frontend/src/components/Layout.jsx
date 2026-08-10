import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Icon from './Icon.jsx'

const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Home', icon: 'home', end: true }],
  },
  {
    label: 'Money',
    items: [
      { to: '/payments', label: 'Payments', icon: 'payments' },
      { to: '/reports', label: 'Reports', icon: 'assessment' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/tenants', label: 'Tenants', icon: 'group' },
      { to: '/reminders', label: 'Reminders', icon: 'notifications' },
    ],
  },
  {
    label: 'App',
    items: [{ to: '/settings', label: 'Settings', icon: 'settings' }],
  },
]

const navItems = navGroups.flatMap((group) => group.items)

const COLLAPSE_KEY = 'renta-sidebar-collapsed'

export default function Layout({ onLock, onLogout }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')
  const [hovering, setHovering] = useState(false)

  // Hovering a collapsed sidebar temporarily shows it expanded, without
  // touching the persisted collapsed preference — the main content's margin
  // stays put (still keyed off `collapsed`), so this reads as an overlay
  // peeking out rather than the whole page reflowing.
  const expanded = !collapsed || hovering

  function toggle() {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1')
      return !c
    })
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside
        onMouseEnter={() => collapsed && setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 bg-surface-container-lowest shadow-level-1 border-r border-surface-variant gap-8 z-40 transition-[width] duration-200 ${
          expanded ? 'md:w-60 p-6' : 'md:w-20 p-3'
        }`}
      >
        <div className={`flex items-center ${expanded ? 'justify-between' : 'flex-col gap-3'}`}>
          <NavLink to="/" className="flex items-center gap-2 min-w-0" title="Renta">
            <Icon name="home" className="text-primary text-[28px] flex-shrink-0" />
            {expanded && <span className="font-bold text-2xl text-primary truncate">Renta</span>}
          </NavLink>
          <button
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors flex-shrink-0"
          >
            <Icon name={collapsed ? 'chevron_right' : 'chevron_left'} className="text-[20px]" />
          </button>
        </div>
        <nav className="flex flex-col gap-4">
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              {expanded && (
                <span className="px-4 text-xs font-bold uppercase tracking-wide text-on-surface-variant/60">
                  {group.label}
                </span>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-lg transition-colors ${
                      expanded ? '' : 'justify-center px-0'
                    } ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`
                  }
                >
                  <Icon name={item.icon} className="text-[22px] flex-shrink-0" />
                  {expanded && item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={`mt-auto flex flex-col gap-1 pt-4 border-t border-outline-variant/30 ${expanded ? '' : 'items-center'}`}>
          <button
            onClick={onLock}
            title="Lock App"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors ${
              expanded ? '' : 'justify-center px-0 w-11'
            }`}
          >
            <Icon name="lock" className="text-[20px] flex-shrink-0" />
            {expanded && 'Lock App'}
          </button>
          <button
            onClick={onLogout}
            title="Log Out"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-secondary hover:bg-surface-container-high transition-colors ${
              expanded ? '' : 'justify-center px-0 w-11'
            }`}
          >
            <Icon name="logout" className="text-[20px] flex-shrink-0" />
            {expanded && 'Log Out'}
          </button>
        </div>
      </aside>

      <header className="md:hidden w-full bg-surface-container-lowest shadow-level-1 border-b border-surface-variant sticky top-0 z-50 flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <Icon name="home" className="text-primary text-[28px]" />
          <span className="font-bold text-xl text-primary">Renta</span>
        </NavLink>
        <div className="flex items-center gap-1">
          <button
            onClick={onLock}
            aria-label="Lock App"
            className="flex items-center justify-center min-h-tap-target-min min-w-tap-target-min rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <Icon name="lock" className="text-[20px]" />
          </button>
          <button
            onClick={onLogout}
            aria-label="Log Out"
            className="flex items-center justify-center min-h-tap-target-min min-w-tap-target-min rounded-full text-secondary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="logout" className="text-[20px]" />
          </button>
        </div>
      </header>

      <div className={`flex-1 flex flex-col pb-20 md:pb-0 transition-[margin] duration-200 ${collapsed ? 'md:ml-20' : 'md:ml-60'}`}>
        <main className="w-full flex flex-col gap-stack-gap px-4 md:px-container-padding py-6 md:py-8 flex-grow">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 w-full flex justify-around items-center py-2 px-1 md:hidden bg-surface-container-lowest shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center rounded-xl px-1 py-2 min-h-tap-target-min flex-1 active:scale-90 transition-transform duration-200 ${
                isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
              }`
            }
          >
            <Icon name={item.icon} className="text-[20px]" />
            <span className="text-[10px] font-medium mt-1 leading-tight">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
