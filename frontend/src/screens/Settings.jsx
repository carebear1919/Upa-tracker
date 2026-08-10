import { useState } from 'react'
import { db, useStore } from '../lib/store.js'
import { hashPin, verifyPin } from '../lib/pin.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'
import Toast, { useToast } from '../components/Toast.jsx'

const inputCls = 'w-full min-h-tap-target-min border-2 border-outline-variant rounded-lg px-4 text-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

function PinField({ label, value, onChange, ...props }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-semibold text-on-surface-variant">{label}</span>
      <input
        type="password"
        inputMode="numeric"
        minLength={4}
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        className={inputCls}
        {...props}
      />
    </label>
  )
}

function Learn({ children }) {
  return (
    <details className="text-sm text-on-surface-variant">
      <summary className="cursor-pointer font-semibold text-primary select-none">Learn more</summary>
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </details>
  )
}

export default function Settings({ onLock, onLogout }) {
  const { settings } = useStore()
  const [toastMsg, showToast] = useToast()

  const [changingPin, setChangingPin] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')

  const [clearing, setClearing] = useState(false)
  const [clearPin, setClearPin] = useState('')
  const [clearError, setClearError] = useState('')

  const [openingBalance, setOpeningBalance] = useState(settings.openingBalance ?? 0)

  function loadSample() {
    db.loadSampleData()
    showToast('Sample data loaded.')
  }

  function saveOpeningBalance(e) {
    e.preventDefault()
    db.updateSettings({ openingBalance: Number(openingBalance) || 0 })
    showToast('Starting balance saved.')
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
    showToast('All data cleared.')
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
    showToast('PIN saved.')
  }

  return (
    <>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Settings</h1>
        <p className="text-on-surface-variant">Your PIN, starting balance, sample data, and a way to start fresh.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter w-full items-start">
        <Card className="flex flex-col gap-2 w-full">
          <h2 className="text-xl font-semibold text-on-surface mb-1 flex items-center gap-2">
            <Icon name="lock" className="text-[22px] text-on-surface-variant" />
            Security
          </h2>
          <p className="text-on-surface-variant mb-2">Change the PIN you use to open the app.</p>
          <Learn>
            <p>
              Your PIN is the 4-6 digit code you type every time you open the app. Only people who know it can see
              your tenants, payments, and money — so keep it somewhere only you'd remember.
            </p>
          </Learn>

          {!changingPin ? (
            <button
              onClick={() => setChangingPin(true)}
              className="w-full md:w-auto min-h-[56px] px-6 mt-2 bg-surface-container-low border-2 border-outline-variant rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
            >
              <Icon name="lock_reset" className="text-[22px]" />
              <span className="font-semibold">Change my PIN</span>
            </button>
          ) : (
            <form onSubmit={savePin} className="flex flex-col gap-4 mt-2">
              <PinField label="1. Type your new PIN" value={newPin} onChange={setNewPin} placeholder="4 to 6 numbers" />
              <PinField label="2. Type it again to confirm" value={confirmPin} onChange={setConfirmPin} placeholder="Same numbers as above" />
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
        </Card>

        <Card className="flex flex-col gap-2 w-full">
          <h2 className="text-xl font-semibold text-on-surface mb-1 flex items-center gap-2">
            <Icon name="payments" className="text-[22px] text-on-surface-variant" />
            Starting Balance
          </h2>
          <p className="text-on-surface-variant mb-2">Had money saved up before you started tracking? Add it here, once.</p>
          <Learn>
            <p>It gets added to "Money Left" on your Dashboard and carries forward every month after.</p>
            <p>
              <span className="font-semibold">Example:</span> if you had ₱5,000 in the coffee tin before you started
              tracking, type <span className="font-semibold">5000</span> below.
            </p>
          </Learn>
          <form onSubmit={saveOpeningBalance} className="flex flex-col sm:flex-row gap-4 sm:items-end mt-2">
            <label className="flex flex-col gap-1 flex-1 max-w-xs">
              <span className="font-semibold text-on-surface-variant">How much money do you have right now?</span>
              <input
                type="number"
                min="0"
                step="1"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className={inputCls}
              />
            </label>
            <button type="submit" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-container transition-colors min-h-tap-target-min">
              Save
            </button>
          </form>
        </Card>

        <Card className="flex flex-col gap-2 w-full">
          <h2 className="text-xl font-semibold text-on-surface mb-1 flex items-center gap-2">
            <Icon name="table_view" className="text-[22px] text-on-surface-variant" />
            Sample Data
          </h2>
          <p className="text-on-surface-variant mb-2">Fill the app with made-up tenants and payments to try it out.</p>
          <Learn>
            <p>It's completely safe to try — you can always remove it later using "Clear All Data" below.</p>
            <p>Heads up: this replaces whatever tenants or payments you've already entered.</p>
          </Learn>
          <button
            onClick={loadSample}
            className="w-full md:w-auto min-h-[56px] px-6 mt-2 bg-surface-container-low border-2 border-outline-variant rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
          >
            <Icon name="table_view" className="text-[22px]" />
            <span className="font-semibold">Load Sample Data</span>
          </button>
        </Card>

        <Card variant="danger" className="flex flex-col gap-2 w-full">
          <h2 className="text-xl font-semibold text-error mb-1 flex items-center gap-2">
            <Icon name="delete_forever" className="text-[22px]" />
            Danger Zone
          </h2>
          <p className="text-on-surface-variant mb-2">Permanently delete every tenant, payment, and expense.</p>
          <Learn>
            <p>There is no way to get this back afterward — so only do this if you're sure.</p>
            <p>Your PIN and starting balance are not affected — you won't be locked out.</p>
          </Learn>

          {!clearing ? (
            <button
              onClick={() => setClearing(true)}
              className="w-full md:w-auto min-h-[56px] px-6 mt-2 bg-error-container text-on-error-container rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Icon name="delete_forever" className="text-[22px]" />
              <span className="font-semibold">Clear All Data</span>
            </button>
          ) : (
            <form onSubmit={confirmClear} className="flex flex-col gap-4 mt-2">
              <p className="text-sm text-error font-medium">
                Last step — type your PIN below and press "Erase Everything" to permanently delete all your data.
              </p>
              <PinField label="Type your PIN to confirm" value={clearPin} onChange={setClearPin} autoFocus />
              {clearError && <p className="text-secondary font-medium">{clearError}</p>}
              <div className="flex gap-3">
                <button type="submit" className="bg-error text-on-error px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
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
        </Card>
      </div>

      <div className="pt-4 flex flex-col md:flex-row md:items-center md:justify-end gap-4">
        <p className="text-sm text-on-surface-variant text-center md:text-right md:max-w-xs">
          "Lock App" just hides things behind your PIN again. "Log Out" fully signs this device out — you'll need your email and password to get back in.
        </p>
        <button
          onClick={onLock}
          className="w-full md:w-auto min-h-[56px] px-8 bg-surface-container-low border-2 border-secondary text-secondary rounded-lg flex items-center justify-center gap-2 hover:bg-secondary-container/20 transition-colors"
        >
          <Icon name="lock" className="text-[22px]" />
          <span className="font-semibold">Lock App</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full md:w-auto min-h-[56px] px-8 bg-surface-container-low border-2 border-outline text-on-surface-variant rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
        >
          <Icon name="logout" className="text-[22px]" />
          <span className="font-semibold">Log Out</span>
        </button>
      </div>

      <Toast message={toastMsg} />
    </>
  )
}
