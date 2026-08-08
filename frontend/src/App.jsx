import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import PinLock from './screens/PinLock.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Tenants from './screens/Tenants.jsx'
import TenantDetail from './screens/TenantDetail.jsx'
import LogPayment from './screens/LogPayment.jsx'
import AddExpense from './screens/AddExpense.jsx'
import Reports from './screens/Reports.jsx'
import Reminders from './screens/Reminders.jsx'
import Settings from './screens/Settings.jsx'
import { useStore } from './lib/store.js'

export default function App() {
  const { settings } = useStore()
  const [unlocked, setUnlocked] = useState(!settings.pinHash)

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
