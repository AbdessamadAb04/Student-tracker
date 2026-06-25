import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile as updateProfileService } from '../services/profileService'
import type { Profile } from '../types'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getProfile(user.id).then(p => {
      setProfile(p)
      setLoading(false)
    })
  }, [user?.id])

  const update = useCallback(async (data: Partial<Profile>) => {
    if (!user) return
    const updated = await updateProfileService(user.id, data)
    if (updated) setProfile(updated)
  }, [user?.id])

  return { profile, loading, updateProfile: update }
}
