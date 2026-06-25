import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getAbsences,
  createAbsence,
  updateAbsence as updateAbsenceService,
  deleteAbsence,
  computeAbsenceStats,
} from '../services/absenceService'
import type { Absence } from '../types'
import type { AbsenceStats } from '../services/absenceService'

export function useAbsences() {
  const { user } = useAuth()
  const [absences, setAbsences] = useState<Absence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getAbsences(user.id)
      setAbsences(data)
    } catch (e) {
      setError('Erreur lors du chargement des absences')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (data: Omit<Absence, 'id'>) => {
    if (!user) return
    const created = await createAbsence(user.id, data)
    setAbsences(prev => [created, ...prev])
  }, [user?.id])

  const update = useCallback(async (id: string, data: Partial<Absence>) => {
    if (!user) return
    await updateAbsenceService(user.id, id, data)
    setAbsences(prev => prev.map(a => a.id === id ? { ...a, ...data } : a))
  }, [user?.id])

  const remove = useCallback(async (id: string) => {
    if (!user) return
    await deleteAbsence(user.id, id)
    setAbsences(prev => prev.filter(a => a.id !== id))
  }, [user?.id])

  const stats: AbsenceStats = computeAbsenceStats(absences)

  const byMonth = absences.reduce<{ month: string; count: number }[]>((acc, a) => {
    const month = a.date.slice(0, 7)
    const existing = acc.find(m => m.month === month)
    if (existing) existing.count++
    else acc.push({ month, count: 1 })
    return acc
  }, []).sort((a, b) => a.month.localeCompare(b.month))

  const bySubject = absences.reduce<{ subjectId: string; count: number }[]>((acc, a) => {
    const sid = a.subject_id ?? 'unknown'
    const existing = acc.find(s => s.subjectId === sid)
    if (existing) existing.count++
    else acc.push({ subjectId: sid, count: 1 })
    return acc
  }, [])

  return {
    absences, loading, error,
    create, update, remove,
    reload: load,
    stats,
    byMonth,
    bySubject,
  }
}
