/**
 * Feedback Service — Supabase-backed
 */
import { supabase } from '../lib/supabase'
import type { TeacherFeedback } from '../types'

export async function getFeedbacks(userId: string): Promise<TeacherFeedback[]> {
  const { data, error } = await supabase
    .from('feedbacks')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    studentId: row.user_id,
    teacherName: row.teacher_name,
    subjectId: row.subject_id,
    comment: row.comment,
    rating: row.rating as 1 | 2 | 3 | 4 | 5,
    date: row.date,
    isPositive: row.is_positive,
  }))
}
