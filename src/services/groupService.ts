import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export interface Group {
  id: string
  name: string
  description?: string
}

export async function getTeacherGroups(teacherId: string): Promise<Group[]> {
  const { data, error } = await supabase
    .from('group_teachers')
    .select('groups(id, name, description)')
    .eq('teacher_id', teacherId)

  if (!error && data) {
    return data.map((row: any) => ({
      id: row.groups.id,
      name: row.groups.name,
      description: row.groups.description ?? undefined,
    }))
  }
  return []
}

export async function getGroupStudents(groupId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('group_students')
    .select('profiles(id, name, institution, year, track)')
    .eq('group_id', groupId)

  if (!error && data) {
    return data.map((row: any) => ({
      name: row.profiles.name,
      initials: row.profiles.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      track: row.profiles.track ?? '',
      startDate: '',
      studentId: row.profiles.id,
      year: row.profiles.year ?? '',
      institution: row.profiles.institution ?? '',
      email: '',
    }))
  }
  return []
}

export async function createGroup(name: string, description?: string): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .insert({ name, description: description ?? null })
    .select()
    .single()

  if (!error && data) return { id: data.id, name: data.name, description: data.description ?? undefined }
  throw new Error('Failed to create group')
}

export async function addStudentToGroup(groupId: string, studentId: string): Promise<void> {
  await supabase.from('group_students').insert({ group_id: groupId, student_id: studentId })
}

export async function removeStudentFromGroup(groupId: string, studentId: string): Promise<void> {
  await supabase.from('group_students').delete().eq('group_id', groupId).eq('student_id', studentId)
}
