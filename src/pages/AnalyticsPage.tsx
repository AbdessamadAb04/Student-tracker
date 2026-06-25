import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useAcademicData } from '../hooks/useAcademicData'
import { useStudySessions } from '../hooks/useStudySessions'
import type { Grade, Subject } from '../types'

function subjectAverage(grades: Grade[], subjectId: string) {
  const sg = grades.filter(g => g.subjectId === subjectId)
  if (!sg.length) return 0
  const totalWeight = sg.reduce((s, g) => s + g.weight, 0)
  const weighted = sg.reduce((s, g) => s + g.value * g.weight, 0)
  return +(weighted / totalWeight).toFixed(2)
}

function generalAverage(grades: Grade[], subjects: Subject[]) {
  let totalCoeff = 0, weightedSum = 0
  subjects.forEach(s => {
    if (!s.coefficient) return
    const avg = subjectAverage(grades, s.id)
    weightedSum += avg * s.coefficient
    totalCoeff += s.coefficient
  })
  return totalCoeff ? +(weightedSum / totalCoeff).toFixed(2) : 0
}

export default function AnalyticsPage() {
  const { subjects, grades, absences, loading } = useAcademicData()
  const { stats } = useStudySessions()

  const genAvg = generalAverage(grades, subjects)

  const radarData = subjects.filter(s => s.type === 'academic').map(s => ({
    subject: s.name.split(' ')[0],
    Note: subjectAverage(grades, s.id),
    fullName: s.name,
  }))

  const trendData = (() => {
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
  })()

  const absenceDays = absences.reduce((s, a) => s + (a.duration === 'full' ? 1 : 0.5), 0)
  const absenceRate = +((absenceDays / 120) * 100).toFixed(1)

  const academicSubjects = subjects.filter(s => s.type === 'academic')
  const bestSubject = academicSubjects.length ? academicSubjects.reduce((best, s) =>
    subjectAverage(grades, s.id) > subjectAverage(grades, best.id) ? s : best, academicSubjects[0]) : null
  const weakestSubject = academicSubjects.length ? academicSubjects.reduce((worst, s) =>
    subjectAverage(grades, s.id) < subjectAverage(grades, worst.id) ? s : worst, academicSubjects[0]) : null

  const MENTION =
    genAvg >= 18 ? { label: 'Très Bien', color: '#1D9E75' } :
    genAvg >= 16 ? { label: 'Bien', color: '#3b82f6' } :
    genAvg >= 14 ? { label: 'Assez Bien', color: '#BA7517' } :
    genAvg >= 12 ? { label: 'Passable', color: '#9333EA' } :
                   { label: 'Insuffisant', color: '#D4537E' }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-xl bg-[var(--color-gray-bg)]" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-[var(--color-gray-bg)]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
          <TrendingUp className="h-6 w-6 text-[var(--color-primary)]" /> Analytics & Performance
        </h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Vue globale de votre progression académique.</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-[var(--color-primary)] p-5 text-white">
          <div className="text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">Moyenne Générale</div>
          <div className="mt-2 text-4xl font-bold">{genAvg || '—'}</div>
          <div className="mt-1 text-[var(--text-xs)] font-semibold" style={{ color: MENTION.color === 'var(--color-primary)' ? '#fff' : '#fff' }}>
            {MENTION.label}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Taux d'absence</div>
          <div className={`mt-2 text-4xl font-bold ${absenceRate > 10 ? 'text-red-500' : 'text-[var(--color-text)]'}`}>{absenceRate}%</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{absenceDays} jour{absenceDays !== 1 ? 's' : ''}</div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Temps d'étude</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{stats?.totalHours ?? 0}h</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{stats?.sessionCount ?? 0} séances</div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Matières</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{subjects.length}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{grades.length} notes</div>
        </div>
      </div>

      {/* Best & Worst */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {bestSubject && (
          <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl flex-shrink-0"
              style={{ background: bestSubject.color + '20' }}>🏆</div>
            <div>
              <div className="text-[var(--text-xs)] text-green-700 font-medium">Meilleure matière</div>
              <div className="font-bold text-[var(--color-text)]">{bestSubject.name}</div>
              <div className="text-[var(--text-sm)] text-green-700 font-semibold">{subjectAverage(grades, bestSubject.id)}/20</div>
            </div>
          </div>
        )}
        {weakestSubject && (
          <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl flex-shrink-0"
              style={{ background: weakestSubject.color + '20' }}>📌</div>
            <div>
              <div className="text-[var(--text-xs)] text-amber-700 font-medium">À renforcer</div>
              <div className="font-bold text-[var(--color-text)]">{weakestSubject.name}</div>
              <div className="text-[var(--text-sm)] text-amber-700 font-semibold">{subjectAverage(grades, weakestSubject.id)}/20</div>
            </div>
          </div>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radar chart */}
        {radarData.length > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
            <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Radar de performance</h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Radar dataKey="Note" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trend chart */}
        {trendData.length > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
            <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Évolution des notes</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(value) => [`${value}/20`]}
                />
                <Legend />
                <Line type="monotone" dataKey="Moyenne" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Cible" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Subject breakdown */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Détail par matière</h2>
        <div className="space-y-4">
          {academicSubjects.map(s => {
            const avg = subjectAverage(grades, s.id)
            const gradeCount = grades.filter(g => g.subjectId === s.id).length
            return (
              <div key={s.id} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg flex-shrink-0" style={{ background: s.color + '20' }}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[var(--text-sm)] font-medium text-[var(--color-text)] truncate">{s.name}</span>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{gradeCount} notes</span>
                      <span className={`text-base font-bold ${
                        avg >= 16 ? 'text-green-600' : avg >= 12 ? 'text-amber-600' : 'text-red-500'
                      }`}>{avg || '—'}/20</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--color-gray-bg)]">
                    <div className="h-2 rounded-full" style={{ width: `${(avg / 20) * 100}%`, background: s.color }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
