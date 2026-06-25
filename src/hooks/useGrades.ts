import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getGrades,
  createGrade,
  updateGrade as updateGradeService,
  deleteGrade,
  computeAverage,
} from '../services/gradeService'
import type { Grade } from '../types'

export function useGrades() {
  const { user } = useAuth()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getGrades(user.id)
      setGrades(data)
    } catch (e) {
      setError('Erreur lors du chargement des notes')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (data: Omit<Grade, 'id'>) => {
    if (!user) return
    const created = await createGrade(user.id, data)
    setGrades(prev => [created, ...prev])
  }, [user?.id])

  const update = useCallback(async (id: string, data: Partial<Grade>) => {
    if (!user) return
    await updateGradeService(user.id, id, data)
    setGrades(prev => prev.map(g => g.id === id ? { ...g, ...data } : g))
  }, [user?.id])

  const remove = useCallback(async (id: string) => {
    if (!user) return
    await deleteGrade(user.id, id)
    setGrades(prev => prev.filter(g => g.id !== id))
  }, [user?.id])

  const subjectIds = [...new Set(grades.map(g => g.subject_id))]
  const averageBySubject: Record<string, number> = {}
  subjectIds.forEach(sid => { averageBySubject[sid] = computeAverage(grades, sid) })
  const globalAverage = subjectIds.length
    ? +(subjectIds.reduce((sum, sid) => sum + averageBySubject[sid], 0) / subjectIds.length).toFixed(2)
    : 0

  const trend = [...grades]
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce<{ date: string; avg: number }[]>((acc, g) => {
      const prev = acc.length ? acc[acc.length - 1].avg : 0
      acc.push({ date: g.date, avg: (prev + g.value) / 2 })
      return acc
    }, [])

  return {
    grades, loading, error,
    create, update, remove,
    reload: load,
    averageBySubject,
    globalAverage,
    trend,
  }
}
