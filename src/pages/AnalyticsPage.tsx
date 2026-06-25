import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { grades, subjects, absences, tasks } from '../data/mockData'
import { useProgress } from '../context/ProgressContext'

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
    const avg = subjectAverage(s.id)
    const coeff = s.coefficient ?? 1
    weightedSum += avg * coeff
    totalCoeff += coeff
  })
  return totalCoeff ? +(weightedSum / totalCoeff).toFixed(2) : 0
}

function buildRadarData() {
  return subjects.map(s => ({
    subject: s.name.split(' ')[0], // short label
    Note: subjectAverage(s.id),
    fullName: s.name,
  }))
}

function buildTrendData() {
  const sorted = [...grades].sort((a, b) => a.date.localeCompare(b.date))
  const byMonth: Record<string, number[]> = {}
  sorted.forEach(g => {
    const month = g.date.slice(0, 7)
    if (!byMonth[month]) byMonth[month] = []
    byMonth[month].push(g.value)
  })
  return Object.entries(byMonth).map(([month, vals]) => ({
    month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    Moyenne: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
    Cible: 14,
  }))
}

function countAbsenceDays() {
  return absences.reduce((s, a) => s + (a.duration === 'full' ? 1 : 0.5), 0)
}

export default function AnalyticsPage() {
  const { isChapterCompleted } = useProgress()
  const genAvg = generalAverage()
  const radarData = buildRadarData()
  const trendData = buildTrendData()
  const absenceDays = countAbsenceDays()
  const absenceRate = +((absenceDays / 120) * 100).toFixed(1)
  const overdueCount = tasks.filter(t => t.status === 'overdue').length
  const completionRate = +(tasks.filter(t => ['submitted', 'graded'].includes(t.status)).length / tasks.length * 100).toFixed(0)

  const bestSubject = subjects.reduce((best, s) => subjectAverage(s.id) > subjectAverage(best.id) ? s : best, subjects[0])
  const weakestSubject = subjects.reduce((worst, s) => subjectAverage(s.id) < subjectAverage(worst.id) ? s : worst, subjects[0])

  const subjectsWithChapters = subjects.filter(s => s.chapters && s.chapters.length > 0)
  const totalChapters = subjectsWithChapters.reduce((s, sub) => s + (sub.chapters ?? []).length, 0)
  const allChapterIds = subjectsWithChapters.flatMap(s => (s.chapters ?? []).map(ch => ch.id))
  const completedChapters = allChapterIds.filter(id => isChapterCompleted(id)).length
  const chapterRate = totalChapters ? Math.round((completedChapters / totalChapters) * 100) : 0
  const bestChapterSubject = subjectsWithChapters.reduce((best, s) => {
    const ids = (s.chapters ?? []).map(ch => ch.id)
    const done = ids.filter(id => isChapterCompleted(id)).length
    const rate = ids.length ? done / ids.length : 0
    const bestIds = (best.chapters ?? []).map(ch => ch.id)
    const bestDone = bestIds.filter(id => isChapterCompleted(id)).length
    const bestRate = bestIds.length ? bestDone / bestIds.length : 0
    return rate > bestRate ? s : best
  }, subjectsWithChapters[0] ?? subjects[0])

  const MENTION =
    genAvg >= 18 ? { label: 'Très Bien', color: '#1D9E75' } :
    genAvg >= 16 ? { label: 'Bien', color: '#3b82f6' } :
    genAvg >= 14 ? { label: 'Assez Bien', color: '#BA7517' } :
    genAvg >= 12 ? { label: 'Passable', color: '#9333EA' } :
                   { label: 'Insuffisant', color: '#D4537E' }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Analytics & Performance</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Vue globale de votre progression académique.</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl bg-[var(--color-primary)] p-5 text-white">
          <div className="text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">Moyenne Générale</div>
          <div className="mt-2 text-4xl font-bold">{genAvg}/20</div>
          <div className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium bg-white/20 text-white">
            {MENTION.label}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Taux de présence</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{(100 - absenceRate).toFixed(1)}%</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{absenceDays}j d'absence</div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Apprentissage</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{chapterRate}%</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{completedChapters}/{totalChapters} chapitres</div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
          <div className="text-[var(--text-xs)] font-medium text-green-700 uppercase tracking-wider">Tâches complétées</div>
          <div className="mt-2 text-4xl font-bold text-green-700">{completionRate}%</div>
          <div className="mt-1 text-[var(--text-xs)] text-green-600">taux de complétion</div>
        </div>

        <div className={`rounded-2xl border p-5 ${overdueCount > 0 ? 'border-red-100 bg-red-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'}`}>
          <div className={`text-[var(--text-xs)] font-medium uppercase tracking-wider ${overdueCount > 0 ? 'text-red-700' : 'text-[var(--color-text-secondary)]'}`}>En retard</div>
          <div className={`mt-2 text-4xl font-bold ${overdueCount > 0 ? 'text-red-500' : 'text-[var(--color-text)]'}`}>{overdueCount}</div>
          <div className={`mt-1 text-[var(--text-xs)] ${overdueCount > 0 ? 'text-red-500' : 'text-[var(--color-text-secondary)]'}`}>
            tâche{overdueCount !== 1 ? 's' : ''} en retard
          </div>
        </div>
      </div>

      {/* Radar + Trend side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Profil de compétences</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Radar
                name="Note /20"
                dataKey="Note"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend chart */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Évolution & objectif</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v: any) => [`${v}/20`]}
              />
              <Legend />
              <Line type="monotone" dataKey="Moyenne" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} name="Moyenne réelle" />
              <Line type="monotone" dataKey="Cible" stroke="#e5e7eb" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Objectif (14/20)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Points clés</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-green-50 border border-green-100 p-4">
            <div className="text-[var(--text-xs)] font-semibold text-green-700 uppercase tracking-wider mb-1">✨ Meilleure matière</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: bestSubject.color }} />
              <span className="font-semibold text-[var(--color-text)]">{bestSubject.name}</span>
            </div>
            <div className="mt-1 text-2xl font-bold" style={{ color: bestSubject.color }}>{subjectAverage(bestSubject.id)}/20</div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
            <div className="text-[var(--text-xs)] font-semibold text-amber-700 uppercase tracking-wider mb-1">⚡ À renforcer</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: weakestSubject.color }} />
              <span className="font-semibold text-[var(--color-text)]">{weakestSubject.name}</span>
            </div>
            <div className="mt-1 text-2xl font-bold" style={{ color: weakestSubject.color }}>{subjectAverage(weakestSubject.id)}/20</div>
          </div>

          <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
            <div className="text-[var(--text-xs)] font-semibold text-purple-700 uppercase tracking-wider mb-1">📚 Apprentissage</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: bestChapterSubject?.color ?? '#7F77DD' }} />
              <span className="font-semibold text-[var(--color-text)]">{bestChapterSubject?.name ?? '—'}</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-purple-700">{chapterRate}%</div>
            <div className="mt-1 text-[var(--text-xs)] text-purple-600">{completedChapters}/{totalChapters} chapitres complétés</div>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <div className="text-[var(--text-xs)] font-semibold text-blue-700 uppercase tracking-wider mb-1">🎯 Mention visée</div>
            <div className="mt-2 text-2xl font-bold" style={{ color: MENTION.color }}>{MENTION.label}</div>
            <div className="mt-1 text-[var(--text-xs)] text-blue-600">
              {genAvg >= 18 ? 'Félicitations !' :
               genAvg >= 16 ? `+${(18 - genAvg).toFixed(2)} pts pour Très Bien` :
               `+${(16 - genAvg).toFixed(2)} pts pour Bien`}
            </div>
          </div>
        </div>
      </div>

      {/* Subject-by-subject breakdown */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <h2 className="mb-5 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Détail par matière</h2>
        <div className="flex items-center gap-4 px-1 pb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
          <div className="w-44">Matière</div>
          <div className="flex-1" />
          <div className="w-16 text-right">Moyenne</div>
          <div className="w-20 text-right">Notes</div>
          <div className="w-16 text-right">Chapitres</div>
        </div>
        <div className="space-y-3">
          {subjects.map(s => {
            const avg = subjectAverage(s.id)
            const gradeCount = grades.filter(g => g.subjectId === s.id).length
            const chs = s.chapters ?? []
            const chDone = chs.filter(ch => isChapterCompleted(ch.id)).length
            const chPct = chs.length ? Math.round((chDone / chs.length) * 100) : null
            return (
              <div key={s.id} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-44 flex-shrink-0">
                  <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-[var(--text-sm)] font-medium text-[var(--color-text)] truncate">{s.name}</span>
                </div>
                <div className="flex-1 h-3 rounded-full bg-[var(--color-gray-bg)] overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${(avg / 20) * 100}%`, background: s.color }}
                  />
                </div>
                <div className="w-16 flex-shrink-0 text-right">
                  <span className="font-bold text-[var(--color-text)]">{avg}/20</span>
                </div>
                <div className="w-20 flex-shrink-0 text-right text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                  {gradeCount} note{gradeCount > 1 ? 's' : ''}
                </div>
                {chPct !== null && (
                  <div className="w-16 flex-shrink-0 text-right">
                    <span className="font-semibold text-purple-700">{chPct}%</span>
                    <div className="text-[10px] text-[var(--color-text-secondary)]">{chDone}/{chs.length} ch.</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
