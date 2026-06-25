import { useState, type ReactNode } from 'react'
import { Circle, Clock, CheckCircle2, CheckCheck, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import type { StudentTask, TaskStatus } from '../../types/task'
import { getTaskStatus, getDaysUntilDue, getSubtaskCompletionPercentage } from '../../utils/taskUtils'

interface TaskCardProps {
  task: StudentTask
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
  onEdit: (task: StudentTask) => void
  onDelete: (taskId: string) => void
  onAssessment?: (taskId: string, quality: number, learning: number) => void
}

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; dot: string; icon: ReactNode }> = {
  pending: {
    label: 'À faire',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
    icon: <Circle className="h-5 w-5" />,
  },
  in_progress: {
    label: 'En cours',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
  },
  submitted: {
    label: 'Soumis',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  graded: {
    label: 'Noté',
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    icon: <CheckCheck className="h-5 w-5" />,
  },
  completed: {
    label: 'Complété',
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  overdue: {
    label: 'En retard',
    bg: 'bg-red-100',
    text: 'text-red-600',
    dot: 'bg-red-500',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  abandoned: {
    label: 'Abandonné',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    dot: 'bg-gray-400',
    icon: <XCircle className="h-5 w-5" />,
  },
}

export default function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onAssessment,
}: TaskCardProps) {
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [showAssessment, setShowAssessment] = useState(false)
  const [assessmentData, setAssessmentData] = useState({ quality: 3, learning: 3 })

  const currentStatus = getTaskStatus(task)
  const cfg = statusConfig[currentStatus]
  const daysLeft = getDaysUntilDue(task.dueDate)
  const isOverdue = currentStatus === 'overdue'
  const subtaskProgress = getSubtaskCompletionPercentage(task.subtasks)
  const isComplex = task.type === 'complex' && task.subtasks && task.subtasks.length > 0

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  }

  const handleAssessment = () => {
    if (onAssessment) {
      onAssessment(task.id, assessmentData.quality, assessmentData.learning)
      setShowAssessment(false)
    }
  }

  return (
    <div
      className={`rounded-xl border bg-[var(--color-white)] p-4 transition-all hover:shadow-md ${
        isOverdue ? 'border-red-200 bg-red-50' : 'border-[var(--color-border)]'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Status Indicator */}
        <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
          <span className={`flex items-center justify-center ${cfg.text}`}>{cfg.icon}</span>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Header: Title + Status Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-sm font-bold text-[var(--color-text)]">{task.title}</h3>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
              {cfg.label}
            </span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority.toUpperCase()}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-[var(--color-text-secondary)] mb-2 line-clamp-2">{task.description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs mb-2">
            <span className="text-[var(--color-text-secondary)]">{task.category}</span>
            <span className="flex items-center text-[var(--color-text-secondary)]">
              <Clock className="h-3 w-3 mr-1" /> {task.estimatedHours}h
            </span>
            {task.actualHours && (
              <span className="text-blue-600">
                Réel: {task.actualHours}h ({Math.round((task.actualHours / task.estimatedHours) * 100)}%)
              </span>
            )}
            <span className={isOverdue ? 'text-red-500 font-medium' : 'text-[var(--color-text-secondary)]'}>
              Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </span>
            {!isOverdue && daysLeft > 0 && (
              <span className={`font-medium ${daysLeft <= 3 ? 'text-orange-500' : 'text-[var(--color-text-secondary)]'}`}>
                ({daysLeft}j)
              </span>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map(tag => (
                <span key={tag} className="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Subtasks (if complex) */}
          {isComplex && (
            <div className="mb-3 space-y-1">
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
              >
                {showSubtasks ? '▼' : '▶'} Subtasks ({task.subtasks?.filter(s => s.status === 'completed').length}/{task.subtasks?.length})
              </button>
              {showSubtasks && (
                <div className="ml-2 space-y-1 bg-gray-50 p-2 rounded">
                  {task.subtasks?.map(subtask => (
                    <div key={subtask.id} className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                      <span className={subtask.status === 'completed' ? 'text-green-600' : 'text-gray-400'}>
                        {subtask.status === 'completed' ? '✓' : '○'}
                      </span>
                      {subtask.title} ({subtask.estimatedHours}h)
                    </div>
                  ))}
                </div>
              )}
              {/* Progress bar */}
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Assessment (if completed) */}
          {(currentStatus === 'completed' || currentStatus === 'graded') && (task.completionQuality || task.learningGain) && (
            <div className="mb-2 text-xs text-[var(--color-text-secondary)]">
              {task.completionQuality && <span>Qualité: {task.completionQuality}/5</span>}
              {task.learningGain && <span className="ml-2">Apprentissage: {task.learningGain}/5</span>}
            </div>
          )}

          {/* Grade (if graded) */}
          {currentStatus === 'graded' && task.grade !== undefined && (
            <div className={`text-sm font-bold mb-2 ${task.grade >= 16 ? 'text-green-600' : task.grade >= 12 ? 'text-yellow-600' : 'text-red-600'}`}>
              Note: {task.grade}/20
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <select
            value={currentStatus}
            onChange={e => onStatusChange(task.id, e.target.value as TaskStatus)}
            className="text-xs px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--color-white)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="pending">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="submitted">Soumis</option>
            <option value="completed">Complété</option>
            <option value="abandoned">Abandonné</option>
          </select>

          {(currentStatus === 'completed' || currentStatus === 'in_progress') && !task.completionQuality && (
            <button
              onClick={() => setShowAssessment(true)}
              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              Évaluer
            </button>
          )}

          <button
            onClick={() => onEdit(task)}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Éditer
          </button>

          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr?')) {
                onDelete(task.id)
              }
            }}
            className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Assessment Modal */}
      {showAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-white)] rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-[var(--color-text)]">Auto-évaluation de la tâche</h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[var(--color-text)]">
                  Qualité de completion: {assessmentData.quality}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={assessmentData.quality}
                  onChange={e => setAssessmentData(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--color-text)]">
                  Gain d'apprentissage: {assessmentData.learning}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={assessmentData.learning}
                  onChange={e => setAssessmentData(prev => ({ ...prev, learning: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAssessment(false)}
                className="px-3 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAssessment}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
