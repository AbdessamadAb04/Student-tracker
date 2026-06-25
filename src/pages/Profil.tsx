import { modules, profile, grades, absences, subjects } from '../data/mockData'
import { useProgress } from '../context/ProgressContext'
import { useAuth } from '../context/AuthContext'
import { User, Building, Calendar, Mail } from 'lucide-react'

function subjectAverage(subjectId: string) {
  const sg = grades.filter(g => g.subjectId === subjectId)
  if (!sg.length) return 0
  const totalWeight = sg.reduce((s, g) => s + g.weight, 0)
  const weighted = sg.reduce((s, g) => s + g.value * g.weight, 0)
  return +(weighted / totalWeight).toFixed(2)
}

function generalAverage() {
  let totalCoeff = 0, weightedSum = 0
  subjects.forEach(s => {
    if (!s.coefficient) return
    const avg = subjectAverage(s.id)
    weightedSum += avg * s.coefficient
    totalCoeff += s.coefficient
  })
  return totalCoeff ? +(weightedSum / totalCoeff).toFixed(2) : 0
}

export default function Profil() {
  const { user } = useAuth()
  const { progress, isCompleted } = useProgress()
  const completedCount = progress.completedLessons.length
  const allLessons = modules.flatMap(m => m.chapters.flatMap(c => c.lessons))
  const totalLessons = allLessons.length
  const globalPct = Math.round((completedCount / totalLessons) * 100)

  const modulesDone = modules.filter(m => {
    const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
    return ids.every(id => isCompleted(id))
  }).length

  const genAvg = generalAverage()
  const totalAbsenceDays = absences.reduce((s, a) => s + (a.duration === 'full' ? 1 : 0.5), 0)
  const presenceRate = +(100 - (totalAbsenceDays / 120) * 100).toFixed(1)

  const MENTION =
    genAvg >= 18 ? { label: 'Très Bien', color: 'text-green-600' } :
    genAvg >= 16 ? { label: 'Bien', color: 'text-blue-600' } :
    genAvg >= 14 ? { label: 'Assez Bien', color: 'text-amber-600' } :
    genAvg >= 12 ? { label: 'Passable', color: 'text-purple-600' } :
                   { label: 'Insuffisant', color: 'text-red-500' }

  // Prefer auth user name over mock profile
  const rawName = (user?.user_metadata?.name as string | undefined) ?? profile.name
  const rawEmail = user?.email ?? profile.email
  const initials = rawName.split(' ').filter(Boolean).map(n => n[0]?.toUpperCase() ?? '').slice(0, 2).join('')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="flex items-center gap-2 text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
        <User className="h-6 w-6 text-[var(--color-primary)]" /> Mon Profil
      </h1>

      {/* Identity card */}
      <div className="flex items-center gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold text-[var(--text-xl)]"
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[var(--text-xl)] font-bold text-[var(--color-text)]">{rawName}</h2>
          <p className="mt-0.5 text-[var(--text-sm)] text-[var(--color-text-secondary)] truncate">{profile.track}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-[var(--text-xs)]">
            <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
              <Building className="h-3 w-3" /> {profile.institution}
            </span>
            <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
              <Calendar className="h-3 w-3" /> {profile.year}
            </span>
            <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
              <Mail className="h-3 w-3" /> {rawEmail}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0 hidden sm:block">
          <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">Étudiant depuis</div>
          <div className="font-semibold text-[var(--color-text)]">
            {new Date(profile.startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Academic stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-[var(--color-primary)] p-5 text-white text-center">
          <div className="text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">Moy. Générale</div>
          <div className="mt-2 text-4xl font-bold">{genAvg}</div>
          <div className={`mt-1 text-[var(--text-xs)] font-semibold text-white/80`}>{MENTION.label}</div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-center">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Présence</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{presenceRate}%</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{totalAbsenceDays}j absent</div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-center">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Cours</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{globalPct}%</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{completedCount}/{totalLessons} leçons</div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-center">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Modules finis</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{modulesDone}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">sur {modules.length}</div>
        </div>
      </div>

      {/* Subject averages */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <h3 className="text-[var(--text-base)] font-semibold text-[var(--color-text)] mb-4">Performance par matière</h3>
        <div className="space-y-3">
          {subjects.map(s => {
            const avg = subjectAverage(s.id)
            const color = avg >= 16 ? '#1D9E75' : avg >= 12 ? '#BA7517' : '#D4537E'
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="flex-1 text-[var(--text-sm)] text-[var(--color-text)] truncate">{s.name}</span>
                <div className="w-36 h-2 rounded-full bg-[var(--color-gray-bg)] flex-shrink-0">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${(avg / 20) * 100}%`, background: s.color }} />
                </div>
                <span className="w-12 text-right text-[var(--text-sm)] font-bold flex-shrink-0" style={{ color }}>{avg}/20</span>
                {s.coefficient && (
                  <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)] w-12 text-right flex-shrink-0">Coeff.{s.coefficient}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}