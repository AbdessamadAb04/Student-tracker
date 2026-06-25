import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGrades } from '../hooks/useGrades'
import { useAbsences } from '../hooks/useAbsences'
import { useTasks } from '../hooks/useTasks'
import { useSubjects } from '../hooks/useSubjects'
import { useStudySessions } from '../hooks/useStudySessions'
import { useProgress } from '../context/ProgressContext'
import RadialProgress from '../components/shared/RadialProgress'
import { feedbacks as mockFeedbacks, mockGroups, mockGroupStudents } from '../data/mockData'

function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const teacherName = user?.user_metadata?.name ?? user?.email ?? 'Enseignant'
  const { grades } = useGrades()
  const { tasks } = useTasks()

  const totalStudents = mockGroupStudents.length
  const totalGroups = mockGroups.length
  const assignedTasks = tasks.filter(t => t.status === 'submitted')
  const pendingReview = assignedTasks.length
  const totalGrades = grades.length

  const excellent = grades.filter(g => g.value >= 16).length
  const satisfactory = grades.filter(g => g.value >= 12 && g.value < 16).length
  const failing = grades.filter(g => g.value < 12).length

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          Bonjour, {teacherName.split(' ')[0]}
        </h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          Espace Enseignant · {today}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-[var(--color-primary)] p-5 text-white">
          <div className="text-[var(--text-xs)] font-medium opacity-75 uppercase tracking-wider">Groupes</div>
          <div className="mt-2 text-4xl font-bold">{totalGroups}</div>
          <div className="mt-1 text-[var(--text-xs)] opacity-60">classes actives</div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Étudiants</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{totalStudents}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">inscrits au total</div>
        </div>
        <button onClick={() => navigate('/taches')} className={`rounded-2xl border p-5 text-left transition-transform hover:scale-[1.02] ${pendingReview > 0 ? 'border-amber-200 bg-amber-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'}`}>
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">À corriger</div>
          <div className={`mt-2 text-4xl font-bold ${pendingReview > 0 ? 'text-amber-600' : 'text-[var(--color-text)]'}`}>{pendingReview}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">travaux soumis</div>
        </button>
        <button onClick={() => navigate('/notes')} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-left transition-transform hover:scale-[1.02]">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Notes saisies</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{totalGrades}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{assignedTasks.length} devoirs terminés</div>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Mes groupes</h2>
            <button onClick={() => navigate('/taches')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Gérer</button>
          </div>
          <div className="space-y-3">
            {mockGroups.map(g => {
              const studentCount = mockGroupStudents.filter(gs => gs.groupId === g.id).length
              return (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors cursor-pointer" onClick={() => navigate('/taches')}>
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-sm">{g.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--color-text)]">{g.name}</div>
                    {g.description && <div className="text-xs text-[var(--color-text-secondary)] truncate">{g.description}</div>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-[var(--color-text)]">{studentCount}</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">étudiants</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Répartition des notes</h2>
            <button onClick={() => navigate('/notes')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
          </div>
          {totalGrades === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">Aucune note saisie pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Excellent (≥ 16)', count: excellent, color: '#16a34a' },
                { label: 'Satisfaisant (12–16)', count: satisfactory, color: '#d97706' },
                { label: 'Insuffisant (< 12)', count: failing, color: '#dc2626' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="flex-1 text-[var(--text-sm)] text-[var(--color-text)]">{item.label}</span>
                  <div className="w-28 h-2 rounded-full bg-[var(--color-gray-bg)] flex-shrink-0">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${(item.count / totalGrades) * 100}%`, background: item.color }} />
                  </div>
                  <span className="w-8 text-right text-[var(--text-sm)] font-bold text-[var(--color-text)]">{item.count}</span>
                </div>
              ))}
              <div className="mt-2 pt-3 border-t border-[var(--color-border)] flex justify-between text-xs text-[var(--color-text-secondary)]">
                <span>Total : {totalGrades} notes</span>
                <span>Taux de réussite : {totalGrades ? Math.round(((excellent + satisfactory) / totalGrades) * 100) : 0}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Suivi des devoirs assignés</h2>
          <button onClick={() => navigate('/taches')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Gérer</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { label: 'À faire', count: tasks.filter(t => t.status === 'pending').length, style: 'bg-gray-50 border-gray-200 text-gray-600' },
            { label: 'En cours', count: tasks.filter(t => t.status === 'in_progress').length, style: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'Soumis', count: pendingReview, style: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: 'Terminés', count: tasks.filter(t => t.status === 'graded').length, style: 'bg-green-50 border-green-200 text-green-700' },
          ]).map(item => (
            <div key={item.label} className={`rounded-xl border p-4 text-center ${item.style}`}>
              <div className="text-3xl font-bold">{item.count}</div>
              <div className="mt-1 text-[var(--text-xs)] font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StudentDashboard() {
  const { isChapterCompleted } = useProgress()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { grades, globalAverage } = useGrades()
  const { absences, stats: absenceStats } = useAbsences()
  const { tasks, stats: taskStats } = useTasks()
  const { subjects } = useSubjects()
  const { stats: sessionStats } = useStudySessions()

  const genAvg = globalAverage
  const absenceRate = absences.length > 0 ? +((absenceStats.total / 120) * 100).toFixed(1) : 0
  const overdueCount = taskStats.overdue
  const pendingCount = taskStats.pending + taskStats.inProgress

  const subjectsWithChapters = subjects.filter(s => s.chapters && s.chapters.length > 0)
  const allChapterIds = subjectsWithChapters.flatMap(s => (s.chapters ?? []).map(ch => ch.id))
  const totalChaptersDashboard = allChapterIds.length
  const completedChaptersDashboard = allChapterIds.filter(id => isChapterCompleted(id)).length
  const globalPct = totalChaptersDashboard ? Math.round((completedChaptersDashboard / totalChaptersDashboard) * 100) : 0

  const recentFeedbacks = [...mockFeedbacks].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  const MENTION =
    genAvg >= 18 ? 'Très Bien' :
    genAvg >= 16 ? 'Bien' :
    genAvg >= 14 ? 'Assez Bien' :
    genAvg >= 12 ? 'Passable' : 'Insuffisant'

  const studentName = user?.user_metadata?.name ?? user?.email ?? 'Étudiant'

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          Bonjour, {studentName.split(' ')[0]}
        </h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {user?.groupName ?? ''} · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <button onClick={() => navigate('/notes')} className="group rounded-2xl bg-[var(--color-primary)] p-5 text-white text-left transition-transform hover:scale-[1.02]">
          <div className="text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">Moyenne Générale</div>
          <div className="mt-2 text-4xl font-bold">{genAvg}</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[var(--text-xs)] opacity-70">/ 20</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[var(--text-xs)]">{MENTION}</span>
          </div>
        </button>
        <button onClick={() => navigate('/absences')} className={`group rounded-2xl border p-5 text-left transition-transform hover:scale-[1.02] ${absenceRate > 10 ? 'border-red-200 bg-red-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'}`}>
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Absences</div>
          <div className={`mt-2 text-4xl font-bold ${absenceRate > 10 ? 'text-red-500' : 'text-[var(--color-text)]'}`}>{absenceRate}%</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{absenceStats.total}j · {absences.length} entrées</div>
        </button>
        <button onClick={() => navigate('/taches')} className={`group rounded-2xl border p-5 text-left transition-transform hover:scale-[1.02] ${overdueCount > 0 ? 'border-orange-200 bg-orange-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'}`}>
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Tâches</div>
          <div className={`mt-2 text-4xl font-bold ${overdueCount > 0 ? 'text-orange-500' : 'text-[var(--color-text)]'}`}>{overdueCount > 0 ? overdueCount : pendingCount}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{overdueCount > 0 ? `${overdueCount} en retard` : `${pendingCount} en cours / à faire`}</div>
        </button>
        <button onClick={() => navigate('/analytics')} className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-left transition-transform hover:scale-[1.02]">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Analytics</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{subjects.length}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">matières · {grades.length} notes</div>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Notes par matière</h2>
            <button onClick={() => navigate('/notes')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
          </div>
          <div className="space-y-3">
            {subjects.map(s => {
              const sg = grades.filter(g => g.subject_id === s.id)
              const avg = sg.length ? +(sg.reduce((sum, g) => sum + g.value * g.weight, 0) / sg.reduce((sum, g) => sum + g.weight, 0)).toFixed(2) : 0
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 text-[var(--text-sm)] text-[var(--color-text)] truncate">{s.name}</span>
                  <div className="w-32 h-1.5 rounded-full bg-[var(--color-gray-bg)] flex-shrink-0">
                    <div className="h-1.5 rounded-full" style={{ width: `${(avg / 20) * 100}%`, background: s.color }} />
                  </div>
                  <span className="w-10 text-right text-[var(--text-sm)] font-bold text-[var(--color-text)]">{avg}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Derniers avis professeurs</h2>
            <button onClick={() => navigate('/avis')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
          </div>
          <div className="space-y-4">
            {recentFeedbacks.map(f => {
              const subj = subjects.find(s => s.id === f.subjectId)
              return (
                <div key={f.id} className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white text-[var(--text-xs)] font-bold" style={{ background: subj?.color || 'var(--color-primary)' }}>
                    {f.teacherName.split(' ').pop()?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[var(--text-xs)]">
                      <span className="font-medium text-[var(--color-text)]">{f.teacherName}</span>
                      <span className="text-[var(--color-text-secondary)]">·</span>
                      <span className="text-[var(--color-text-secondary)]">{subj?.name}</span>
                      <div className="ml-auto flex">
                        {[1,2,3,4,5].map(i => (
                          <svg key={i} className={`h-3 w-3 ${i <= f.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)] line-clamp-2 italic">"{f.comment}"</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Tâches récentes</h2>
          <button onClick={() => navigate('/taches')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['overdue', 'in_progress', 'pending', 'graded'] as const).map(status => {
            const count = tasks.filter(t => t.status === status).length
            const cfg = {
              overdue:     { label: 'En retard',  bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-600' },
              in_progress: { label: 'En cours',   bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-600' },
              pending:     { label: 'À faire',    bg: 'bg-gray-50',  border: 'border-gray-200',  text: 'text-gray-600' },
              graded:      { label: 'Notées',     bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
            }[status]
            return (
              <div key={status} className={`rounded-xl border p-4 text-center ${cfg.bg} ${cfg.border}`}>
                <div className={`text-3xl font-bold ${cfg.text}`}>{count}</div>
                <div className={`mt-1 text-[var(--text-xs)] font-medium ${cfg.text}`}>{cfg.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex items-center gap-8 mb-6">
          <RadialProgress value={globalPct} size={100} strokeWidth={8} label="cours" />
          <div>
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Progression des cours</h2>
            <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{completedChaptersDashboard}/{totalChaptersDashboard} chapitres complétés</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {subjectsWithChapters.map(s => {
            const chs = s.chapters ?? []
            const done = chs.filter(ch => isChapterCompleted(ch.id)).length
            const pct = chs.length ? Math.round((done / chs.length) * 100) : 0
            return (
              <button key={s.id} onClick={() => navigate(`/modules?subjectId=${s.id}`)} className="rounded-xl border border-[var(--color-border)] p-3 text-left hover:border-[var(--color-primary)] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[var(--text-xs)] font-medium text-[var(--color-text)] truncate">{s.name}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--color-gray-bg)]">
                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                </div>
                <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{pct}%</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'
  return isTeacher ? <TeacherDashboard /> : <StudentDashboard />
}
