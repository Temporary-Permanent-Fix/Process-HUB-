import { supabase } from './supabaseClient'

export type Role = 'user' | 'admin' | 'mega_admin'

export interface Profile {
  id: string
  username: string
  role: Role
}

export async function getOwnProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) return null
  return data as Profile
}

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('username')
  if (error) throw error
  return data as Profile[]
}

export async function setUserRole(id: string, role: 'user' | 'admin'): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) throw error
}

export function subscribeToOwnProfile(userId: string, onChange: (profile: Profile) => void): () => void {
  const channel = supabase
    .channel(`profile-${userId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
      (payload) => onChange(payload.new as Profile),
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
