import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null

// A real account you log into — the PIN lock is a second layer on top, not a
// replacement for it. supabase-js persists the session in localStorage on
// its own, so a device stays logged in across reloads, but logging in again
// with the same email/password always recovers the same account even if
// that storage ever gets cleared (unlike anonymous, per-install auth).
export async function getSession() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

export async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data.session
}

export async function logout() {
  await supabase.auth.signOut()
}
