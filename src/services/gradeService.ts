import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Grade } from '../types'
import { grades as mockGrades } from '../data/mockData'

const LS_KEY = 'student_grades'
const LS_USER_PREFIX = 'student_grades_user_'

function loadFromStorage(userId: string): Grade[] {
  const raw = localStorage.getItem(`${LS_USER_PREFIX}${userId}`)
  if (raw) return JSON.parse(raw)
  const stored = localStorage.getItem(LS_KEY)
  if (stored) return JSON.parse(stored)
  return mockGrades
}

function saveToStorage(userId: string, data: Grade[]) {
  localStorage.setItem(`${LS_USER_PREFIX}${userId}`, JSON.stringify(data))
}

export async function getGrades(userId: string): Promise<Grade[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        studentId: row.user_id,
        subject_id: row.subject_id,
        title: row.title,
        value: row.value,
        weight: row.weight,
        date: row.date,
        teacher: row.teacher,
        type: row.type as Grade['type'],
      }))
    }
  }
  return loadFromStorage(userId)
}

export async function getGradesByGroup(groupId: string): Promise<Grade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*, profiles!inner(user_id)')
    .eq('group_id', groupId)
  if (!error && data) {
    return data.map(row => ({
      id: row.id,
      studentId: row.user_id,
      subject_id: row.subject_id,
      title: row.title,
      value: row.value,
      weight: row.weight,
      date: row.date,
      teacher: row.teacher,
      type: row.type as Grade['type'],
    }))
  }
  return []
}

export async function createGrade(userId: string, data: Omit<Grade, 'id'>): Promise<Grade> {
  const grade: Grade = { ...data, id: `grade-${Date.now()}` }

  if (isSupabaseConfigured) {
    const { data: row, error } = await supabase.from('grades').insert({
      user_id: userId,
      subject_id: data.subject_id,
      title: data.title,
      value: data.value,
      weight: data.weight,
      date: data.date,
      teacher: data.teacher,
      type: data.type,
    }).select().single()
    if (!error && row) return { ...grade, id: row.id }
  }

  const grades = loadFromStorage(userId)
  grades.unshift(grade)
  saveToStorage(userId, grades)
  return grade
}

export async function updateGrade(userId: string, id: string, data: Partial<Grade>): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('grades').update({
      title: data.title,
      value: data.value,
      weight: data.weight,
      date: data.date,
      teacher: data.teacher,
      type: data.type,
    }).eq('id', id).eq('user_id', userId)
  }

  const grades = loadFromStorage(userId)
  const idx = grades.findIndex(g => g.id === id)
  if (idx >= 0) {
    grades[idx] = { ...grades[idx], ...data }
    saveToStorage(userId, grades)
  }
}

export async function deleteGrade(userId: string, id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('grades').delete().eq('id', id).eq('user_id', userId)
  }

  const grades = loadFromStorage(userId)
  saveToStorage(userId, grades.filter(g => g.id !== id))
}

export function computeAverage(grades: Grade[], subjectId?: string): number {
  const filtered = subjectId ? grades.filter(g => g.subject_id === subjectId) : grades
  if (!filtered.length) return 0
  const totalWeight = filtered.reduce((s, g) => s + g.weight, 0)
  if (!totalWeight) return 0
  const weighted = filtered.reduce((s, g) => s + g.value * g.weight, 0)
  return +(weighted / totalWeight).toFixed(2)
}

export function computeWeightedAverage(grades: Grade[]): number {
  return computeAverage(grades)
}
