import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import PinLock from './screens/PinLock.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Tenants from './screens/Tenants.jsx'
import TenantDetail from './screens/TenantDetail.jsx'
import LogPayment from './screens/LogPayment.jsx'
import AddExpense from './screens/AddExpense.jsx'
import Payments from './screens/Payments.jsx'
import Reports from './screens/Reports.jsx'
import Reminders from './screens/Reminders.jsx'
import Settings from './screens/Settings.jsx'
import Icon from './components/Icon.jsx'
import { useStore } from './lib/store.js'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
      <Icon name="home" className="text-primary text-[40px] animate-pulse" />
      <span className="font-bold text-2xl text-primary">Renta</span>
    </div>
  )
}

export default function App() {
  const { settings, loading } = useStore()
  const [unlocked, setUnlocked] = useState(false)

  // Don't decide the PIN gate off data that hasn't loaded yet (Supabase fetch
  // is async) — that would either flash the app unlocked or wrongly show the
  // first-run "create a PIN" screen to a returning user.
  useEffect(() => {
    if (!loading && !settings.pinHash) setUnlocked(true)
  }, [loading, settings.pinHash])

  if (loading) {
    return <LoadingScreen />
  }

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/tenants/:id" element={<TenantDetail />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/log-payment" element={<LogPayment />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/settings" element={<Settings onLock={() => setUnlocked(false)} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
