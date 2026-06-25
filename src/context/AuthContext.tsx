import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface AuthUser extends User {
  role?: 'student' | 'teacher'
  groupId?: string
  groupName?: string
  displayName?: string
}

interface AuthContextType {
  user: AuthUser | null
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
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEMO_USER_KEY = 'student_tracker_demo_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  /** Fetch role + group membership for a real Supabase user */
  const fetchProfile = async (userId: string): Promise<Pick<AuthUser, 'role' | 'groupId' | 'groupName'>> => {
    try {
      // Fetch role from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', userId)
        .single()

      const role = ((profile as any)?.role as 'student' | 'teacher') || 'student'

      // Fetch group membership (first group, if any)
      const { data: groupRows } = await supabase
        .from('group_students')
        .select('group_id, groups(id, name)')
        .eq('student_id', userId)
        .limit(1)

      const firstGroup = groupRows?.[0] as any
      const groupId: string | undefined = firstGroup?.groups?.id
      const groupName: string | undefined = firstGroup?.groups?.name

      return { role, groupId, groupName }
    } catch {
      return { role: 'student' }
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const demoUser = localStorage.getItem(DEMO_USER_KEY)
      if (demoUser) {
        setUser(JSON.parse(demoUser) as AuthUser)
      }
      setLoading(false)
      return
    }

    const handleAuthChange = async (currSession: Session | null) => {
      if (currSession?.user) {
        const { role, groupId, groupName } = await fetchProfile(currSession.user.id)
        setUser({ ...currSession.user, role, groupId, groupName })
      } else {
        setUser(null)
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
      // Demo mode
      const fakeUser: AuthUser = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { name, role, groupId },
        role,
        groupId: role === 'student' ? groupId : undefined,
      } as unknown as AuthUser
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(fakeUser))
      setUser(fakeUser)
      return { error: null }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })

    if (error) return { error: error.message }

    if (data.user) {
      // Create profile row (upsert to merge with trigger-created profile)
      await supabase.from('profiles').upsert({ id: data.user.id, name, role } as any)

      // Enroll student in group if provided
      if (role === 'student' && groupId) {
        await supabase.from('group_students').insert({
          group_id: groupId,
          student_id: data.user.id,
        } as any)
      }
    }

    return { error: null }
  }

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(DEMO_USER_KEY)
      if (stored) {
        setUser(JSON.parse(stored) as AuthUser)
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
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isConfigured: isSupabaseConfigured, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
