import { useState } from 'react'
import { login, signup } from '../lib/supabase.js'
import Icon from '../components/Icon.jsx'
import Card from '../components/Card.jsx'

const inputCls = 'w-full min-h-tap-target-min border-2 border-outline-variant rounded-lg px-4 text-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') await login(email, password)
      else await signup(email, password)
      // No further action needed here — lib/store.js listens for the
      // resulting SIGNED_IN event and loads data on its own.
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-container-padding py-8 gap-stack-gap">
      <div className="flex items-center gap-2">
        <Icon name="home" className="text-primary text-[36px]" />
        <span className="font-bold text-3xl text-primary">Renta</span>
      </div>

      <Card className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-on-surface text-center">
          {mode === 'login' ? 'Log in' : 'Create an account'}
        </h1>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-on-surface-variant">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-on-surface-variant">Password</span>
            <input
              required
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </label>

          {error && <p className="text-secondary font-medium">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-on-primary h-14 rounded-xl font-semibold text-lg hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'login' ? 'signup' : 'login'))
            setError('')
          }}
          className="text-sm font-semibold text-primary hover:underline text-center"
        >
          {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Log in'}
        </button>
      </Card>

      <p className="text-sm text-on-surface-variant text-center max-w-sm">
        This device will stay logged in. You'll still be asked for your PIN every time you open the app.
      </p>
    </div>
  )
}
