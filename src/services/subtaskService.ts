import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface Subtask {
  id: string
  task_id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
}

type SubtaskInsert = Omit<Subtask, 'id'>
type SubtaskUpdate = Partial<Subtask>

export async function createSubtask(taskId: string, data: SubtaskInsert): Promise<Subtask> {
  const subtask: Subtask = { ...data, id: `subtask-${Date.now()}` }

  if (isSupabaseConfigured) {
    const { data: row, error } = await supabase.from('subtasks').insert({
      task_id: taskId,
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      estimated_hours: 0,
    }).select().single()
    if (!error && row) return { ...subtask, id: row.id }
  }

  return subtask
}

export async function updateSubtask(id: string, data: SubtaskUpdate): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('subtasks').update({
      title: data.title,
      description: data.description ?? null,
      status: data.status,
    }).eq('id', id)
  }
}

export async function deleteSubtask(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('subtasks').delete().eq('id', id)
  }
}

export async function updateSubtaskStatus(id: string, status: Subtask['status']): Promise<void> {
  await updateSubtask(id, { status })
}
