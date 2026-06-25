import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Task, TaskStatus } from '../types'
import { tasks as mockTasks } from '../data/mockData'

const LS_USER_PREFIX = 'student_tasks_user_'

function loadFromStorage(userId: string): Task[] {
  const raw = localStorage.getItem(`${LS_USER_PREFIX}${userId}`)
  if (raw) return JSON.parse(raw)
  return mockTasks
}

function saveToStorage(userId: string, data: Task[]) {
  localStorage.setItem(`${LS_USER_PREFIX}${userId}`, JSON.stringify(data))
}

export async function getTasks(userId: string): Promise<Task[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .eq('user_id', userId)
      .order('due_date', { ascending: false })
    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        studentId: row.user_id,
        title: row.title,
        description: row.description,
        dueDate: row.due_date,
        subject_ids: row.subject_ids ?? [],
        status: row.status as TaskStatus,
        grade: row.grade ?? undefined,
        submittedDate: row.completed_date ?? undefined,
      }))
    }
  }
  return loadFromStorage(userId)
}

export async function getTasksByGroup(groupId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, subtasks(*)')
    .eq('group_id', groupId)
  if (!error && data) {
    return data.map(row => ({
      id: row.id,
      studentId: row.user_id,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      subject_ids: row.subject_ids ?? [],
      status: row.status as TaskStatus,
      grade: row.grade ?? undefined,
      submittedDate: row.completed_date ?? undefined,
    }))
  }
  return []
}

export async function createTask(userId: string, data: Omit<Task, 'id'>): Promise<Task> {
  const task: Task = { ...data, id: `task-${Date.now()}` }

  if (isSupabaseConfigured) {
    const { data: row, error } = await supabase.from('tasks').insert({
      user_id: userId,
      title: data.title,
      description: data.description,
      due_date: data.dueDate,
      subject_ids: data.subject_ids,
      status: data.status,
      completed_date: data.submittedDate ?? null,
      type: 'simple',
      category: 'general',
      priority: 'medium',
      estimated_hours: 1,
    }).select().single()
    if (!error && row) return { ...task, id: row.id }
  }

  const tasks = loadFromStorage(userId)
  tasks.unshift(task)
  saveToStorage(userId, tasks)
  return task
}

export async function updateTask(userId: string, id: string, data: Partial<Task>): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('tasks').update({
      title: data.title,
      description: data.description,
      due_date: data.dueDate,
      subject_ids: data.subject_ids,
      status: data.status,
      completed_date: data.submittedDate ?? null,
    }).eq('id', id).eq('user_id', userId)
  }

  const tasks = loadFromStorage(userId)
  const idx = tasks.findIndex(t => t.id === id)
  if (idx >= 0) {
    tasks[idx] = { ...tasks[idx], ...data }
    saveToStorage(userId, tasks)
  }
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId)
  }

  const tasks = loadFromStorage(userId)
  saveToStorage(userId, tasks.filter(t => t.id !== id))
}

export async function updateTaskStatus(userId: string, id: string, status: TaskStatus): Promise<void> {
  await updateTask(userId, id, { status })
}
