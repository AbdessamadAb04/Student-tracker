/**
 * Grade Service — Supabase-backed
 */
import { supabase } from '../lib/supabase'
import type { Grade } from '../types'

export type GradeRow = {
  id: string
  user_id: string
  subject_id: string
  title: string
  value: number
  weight: number
  date: string
  teacher: string
  type: 'exam' | 'tp' | 'cc' | 'project' | 'quiz'
}

export async function getGrades(userId: string): Promise<Grade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    studentId: row.user_id,
    subjectId: row.subject_id,
    title: row.title,
    value: Number(row.value),
    weight: Number(row.weight),
    date: row.date,
    teacher: row.teacher,
    type: row.type,
  }))
}

export async function createGrade(userId: string, grade: Omit<Grade, 'id' | 'studentId'>): Promise<Grade | null> {
  const { data, error } = await supabase
    .from('grades')
    .insert({
      user_id: userId,
      subject_id: grade.subjectId,
      title: grade.title,
      value: grade.value,
      weight: grade.weight,
      date: grade.date,
      teacher: grade.teacher,
      type: grade.type,
    })
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    studentId: data.user_id,
    subjectId: data.subject_id,
    title: data.title,
    value: Number(data.value),
    weight: Number(data.weight),
    date: data.date,
    teacher: data.teacher,
    type: data.type,
  }
}
