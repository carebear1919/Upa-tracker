import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const appEmail = import.meta.env.VITE_SUPABASE_APP_EMAIL
const appPassword = import.meta.env.VITE_SUPABASE_APP_PASSWORD

export const isSupabaseConfigured = Boolean(url && anonKey && appEmail && appPassword)

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null

// No user accounts in this app — the PIN lock is the only thing your family
// sees. Under the hood every device signs into the SAME one shared Supabase
// login (a fixed email/password baked into the build, not typed by anyone)
// so every device always reads and writes the exact same data, and losing
// browser storage on one device can never orphan data behind a different
// auth.uid() the way per-browser anonymous auth would.
export async function ensureSession() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return session
  const { data, error } = await supabase.auth.signInWithPassword({ email: appEmail, password: appPassword })
  if (error) throw error
  return data.session
}
