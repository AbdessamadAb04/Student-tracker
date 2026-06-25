import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Profile } from '../types'

export interface AuthUser extends User {
  role?: 'student' | 'teacher'
  groupId?: string
  groupName?: string
  displayName?: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signUp: (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'teacher',
    groupId?: string
  ) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEMO_USER_KEY = 'student_tracker_demo_user'
const DEMO_PROFILE_KEY = 'student_tracker_demo_profile'

function loadDemoProfile(): Profile | null {
  const raw = localStorage.getItem(DEMO_PROFILE_KEY)
  return raw ? JSON.parse(raw) : null
}

function saveDemoProfile(p: Profile) {
  localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(p))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!user) return
    if (!isSupabaseConfigured) {
      setProfile(loadDemoProfile())
      return
    }
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile({
          name: data.name,
          initials: data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          track: data.track ?? '',
          startDate: data.created_at?.slice(0, 10) ?? '',
          studentId: user.id ?? '',
          year: data.year ?? '',
          institution: data.institution ?? '',
          email: user.email ?? '',
        })
      }
    } catch {
      // keep existing profile
    }
  }, [user])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const demoUser = localStorage.getItem(DEMO_USER_KEY)
      if (demoUser) {
        const parsed = JSON.parse(demoUser) as AuthUser
        setUser(parsed)
        setProfile(loadDemoProfile())
      }
      setLoading(false)
      return
    }

    const handleAuthChange = async (currSession: Session | null) => {
      if (currSession?.user) {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currSession.user.id)
          .single()

        const role = (profileRow?.role as 'student' | 'teacher') || 'student'

        const { data: groupRows } = await supabase
          .from('group_students')
          .select('group_id, groups(id, name)')
          .eq('student_id', currSession.user.id)
          .limit(1)

        const firstGroup = groupRows?.[0] as any
        const groupId: string | undefined = firstGroup?.groups?.id
        const groupName: string | undefined = firstGroup?.groups?.name

        setUser({ ...currSession.user, role, groupId, groupName })

        if (profileRow) {
          setProfile({
            name: profileRow.name,
            initials: profileRow.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
            track: profileRow.track ?? '',
            startDate: profileRow.created_at?.slice(0, 10) ?? '',
            studentId: currSession.user.id,
            year: profileRow.year ?? '',
            institution: profileRow.institution ?? '',
            email: currSession.user.email ?? '',
          })
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setSession(currSession)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'teacher',
    groupId?: string
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      const fakeUser: AuthUser = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { name, role, groupId },
        role,
        groupId: role === 'student' ? groupId : undefined,
      } as unknown as AuthUser
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(fakeUser))
      setUser(fakeUser)
      const demoProfile: Profile = {
        name,
        initials: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        track: 'Ingénierie Informatique – Développement Web Full-Stack',
        startDate: '2024-09-01',
        studentId: fakeUser.id,
        year: '4ème Année',
        institution: 'EMSI Casablanca',
        email,
      }
      saveDemoProfile(demoProfile)
      setProfile(demoProfile)
      return { error: null }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })

    if (error) return { error: error.message }

    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, name, role })

      if (role === 'student' && groupId) {
        await supabase.from('group_students').insert({
          group_id: groupId,
          student_id: data.user.id,
        })
      }
    }

    return { error: null }
  }

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(DEMO_USER_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser
        setUser(parsed)
        setProfile(loadDemoProfile())
        return { error: null }
      }
      return { error: "Aucun compte demo trouvé. Inscrivez-vous d'abord." }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(DEMO_USER_KEY)
      localStorage.removeItem(DEMO_PROFILE_KEY)
      setUser(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, isConfigured: isSupabaseConfigured, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
