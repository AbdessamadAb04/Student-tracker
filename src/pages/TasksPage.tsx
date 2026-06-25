import { useState, useEffect } from 'react'
import { ClipboardList } from 'lucide-react'
import TaskCreationForm from '../components/tasks/TaskCreationForm'
import TaskCard from '../components/tasks/TaskCard'
import type { StudentTask, TaskStatus, TaskCategory, TaskPriority } from '../types/task'
import {
  getStudentTasks,
  saveStudentTasks,
  sortTasks,
  filterTasks,
  calculateTaskStats,
} from '../utils/taskUtils'
import { useAuth } from '../context/AuthContext'

export default function TasksPage() {
  const { user } = useAuth()
  // Prefer real user ID, fall back to a consistent demo key
  const studentId = user?.id ?? 'demo-student'

  const [tasks, setTasks] = useState<StudentTask[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<StudentTask | null>(null)

  // Filter & Sort states
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate')

  // Load tasks from localStorage
  useEffect(() => {
    const stored = getStudentTasks(studentId)
    setTasks(stored)
  }, [studentId])

  // Filter & sort tasks
  const filteredTasks = filterTasks(tasks, {
    status: filterStatus,
    category: filterCategory,
    priority: filterPriority,
    searchTerm,
  })

  const sortedTasks = sortTasks(filteredTasks, sortBy)
  const stats = calculateTaskStats(tasks)

  const handleTaskCreated = (task: StudentTask) => {
    if (editingTask) {
      const updated = tasks.map(t => (t.id === editingTask.id ? task : t))
      setTasks(updated)
      saveStudentTasks(studentId, updated)
      setEditingTask(null)
    } else {
      const newTasks = [...tasks, task]
      setTasks(newTasks)
      saveStudentTasks(studentId, newTasks)
    }
    setShowForm(false)
  }

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const completedDate = newStatus === 'completed' || newStatus === 'graded'
          ? new Date().toISOString()
          : t.completedDate
        return { ...t, status: newStatus, completedDate }
      }
      return t
    })
    setTasks(updated)
    saveStudentTasks(studentId, updated)
  }

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId)
    setTasks(updated)
    saveStudentTasks(studentId, updated)
  }

  const handleAssessment = (taskId: string, quality: number, learning: number) => {
    const updated = tasks.map(t =>
      t.id === taskId
        ? { ...t, completionQuality: quality as 1 | 2 | 3 | 4 | 5, learningGain: learning as 1 | 2 | 3 | 4 | 5 }
        : t
    )
    setTasks(updated)
    saveStudentTasks(studentId, updated)
  }

  const resetFilters = () => {
    setFilterStatus('all')
    setFilterCategory('all')
    setFilterPriority('all')
    setSearchTerm('')
    setSortBy('dueDate')
  }

  const hasActiveFilters = filterStatus !== 'all' || filterCategory !== 'all' || filterPriority !== 'all' || searchTerm

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
            <ClipboardList className="h-6 w-6 text-[var(--color-primary)]" /> Mes Tâches
          </h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Créez et suivez vos tâches personnelles</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditingTask(null); setShowForm(true) }}
            className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[var(--text-sm)] font-semibold text-white hover:opacity-90 transition-opacity"
          >
            + Nouvelle Tâche
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-[var(--color-white)] rounded-2xl p-6 max-w-2xl w-full my-8 shadow-xl">
            <TaskCreationForm
              studentId={studentId}
              onTaskCreated={handleTaskCreated}
              onCancel={() => { setShowForm(false); setEditingTask(null) }}
              defaultTask={editingTask}
              isEditing={!!editingTask}
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, bg: 'bg-[var(--color-white)] border border-[var(--color-border)]', text: 'text-[var(--color-text)]', sub: 'text-[var(--color-text-secondary)]' },
          { label: 'En cours', value: stats.inProgress, bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', sub: 'text-blue-600' },
          { label: 'Complétées', value: stats.completed, bg: 'bg-green-50 border border-green-200', text: 'text-green-700', sub: 'text-green-600' },
          { label: 'En retard', value: stats.overdue, bg: 'bg-red-50 border border-red-200', text: 'text-red-700', sub: 'text-red-600' },
          { label: 'Complétion', value: `${stats.completionRate}%`, bg: 'bg-purple-50 border border-purple-200', text: 'text-purple-700', sub: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.bg}`}>
            <div className={`text-[var(--text-xs)] font-medium ${s.sub}`}>{s.label}</div>
            <div className={`text-3xl font-bold mt-1 ${s.text}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="space-y-4 bg-[var(--color-white)] border border-[var(--color-border)] rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)]">Filtres & Recherche</h3>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline font-medium"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher une tâche..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />

        {/* Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Statut',
              value: filterStatus,
              onChange: (v: string) => setFilterStatus(v as TaskStatus | 'all'),
              options: [
                { value: 'all', label: 'Tous les statuts' },
                { value: 'pending', label: 'À faire' },
                { value: 'in_progress', label: 'En cours' },
                { value: 'submitted', label: 'Soumis' },
                { value: 'completed', label: 'Complété' },
                { value: 'overdue', label: 'En retard' },
              ],
            },
            {
              label: 'Catégorie',
              value: filterCategory,
              onChange: (v: string) => setFilterCategory(v as TaskCategory | 'all'),
              options: [
                { value: 'all', label: 'Toutes' },
                { value: 'study', label: 'Étude' },
                { value: 'practice', label: 'Pratique' },
                { value: 'project', label: 'Projet' },
                { value: 'reading', label: 'Lecture' },
                { value: 'review', label: 'Révision' },
                { value: 'exam', label: 'Examen' },
              ],
            },
            {
              label: 'Priorité',
              value: filterPriority,
              onChange: (v: string) => setFilterPriority(v as TaskPriority | 'all'),
              options: [
                { value: 'all', label: 'Toutes' },
                { value: 'high', label: 'Haute' },
                { value: 'medium', label: 'Moyenne' },
                { value: 'low', label: 'Basse' },
              ],
            },
            {
              label: 'Trier par',
              value: sortBy,
              onChange: (v: string) => setSortBy(v as 'dueDate' | 'priority' | 'status'),
              options: [
                { value: 'dueDate', label: 'Échéance' },
                { value: 'priority', label: 'Priorité' },
                { value: 'status', label: 'Statut' },
              ],
            },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] block mb-1">{f.label}</label>
              <select
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-xs)] text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {f.options.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={(t) => { setEditingTask(t); setShowForm(true) }}
              onDelete={handleDeleteTask}
              onAssessment={handleAssessment}
            />
          ))
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] p-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-[var(--text-base)] font-semibold text-[var(--color-text)] mb-2">
              {hasActiveFilters ? 'Aucune tâche correspondante' : 'Aucune tâche créée'}
            </p>
            <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Créez votre première tâche !'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
