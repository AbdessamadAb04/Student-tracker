/**
 * useAcademicData — loads grades, absences, feedbacks and subjects from Supabase
 * and triggers the data seeder on first use.
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getGrades } from '../services/gradeService'
import { getAbsences } from '../services/absenceService'
import { getFeedbacks } from '../services/feedbackService'
import { getSubjects } from '../services/subjectService'
import { seedUserData } from '../services/seedService'
import type { Grade, Absence, TeacherFeedback, Subject } from '../types'

interface AcademicData {
  subjects: Subject[]
  grades: Grade[]
  absences: Absence[]
  feedbacks: TeacherFeedback[]
  loading: boolean
  error: string | null
  reload: () => void
}

export function useAcademicData(): AcademicData {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [feedbacks, setFeedbacks] = useState<TeacherFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!user) { setLoading(false); return }

    let cancelled = false
    setLoading(true)
    setError(null)

    const load = async () => {
      try {
        // Seed data on first login (idempotent)
        await seedUserData(user.id)

        const [s, g, a, f] = await Promise.all([
          getSubjects(user.id),
          getGrades(user.id),
          getAbsences(user.id),
          getFeedbacks(user.id),
        ])

        if (!cancelled) {
          setSubjects(s)
          setGrades(g)
          setAbsences(a)
          setFeedbacks(f)
        }
      } catch (err) {
        if (!cancelled) setError('Erreur de chargement des données.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user, tick])

  return { subjects, grades, absences, feedbacks, loading, error, reload }
}
