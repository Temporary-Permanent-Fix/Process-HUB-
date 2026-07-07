import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import { isValidUsername, usernameToShadowEmail } from './username'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<string | null>
  signUp: (username: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USERNAME_ERROR =
  'Meno používateľa môže mať 3-32 znakov: písmená, čísla, bodku, pomlčku alebo podčiarovník.'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  async function signIn(username: string, password: string) {
    if (!isValidUsername(username)) return USERNAME_ERROR
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToShadowEmail(username),
      password,
    })
    return error?.message ?? null
  }

  async function signUp(username: string, password: string) {
    if (!isValidUsername(username)) return { error: USERNAME_ERROR, needsConfirmation: false }
    const { data, error } = await supabase.auth.signUp({
      email: usernameToShadowEmail(username),
      password,
      options: { data: { username: username.trim() } },
    })
    return { error: error?.message ?? null, needsConfirmation: !error && !data.session }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
