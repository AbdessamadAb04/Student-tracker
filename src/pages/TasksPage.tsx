import { useState, useEffect } from 'react'
import TaskCreationForm from '../components/tasks/TaskCreationForm'
import TaskCard from '../components/tasks/TaskCard'
import type { StudentTask, TaskStatus, TaskCategory, TaskPriority } from '../types/task'
import { sortTasks, filterTasks, calculateTaskStats } from '../utils/taskUtils'
import { useAuth } from '../context/AuthContext'
import { mockGroups, mockGroupStudents } from '../data/mockData'
import { supabase } from '../lib/supabase'
import { useTasks } from '../hooks/useTasks'
import { useSubjects } from '../hooks/useSubjects'

function toStudentTask(t: Record<string, unknown>): StudentTask {
  return {
    id: t.id,
    studentId: t.studentId || t.user_id || t.student_id || '',
    type: t.type || 'simple',
    title: t.title,
    description: t.description || '',
    category: t.category || 'study',
    createdBy: t.createdBy || 'student',
    createdDate: t.createdDate || t.created_at || new Date().toISOString(),
    dueDate: t.dueDate || t.due_date,
    priority: t.priority || 'medium',
    status: t.status,
    estimatedHours: t.estimatedHours || t.estimated_hours || 1,
    actualHours: t.actualHours ?? t.actual_hours,
    subjectIds: t.subject_ids || t.subjectIds || [],
    tags: t.tags || [],
    startedDate: t.startedDate ?? t.started_date,
    submittedDate: t.submittedDate ?? t.submitted_date ?? t.completed_date,
    completedDate: t.completedDate ?? t.completed_date,
    completionQuality: t.completionQuality ?? t.completion_quality,
    learningGain: t.learningGain ?? t.learning_gain,
    grade: t.grade,
    notes: t.notes,
    subtasks: t.subtasks,
  }
}

