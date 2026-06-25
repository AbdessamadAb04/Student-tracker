import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getTasks,
  createTask,
  updateTask as updateTaskService,
  deleteTask,
  updateTaskStatus,
} from '../services/taskService'
import type { Task, TaskStatus } from '../types'

export interface TaskStats {
  pending: number
  inProgress: number
  completed: number
  overdue: number
}

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getTasks(user.id)
      setTasks(data)
    } catch (e) {
      setError('Erreur lors du chargement des tâches')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (data: Omit<Task, 'id'>) => {
    if (!user) return
    const created = await createTask(user.id, data)
    setTasks(prev => [created, ...prev])
  }, [user?.id])

  const update = useCallback(async (id: string, data: Partial<Task>) => {
    if (!user) return
    await updateTaskService(user.id, id, data)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
  }, [user?.id])

  const remove = useCallback(async (id: string) => {
    if (!user) return
    await deleteTask(user.id, id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [user?.id])

  const handleUpdateStatus = useCallback(async (id: string, status: TaskStatus) => {
    if (!user) return
    await updateTaskStatus(user.id, id, status)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }, [user?.id])

  const now = new Date().toISOString().slice(0, 10)
  const stats: TaskStats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'graded' || t.status === 'submitted').length,
    overdue: tasks.filter(t => t.status !== 'graded' && t.status !== 'submitted' && t.dueDate < now).length,
  }

  return {
    tasks, loading, error,
    create, update, remove,
    updateStatus: handleUpdateStatus,
    reload: load,
    stats,
  }
}
