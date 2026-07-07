import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import { isValidUsername, usernameToShadowEmail } from './username'
import { getOwnProfile, subscribeToOwnProfile, type Profile } from './profiles'

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const unsubscribeProfileRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    function loadProfile(userId: string) {
      unsubscribeProfileRef.current?.()
      getOwnProfile(userId).then(setProfile)
      unsubscribeProfileRef.current = subscribeToOwnProfile(userId, setProfile)
    }

    function clearProfile() {
      unsubscribeProfileRef.current?.()
      unsubscribeProfileRef.current = null
      setProfile(null)
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        loadProfile(newSession.user.id)
      } else {
        clearProfile()
      }
    })

    return () => {
      subscription.subscription.unsubscribe()
      unsubscribeProfileRef.current?.()
    }
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
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