export default function TasksPage() {
  const { user, isConfigured } = useAuth()
  const isTeacher = user?.role === 'teacher'

  const studentId = user?.id?.startsWith('demo-') ? 'EMSI-2024-0142' : (user?.id || 'EMSI-2024-0142')

  const { tasks: hookTasks, create: createTaskHook, remove: removeTaskHook, updateStatus: updateStatusHook, reload: reloadTasks } = useTasks()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { subjects } = useSubjects()

  const [tasks, setTasks] = useState<StudentTask[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<StudentTask | null>(null)

  // Teacher Groups state
  const [groups, setGroups] = useState<{ id: string; name: string; description: string | null }[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')

  // Filter & Sort states
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate')

  // Sync hook tasks to local state (only in non-configured demo mode)
  useEffect(() => {
    if (!isConfigured && !isTeacher) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTasks(hookTasks.map(toStudentTask))
    }
  }, [hookTasks, isConfigured, isTeacher])

  // Load groups if user is a teacher
  useEffect(() => {
    if (isTeacher) {
      if (isConfigured) {
        supabase.from('groups')
          .select('id, name, description')
          .order('name')
          .then(({ data, error }) => {
            if (!error && data) {
              setGroups(data)
              if (data.length > 0) setSelectedGroupId(data[0].id)
            }
          })
      } else {
        setGroups(mockGroups)
        if (mockGroups.length > 0) setSelectedGroupId(mockGroups[0].id)
      }
    }
  }, [isTeacher, isConfigured])

  // Load tasks
  useEffect(() => {
    if (isTeacher) {
      if (!selectedGroupId) return

      if (isConfigured) {
        supabase.from('tasks')
          .select('*')
          .eq('group_id', selectedGroupId)
          .then(({ data, error }) => {
            if (!error && data) {
              const mapped: StudentTask[] = data.map(toStudentTask)
              // Filter to unique titles so teacher doesn't see duplicates per student
              const uniqueTasks: StudentTask[] = []
              const seen = new Set<string>()
              mapped.forEach(item => {
                const key = `${item.title}-${item.dueDate}`
                if (!seen.has(key)) {
                  seen.add(key)
                  uniqueTasks.push(item)
                }
              })
              setTasks(uniqueTasks)
            }
          })
      } else {
        const stored = localStorage.getItem(`student_tasks_group_${selectedGroupId}`)
        setTasks(stored ? JSON.parse(stored).map(toStudentTask) : [])
      }
    } else {
      // Student mode — fetch own tasks + group-assigned tasks
      if (isConfigured && user?.id) {
        // Own tasks (created by self)
        const ownReq = supabase.from('tasks').select('*').eq('user_id', user.id)
        // Group tasks (assigned to student's group by teacher)
        const groupReq = user.groupId
          ? supabase.from('tasks').select('*').eq('group_id', user.groupId).eq('user_id', user.id)
          : Promise.resolve({ data: [], error: null })

        Promise.all([ownReq, groupReq]).then(([own, grp]) => {
          const allRows = [...(own.data ?? []), ...(grp.data ?? [])]
          // Deduplicate by id
          const seen = new Set<string>()
          const unique = allRows.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
          setTasks(unique.map(toStudentTask))
        })
      } else {
        // Demo mode: use hook tasks (which fall back to localStorage via taskService)
        reloadTasks()
      }
    }
  }, [selectedGroupId, isTeacher, isConfigured, user?.id, user?.groupId, studentId, reloadTasks])

  // Filter & sort tasks
  const filteredTasks = filterTasks(tasks, {
    status: filterStatus,
    category: filterCategory,
    priority: filterPriority,
    searchTerm,
  })

  const sortedTasks = sortTasks(filteredTasks, sortBy)
  const stats = calculateTaskStats(tasks)

  const handleTaskCreated = async (task: StudentTask) => {
    if (isTeacher) {
      if (!selectedGroupId) return

      const groupTask = { ...task, group_id: selectedGroupId, createdBy: 'teacher' as const }

      if (isConfigured) {
        // Fetch students in this group
        const { data: enrollments } = await supabase.from('group_students').select('student_id').eq('group_id', selectedGroupId)
        if (enrollments && enrollments.length > 0) {
          const tasksToInsert = enrollments.map(e => ({
            user_id: e.student_id,
            group_id: selectedGroupId,
            type: task.type,
            title: task.title,
            description: task.description,
            category: task.category,
            created_by: 'teacher' as const,
            due_date: task.dueDate,
            priority: task.priority,
            status: 'pending',
            estimated_hours: task.estimatedHours,
            subject_ids: task.subjectIds,
            tags: task.tags || [],
          }))
          await supabase.from('tasks').insert(tasksToInsert)
        }
      } else {
        // Demo mode: save to group tasks
        const groupTasks = localStorage.getItem(`student_tasks_group_${selectedGroupId}`)
        const list: StudentTask[] = groupTasks ? JSON.parse(groupTasks) : []
        list.push(groupTask)
        localStorage.setItem(`student_tasks_group_${selectedGroupId}`, JSON.stringify(list))

        // Assign to mock students via localStorage (so useTasks picks it up)
        const groupStudents = mockGroupStudents.filter(gs => gs.groupId === selectedGroupId)
        for (const gs of groupStudents) {
          const key = `student_tasks_user_${gs.studentId}`
          const raw = localStorage.getItem(key)
          const existing = raw ? JSON.parse(raw) : []
          existing.push({ ...task, studentId: gs.studentId, createdBy: 'teacher' as const })
          localStorage.setItem(key, JSON.stringify(existing))
        }
      }

      setTasks(prev => [...prev, groupTask])
      setShowForm(false)
    } else {
      // Student mode
      if (isConfigured && user?.id) {
        await supabase.from('tasks').insert({
          user_id: user.id,
          type: task.type,
          title: task.title,
          description: task.description,
          category: task.category,
          created_by: 'student',
          due_date: task.dueDate,
          priority: task.priority,
          status: task.status,
          estimated_hours: task.estimatedHours,
          subject_ids: task.subjectIds,
          tags: task.tags || [],
        })
      } else {
        await createTaskHook({
          studentId: user?.id || studentId,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          subject_ids: task.subjectIds,
          status: task.status,
        })
      }
      setShowForm(false)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const completedDate = newStatus === 'completed' || newStatus === 'graded' ? new Date().toISOString() : undefined
    
    if (isConfigured && !isTeacher) {
      await supabase.from('tasks').update({ status: newStatus, completed_date: completedDate }).eq('id', taskId)
    } else if (!isConfigured && !isTeacher) {
      await updateStatusHook(taskId, newStatus)
    }

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus, completedDate: completedDate ?? t.completedDate }
      }
      return t
    })
    setTasks(updated)
  }

  const handleEditTask = (task: StudentTask) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (isConfigured && !isTeacher) {
      await supabase.from('tasks').delete().eq('id', taskId)
    } else if (!isConfigured && !isTeacher) {
      await removeTaskHook(taskId)
    }
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const handleAssessment = async (taskId: string, quality: number, learning: number) => {
    if (isConfigured && !isTeacher) {
      await supabase.from('tasks').update({
        completion_quality: quality,
        learning_gain: learning,
      }).eq('id', taskId)
    }

    const updated = tasks.map(t =>
      t.id === taskId
        ? { ...t, completionQuality: quality as 1 | 2 | 3 | 4 | 5, learningGain: learning as 1 | 2 | 3 | 4 | 5 }
        : t
    )
    setTasks(updated)
  }

  const resetFilters = () => {
    setFilterStatus('all')
    setFilterCategory('all')
    setFilterPriority('all')
    setSearchTerm('')
    setSortBy('dueDate')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            {isTeacher ? 'Devoirs du Groupe' : 'Mes Tâches'}
          </h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {isTeacher ? 'Assignez et gérez les devoirs de vos classes' : 'Créez et suivez vos tâches personnelles'}
          </p>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-3">
            <select
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">Sélectionnez un groupe</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            {selectedGroupId && !showForm && (
              <button
                onClick={() => {
                  setEditingTask(null)
                  setShowForm(true)
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                + Assigner Devoir
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-[var(--color-white)] rounded-xl p-6 max-w-2xl w-full my-8">
            <TaskCreationForm
              studentId={studentId}
              onTaskCreated={handleTaskCreated}
              onCancel={() => {
                setShowForm(false)
                setEditingTask(null)
              }}
              defaultTask={editingTask}
              isEditing={!!editingTask}
            />
          </div>
        </div>
      )}

      {isTeacher && !selectedGroupId ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-text-secondary)] bg-[var(--color-white)]">
          <p className="text-lg font-medium mb-1">Aucun groupe sélectionné</p>
          <p className="text-sm">Veuillez sélectionner un groupe dans la liste en haut à droite pour voir les devoirs.</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-lg bg-[var(--color-white)] border border-[var(--color-border)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)] font-medium">Total</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-xs text-blue-700 font-medium">En cours</p>
              <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-green-700 font-medium">Complétées</p>
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-xs text-red-700 font-medium">En retard</p>
              <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
            </div>
            <div className="rounded-lg bg-purple-50 border border-purple-200 p-3">
              <p className="text-xs text-purple-700 font-medium">Complétion</p>
              <p className="text-2xl font-bold text-purple-700">{stats.completionRate}%</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-700 font-medium">Temps</p>
              <p className="text-2xl font-bold text-amber-700">{stats.engagementRate}%</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="space-y-4 bg-[var(--color-white)] border border-[var(--color-border)] rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <h3 className="font-semibold text-[var(--color-text)]">Filtres</h3>
              {(filterStatus !== 'all' || filterCategory !== 'all' || filterPriority !== 'all' || searchTerm) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-blue-600 hover:underline"
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
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Statut</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as TaskStatus | 'all')}
                  className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="pending">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="submitted">Soumis</option>
                  <option value="completed">Complété</option>
                  <option value="overdue">En retard</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Catégorie</label>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value as TaskCategory | 'all')}
                  className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="study">Étude</option>
                  <option value="practice">Pratique</option>
                  <option value="project">Projet</option>
                  <option value="reading">Lecture</option>
                  <option value="review">Révision</option>
                  <option value="exam">Examen</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Priorité</label>
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value as TaskPriority | 'all')}
                  className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="high">Haute</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Trier par</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'dueDate' | 'priority' | 'status')}
                  className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dueDate">Échéance</option>
                  <option value="priority">Priorité</option>
                  <option value="status">Statut</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {sortedTasks.length > 0 ? (
              sortedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  readOnly={isTeacher}
                  onStatusChange={isTeacher ? () => {} : handleStatusChange}
                  onEdit={isTeacher ? () => {} : handleEditTask}
                  onDelete={isTeacher ? () => {} : handleDeleteTask}
                  onAssessment={isTeacher ? undefined : handleAssessment}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-text-secondary)]">
                <p className="text-lg font-medium mb-1">Aucune tâche trouvée</p>
                <p className="text-sm">
                  {filterStatus !== 'all' || filterCategory !== 'all' || filterPriority !== 'all' || searchTerm
                    ? 'Essayez de modifier vos filtres'
                    : 'Aucun devoir assigné pour ce groupe.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
