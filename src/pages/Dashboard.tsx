import { useNavigate } from 'react-router-dom'
import { Hand, BarChart2, AlertCircle, BookOpen, TrendingUp } from 'lucide-react'
import { useProgress } from '../context/ProgressContext'
import { useAuth } from '../context/AuthContext'
import { useAcademicData } from '../hooks/useAcademicData'
import { subjects as mockSubjects } from '../data/mockData'
import RadialProgress from '../components/shared/RadialProgress'

function subjectAverage(grades: { subjectId: string; value: number; weight: number }[], subjectId: string) {
  const sg = grades.filter(g => g.subjectId === subjectId)
  if (!sg.length) return 0
  const totalWeight = sg.reduce((s, g) => s + g.weight, 0)
  const weighted = sg.reduce((s, g) => s + g.value * g.weight, 0)
  return +(weighted / totalWeight).toFixed(2)
}

function generalAverage(
  grades: { subjectId: string; value: number; weight: number }[],
  subjects: { id: string; coefficient?: number }[]
) {
  let totalCoeff = 0, weightedSum = 0
  subjects.forEach(s => {
    if (!s.coefficient) return
    const avg = subjectAverage(grades, s.id)
    weightedSum += avg * s.coefficient
    totalCoeff += s.coefficient
  })
  return totalCoeff ? +(weightedSum / totalCoeff).toFixed(2) : 0
}

export default function Dashboard() {
  const { user } = useAuth()
  const { progress } = useProgress()
  const navigate = useNavigate()
  const { subjects, grades, absences, feedbacks, loading } = useAcademicData()

  // Academic stats — computed from live Supabase data
  const genAvg = generalAverage(grades, subjects)
  const totalAbsenceDays = absences.reduce((s, a) => s + (a.duration === 'full' ? 1 : 0.5), 0)
  const absenceRate = +((totalAbsenceDays / 120) * 100).toFixed(1)

  // Chapter progress
  const subjectsWithChapters = mockSubjects.filter(s => s.chapters && s.chapters.length > 0)
  const totalChapters = subjectsWithChapters.reduce((s, sub) => s + (sub.chapters ?? []).length, 0)
  const completedChaptersCount = (progress.completedChapters ?? []).length
  const globalPct = totalChapters > 0 ? Math.round((completedChaptersCount / totalChapters) * 100) : 0

  const recentFeedbacks = [...feedbacks].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  const MENTION =
    genAvg >= 18 ? 'Très Bien' :
    genAvg >= 16 ? 'Bien' :
    genAvg >= 14 ? 'Assez Bien' :
    genAvg >= 12 ? 'Passable' : 'Insuffisant'

  const firstName = (
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Étudiant'
  ).split(' ')[0]

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-xl bg-[var(--color-gray-bg)]" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-[var(--color-gray-bg)]" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-[var(--color-gray-bg)]" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="flex items-center gap-2 text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
          Bonjour, {firstName} <Hand className="h-6 w-6 text-yellow-500 animate-pulse" />
        </h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Academic KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* General average */}
        <button
          onClick={() => navigate('/notes')}
          className="group rounded-2xl bg-[var(--color-primary)] p-5 text-white text-left transition-transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-2 text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">
            <BarChart2 className="h-4 w-4" /> Moyenne Générale
          </div>
          <div className="mt-2 text-4xl font-bold">{genAvg || '—'}</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[var(--text-xs)] opacity-70">/ 20</span>
            {genAvg > 0 && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[var(--text-xs)]">{MENTION}</span>}
          </div>
        </button>

        {/* Absence rate */}
        <button
          onClick={() => navigate('/absences')}
          className={`group rounded-2xl border p-5 text-left transition-transform hover:scale-[1.02] ${
            absenceRate > 10 ? 'border-red-200 bg-red-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'
          }`}
        >
          <div className="flex items-center gap-2 text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" /> Absences
          </div>
          <div className={`mt-2 text-4xl font-bold ${absenceRate > 10 ? 'text-red-500' : 'text-[var(--color-text)]'}`}>
            {absenceRate}%
          </div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {totalAbsenceDays}j · {absences.length} entrées
          </div>
        </button>

        {/* Subjects count */}
        <button
          onClick={() => navigate('/notes')}
          className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-left transition-transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-2 text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            <BookOpen className="h-4 w-4" /> Matières
          </div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{subjects.length}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{grades.length} notes enregistrées</div>
        </button>

        {/* Analytics */}
        <button
          onClick={() => navigate('/analytics')}
          className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-left transition-transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-2 text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" /> Analytics
          </div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{feedbacks.length}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">avis professeurs</div>
        </button>
      </div>

      {/* Middle row: Subject averages + Recent feedback */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Subject averages */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Notes par matière</h2>
            <button onClick={() => navigate('/notes')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
          </div>
          <div className="space-y-3">
            {subjects.filter(s => s.type === 'academic').map(s => {
              const avg = subjectAverage(grades, s.id)
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 text-[var(--text-sm)] text-[var(--color-text)] truncate">{s.name}</span>
                  <div className="w-32 h-1.5 rounded-full bg-[var(--color-gray-bg)] flex-shrink-0">
                    <div className="h-1.5 rounded-full" style={{ width: `${(avg / 20) * 100}%`, background: s.color }} />
                  </div>
                  <span className="w-10 text-right text-[var(--text-sm)] font-bold text-[var(--color-text)]">{avg || '—'}</span>
                </div>
              )
            })}
            {subjects.filter(s => s.type === 'academic').length === 0 && (
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] text-center py-4">Aucune matière</p>
            )}
          </div>
        </div>

        {/* Recent feedback */}
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
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white text-[var(--text-xs)] font-bold"
                    style={{ background: subj?.color || 'var(--color-primary)' }}
                  >
                    {f.teacherName.split(' ').pop()?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[var(--text-xs)]">
                      <span className="font-medium text-[var(--color-text)]">{f.teacherName}</span>
                      <span className="text-[var(--color-text-secondary)]">·</span>
                      <span className="text-[var(--color-text-secondary)] truncate">{subj?.name}</span>
                      <div className="ml-auto flex flex-shrink-0">
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
            {recentFeedbacks.length === 0 && (
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] text-center py-4">Aucun avis</p>
            )}
          </div>
        </div>
      </div>

      {/* Chapter progress */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex items-center gap-8 mb-6">
          <RadialProgress value={globalPct} size={100} strokeWidth={8} label="cours" />
          <div>
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Progression des cours</h2>
            <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{completedChaptersCount}/{totalChapters} chapitres complétés</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {subjectsWithChapters.map(s => {
            const chs = s.chapters ?? []
            const done = chs.filter(ch => (progress.completedChapters ?? []).includes(ch.id)).length
            const pct = chs.length > 0 ? Math.round((done / chs.length) * 100) : 0
            return (
              <button
                key={s.id}
                onClick={() => navigate(`/modules?subjectId=${s.id}`)}
                className="rounded-xl border border-[var(--color-border)] p-3 text-left hover:border-[var(--color-primary)] transition-colors"
              >
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