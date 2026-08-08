import { useState } from 'react'
import { db, useStore } from '../lib/store.js'
import { hashPin, verifyPin } from '../lib/pin.js'
import Icon from '../components/Icon.jsx'

export default function Settings({ onLock }) {
  const { settings } = useStore()
  const [changingPin, setChangingPin] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [saved, setSaved] = useState(false)

  const [clearing, setClearing] = useState(false)
  const [clearPin, setClearPin] = useState('')
  const [clearError, setClearError] = useState('')
  const [cleared, setCleared] = useState(false)
  const [sampleLoaded, setSampleLoaded] = useState(false)

  const [openingBalance, setOpeningBalance] = useState(settings.openingBalance ?? 0)
  const [balanceSaved, setBalanceSaved] = useState(false)

  function loadSample() {
    db.loadSampleData()
    setSampleLoaded(true)
  }

  function saveOpeningBalance(e) {
    e.preventDefault()
    db.updateSettings({ openingBalance: Number(openingBalance) || 0 })
    setBalanceSaved(true)
  }

  async function confirmClear(e) {
    e.preventDefault()
    const ok = await verifyPin(clearPin, settings.pinHash)
    if (!ok) {
      setClearError('Wrong PIN.')
      setClearPin('')
      return
    }
    db.clearAllData()
    setClearing(false)
    setClearPin('')
    setClearError('')
    setCleared(true)
  }

  async function savePin(e) {
    e.preventDefault()
    if (newPin.length < 4 || newPin.length > 6) {
      setPinError('PIN must be 4-6 digits.')
      return
    }
    if (newPin !== confirmPin) {
      setPinError("PINs didn't match.")
      return
    }
    db.updateSettings({ pinHash: await hashPin(newPin) })
    setChangingPin(false)
    setNewPin('')
    setConfirmPin('')
    setPinError('')
    setSaved(true)
  }

  return (
    <>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Settings</h1>
        <p className="text-on-surface-variant">Manage your account security and reminder preferences.</p>
      </div>

      <section className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-2 w-full">
        <h2 className="text-xl font-semibold text-on-surface mb-2">Security</h2>
        <p className="text-on-surface-variant mb-4">Keep your account safe by updating your PIN.</p>

        {!changingPin ? (
          <button
            onClick={() => setChangingPin(true)}
            className="w-full md:w-auto min-h-[56px] px-6 bg-surface-container-low border-2 border-outline-variant rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
          >
            <Icon name="lock_reset" className="text-[22px]" />
            <span className="font-semibold">Change my PIN</span>
          </button>
        ) : (
          <form onSubmit={savePin} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-on-surface-variant">New PIN</span>
              <input
                type="password"
                inputMode="numeric"
                minLength={4}
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-on-surface-variant">Confirm PIN</span>
              <input
                type="password"
                inputMode="numeric"
                minLength={4}
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className={inputCls}
              />
            </label>
            {pinError && <p className="text-secondary font-medium">{pinError}</p>}
            <div className="flex gap-3">
              <button type="submit" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-container transition-colors">
                Save PIN
              </button>
              <button type="button" onClick={() => setChangingPin(false)} className="px-6 py-3 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-2 w-full">
        <h2 className="text-xl font-semibold text-on-surface mb-2">Starting Balance</h2>
        <p className="text-on-surface-variant mb-4">
          Already have money set aside from before you started using Renta? Add it here once — it carries into every month's balance from now on.
        </p>
        <form onSubmit={saveOpeningBalance} className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <label className="flex flex-col gap-1 flex-1 max-w-xs">
            <span className="font-semibold text-on-surface-variant">Current balance on hand</span>
            <input
              type="number"
              min="0"
              step="1"
              value={openingBalance}
              onChange={(e) => {
                setOpeningBalance(e.target.value)
                setBalanceSaved(false)
              }}
              className={inputCls}
            />
          </label>
          <button type="submit" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-container transition-colors min-h-tap-target-min">
            Save
          </button>
        </form>
      </section>

      <section className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-2 w-full">
        <h2 className="text-xl font-semibold text-on-surface mb-2">Sample Data</h2>
        <p className="text-on-surface-variant mb-4">
          Load example tenants, payments, and expenses so you can try out the app. Replaces whatever's currently there.
        </p>
        <button
          onClick={loadSample}
          className="w-full md:w-auto min-h-[56px] px-6 bg-surface-container-low border-2 border-outline-variant rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
        >
          <Icon name="table_view" className="text-[22px]" />
          <span className="font-semibold">Load Sample Data</span>
        </button>
      </section>

      <section className="bg-surface shadow-level-1 rounded-xl p-6 flex flex-col gap-2 w-full border-2 border-error/30">
        <h2 className="text-xl font-semibold text-error mb-2">Danger Zone</h2>
        <p className="text-on-surface-variant mb-4">
          Erases every tenant, payment, and expense. This can't be undone. Your PIN stays the same.
        </p>

        {!clearing ? (
          <button
            onClick={() => setClearing(true)}
            className="w-full md:w-auto min-h-[56px] px-6 bg-error-container text-on-error-container rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Icon name="delete_forever" className="text-[22px]" />
            <span className="font-semibold">Clear All Data</span>
          </button>
        ) : (
          <form onSubmit={confirmClear} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-on-surface-variant">Enter your PIN to confirm</span>
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                minLength={4}
                maxLength={6}
                value={clearPin}
                onChange={(e) => setClearPin(e.target.value.replace(/\D/g, ''))}
                className={inputCls}
              />
            </label>
            {clearError && <p className="text-secondary font-medium">{clearError}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-error text-on-error px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Erase Everything
              </button>
              <button
                type="button"
                onClick={() => {
                  setClearing(false)
                  setClearPin('')
                  setClearError('')
                }}
                className="px-6 py-3 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      <div className="pt-4 flex flex-col md:flex-row justify-center md:justify-end gap-4">
        {saved && <span className="text-primary font-semibold self-center">Saved!</span>}
        {balanceSaved && <span className="text-primary font-semibold self-center">Starting balance saved.</span>}
        {sampleLoaded && <span className="text-primary font-semibold self-center">Sample data loaded.</span>}
        {cleared && <span className="text-primary font-semibold self-center">All data cleared.</span>}
        <button
          onClick={onLock}
          className="w-full md:w-auto min-h-[56px] px-8 bg-surface-container-low border-2 border-secondary text-secondary rounded-lg flex items-center justify-center gap-2 hover:bg-secondary-container/20 transition-colors"
        >
          <Icon name="lock" className="text-[22px]" />
          <span className="font-semibold">Lock App</span>
        </button>
      </div>
    </>
  )
}

const inputCls = 'w-full min-h-tap-target-min border-2 border-outline-variant rounded-lg px-4 text-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'
