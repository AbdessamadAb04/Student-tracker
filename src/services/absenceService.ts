import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Absence } from '../types'
import { absences as mockAbsences } from '../data/mockData'

const LS_USER_PREFIX = 'student_absences_user_'

function loadFromStorage(userId: string): Absence[] {
  const raw = localStorage.getItem(`${LS_USER_PREFIX}${userId}`)
  if (raw) return JSON.parse(raw)
  return mockAbsences
}

function saveToStorage(userId: string, data: Absence[]) {
  localStorage.setItem(`${LS_USER_PREFIX}${userId}`, JSON.stringify(data))
}

export async function getAbsences(userId: string): Promise<Absence[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('absences')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        studentId: row.user_id,
        date: row.date,
        duration: row.duration as 'half' | 'full',
        reason: row.reason ?? undefined,
        excused: row.excused,
        certificateProvided: row.certificate_provided,
        subject_id: row.subject_id ?? undefined,
      }))
    }
  }
  return loadFromStorage(userId)
}

export async function getAbsencesByGroup(groupId: string): Promise<Absence[]> {
  const { data, error } = await supabase
    .from('absences')
    .select('*')
    .eq('group_id', groupId)
  if (!error && data) {
    return data.map(row => ({
      id: row.id,
      studentId: row.user_id,
      date: row.date,
      duration: row.duration as 'half' | 'full',
      reason: row.reason ?? undefined,
      excused: row.excused,
      certificateProvided: row.certificate_provided,
      subject_id: row.subject_id ?? undefined,
    }))
  }
  return []
}

export async function createAbsence(userId: string, data: Omit<Absence, 'id'>): Promise<Absence> {
  const absence: Absence = { ...data, id: `abs-${Date.now()}` }

  if (isSupabaseConfigured) {
    const { data: row, error } = await supabase.from('absences').insert({
      user_id: userId,
      subject_id: data.subject_id ?? null,
      date: data.date,
      duration: data.duration,
      reason: data.reason ?? null,
      excused: data.excused,
      certificate_provided: data.certificateProvided,
    }).select().single()
    if (!error && row) return { ...absence, id: row.id }
  }

  const absences = loadFromStorage(userId)
  absences.unshift(absence)
  saveToStorage(userId, absences)
  return absence
}

export async function updateAbsence(userId: string, id: string, data: Partial<Absence>): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('absences').update({
      reason: data.reason ?? null,
      excused: data.excused,
      certificate_provided: data.certificateProvided,
    }).eq('id', id).eq('user_id', userId)
  }

  const absences = loadFromStorage(userId)
  const idx = absences.findIndex(a => a.id === id)
  if (idx >= 0) {
    absences[idx] = { ...absences[idx], ...data }
    saveToStorage(userId, absences)
  }
}

export async function deleteAbsence(userId: string, id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('absences').delete().eq('id', id).eq('user_id', userId)
  }

  const absences = loadFromStorage(userId)
  saveToStorage(userId, absences.filter(a => a.id !== id))
}

export interface AbsenceStats {
  total: number
  excused: number
  unexcused: number
  halfDays: number
  fullDays: number
}

export function computeAbsenceStats(absences: Absence[]): AbsenceStats {
  return {
    total: absences.length,
    excused: absences.filter(a => a.excused).length,
    unexcused: absences.filter(a => !a.excused).length,
    halfDays: absences.filter(a => a.duration === 'half').length,
    fullDays: absences.filter(a => a.duration === 'full').length,
  }
}
