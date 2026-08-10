import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Onboarding from './components/Onboarding.jsx'
import Login from './screens/Login.jsx'
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
import { logout } from './lib/supabase.js'
import { ONBOARDED_KEY } from './components/Onboarding.jsx'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
      <Icon name="home" className="text-primary text-[40px] animate-pulse" />
      <span className="font-bold text-2xl text-primary">Renta</span>
    </div>
  )
}

export default function App() {
  const { loading, authNeeded } = useStore()
  const [unlocked, setUnlocked] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(() => localStorage.getItem(ONBOARDED_KEY) === '1')

  async function handleLogout() {
    setUnlocked(false)
    await logout()
  }

  function finishOnboarding() {
    localStorage.setItem(ONBOARDED_KEY, '1')
    setOnboardingDone(true)
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (authNeeded) {
    return <Login />
  }

  // PinLock handles both first-run ("create a PIN") and returning-user
  // ("enter PIN") on its own based on whether settings.pinHash is set — every
  // account, new or existing, goes through this every time the app opens.
  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} onLogout={handleLogout} />
  }

  // Shown once per device right after unlocking, until finished or skipped —
  // covers brand-new accounts (right after creating their PIN) and any
  // existing account opening the app on a device that hasn't seen it yet.
  if (!onboardingDone) {
    return <Onboarding onFinish={finishOnboarding} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLock={() => setUnlocked(false)} onLogout={handleLogout} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/tenants/:id" element={<TenantDetail />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/log-payment" element={<LogPayment />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/settings" element={<Settings onLock={() => setUnlocked(false)} onLogout={handleLogout} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
