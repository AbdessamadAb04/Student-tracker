import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Profile } from '../types'

const LS_KEY = 'student_profile'

function loadFromStorage(): Profile | null {
  const raw = localStorage.getItem(LS_KEY)
  return raw ? JSON.parse(raw) : null
}

function saveToStorage(profile: Profile) {
  localStorage.setItem(LS_KEY, JSON.stringify(profile))
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) {
      return {
        name: data.name,
        initials: data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        track: data.track ?? '',
        startDate: data.created_at?.slice(0, 10) ?? '',
        studentId: userId,
        year: data.year ?? '',
        institution: data.institution ?? '',
        email: '',
      }
    }
  }

  return loadFromStorage()
}

export async function updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | null> {
  if (isSupabaseConfigured) {
    const dbUpdate: Record<string, unknown> = {}
    if (data.name !== undefined) dbUpdate.name = data.name
    if (data.track !== undefined) dbUpdate.track = data.track
    if (data.year !== undefined) dbUpdate.year = data.year
    if (data.institution !== undefined) dbUpdate.institution = data.institution

    if (Object.keys(dbUpdate).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdate)
        .eq('id', userId)
      if (error) throw error
    }
  }

  const existing = loadFromStorage()
  if (existing) {
    const updated = { ...existing, ...data }
    saveToStorage(updated)
    return updated
  }

  return null
}
