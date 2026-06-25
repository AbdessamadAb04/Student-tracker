/**
 * Absence Service — Supabase-backed
 */
import { supabase } from '../lib/supabase'
import type { Absence } from '../types'

export async function getAbsences(userId: string): Promise<Absence[]> {
  const { data, error } = await supabase
    .from('absences')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    studentId: row.user_id,
    subjectId: row.subject_id ?? undefined,
    date: row.date,
    duration: row.duration,
    reason: row.reason ?? undefined,
    excused: row.excused,
    certificateProvided: row.certificate_provided,
  }))
}

export async function createAbsence(userId: string, absence: Omit<Absence, 'id' | 'studentId'>): Promise<Absence | null> {
  const { data, error } = await supabase
    .from('absences')
    .insert({
      user_id: userId,
      subject_id: absence.subjectId ?? null,
      date: absence.date,
      duration: absence.duration,
      reason: absence.reason ?? null,
      excused: absence.excused,
      certificate_provided: absence.certificateProvided,
    })
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    studentId: data.user_id,
    subjectId: data.subject_id ?? undefined,
    date: data.date,
    duration: data.duration,
    reason: data.reason ?? undefined,
    excused: data.excused,
    certificateProvided: data.certificate_provided,
  }
}
