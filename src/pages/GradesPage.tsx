import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAcademicData } from '../hooks/useAcademicData'

const typeLabel: Record<string, string> = {
  exam: 'Examen', tp: 'TP', cc: 'CC', project: 'Projet', quiz: 'Quiz',
}

const typeBadge: Record<string, string> = {
  exam:    'bg-purple-100 text-purple-700',
  tp:      'bg-blue-100 text-blue-700',
  cc:      'bg-amber-100 text-amber-700',
  project: 'bg-green-100 text-green-700',
  quiz:    'bg-pink-100 text-pink-700',
}

function gradeColor(v: number) {
  if (v >= 16) return 'text-green-600'
  if (v >= 12) return 'text-amber-600'
  return 'text-red-500'
}

export default function GradesPage() {
  const { subjects, grades, loading } = useAcademicData()
  const [filterSubject, setFilterSubject] = useState<string>('all')

  const academicSubjects = subjects.filter(s => s.type === 'academic')

  function subjectAverage(subjectId: string) {
    const sg = grades.filter(g => g.subjectId === subjectId)
    if (!sg.length) return 0
    const totalWeight = sg.reduce((s, g) => s + g.weight, 0)
    const weighted = sg.reduce((s, g) => s + g.value * g.weight, 0)
    return +(weighted / totalWeight).toFixed(2)
  }

  function generalAverage() {
    let totalCoeff = 0, weightedSum = 0
    academicSubjects.forEach(s => {
      if (!s.coefficient) return
      const avg = subjectAverage(s.id)
      weightedSum += avg * s.coefficient
      totalCoeff += s.coefficient
    })
    return totalCoeff ? +(weightedSum / totalCoeff).toFixed(2) : 0
  }

  function buildChartData() {
    const sorted = [...grades].sort((a, b) => a.date.localeCompare(b.date))
    const byMonth: Record<string, number[]> = {}
    sorted.forEach(g => {
      const month = g.date.slice(0, 7)
      if (!byMonth[month]) byMonth[month] = []
      byMonth[month].push(g.value)
    })
    return Object.entries(byMonth).map(([month, vals]) => ({
      month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      moyenne: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
    }))
  }

  const filtered = filterSubject === 'all' ? grades : grades.filter(g => g.subjectId === filterSubject)
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
  const chartData = buildChartData()
  const genAvg = generalAverage()

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
      <div>
        <h1 className="flex items-center gap-2 text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
          <GraduationCap className="h-6 w-6 text-[var(--color-primary)]" /> Notes & Moyennes
        </h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Suivi de vos performances académiques par module.</p>
      </div>

      {/* General average + subject cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1 flex flex-col items-center justify-center rounded-2xl bg-[var(--color-primary)] p-6 text-white shadow-sm">
          <div className="text-[var(--text-xs)] font-medium uppercase tracking-wider opacity-80">Moyenne Générale</div>
          <div className="mt-2 text-5xl font-bold">{genAvg || '—'}</div>
          <div className="mt-1 text-[var(--text-xs)] opacity-70">/ 20</div>
        </div>
        {academicSubjects.slice(0, 3).map(s => {
          const avg = subjectAverage(s.id)
          return (
            <div key={s.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] truncate">{s.name}</span>
              </div>
              <div className={`text-3xl font-bold ${gradeColor(avg)}`}>{avg || '—'}</div>
              <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">/ 20{s.coefficient ? ` · Coeff. ${s.coefficient}` : ''}</div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--color-gray-bg)]">
                <div className="h-1.5 rounded-full" style={{ width: `${(avg / 20) * 100}%`, background: s.color }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* All subject averages filter */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Moyennes par matière</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {academicSubjects.map(s => {
            const avg = subjectAverage(s.id)
            return (
              <button
                key={s.id}
                onClick={() => setFilterSubject(filterSubject === s.id ? 'all' : s.id)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  filterSubject === s.id ? 'shadow-md' : 'border-[var(--color-border)] hover:border-gray-300'
                }`}
                style={filterSubject === s.id ? { borderColor: s.color, background: s.color + '10' } : {}}
              >
                <div className="text-xl font-bold" style={{ color: s.color }}>{avg || '—'}</div>
                <div className="mt-0.5 text-[var(--text-xs)] font-medium text-[var(--color-text)] leading-tight">{s.name}</div>
                {s.coefficient && <div className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">Coeff. {s.coefficient}</div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <h2 className="mb-6 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Évolution des notes dans le temps</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v: any) => [`${v}/20`, 'Moyenne']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="moyenne"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
                activeDot={{ r: 6 }}
                name="Moyenne mensuelle"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Grades table */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">
            Détail des notes
            {filterSubject !== 'all' && (
              <span className="ml-2 text-[var(--text-xs)] font-normal text-[var(--color-text-secondary)]">
                — filtré par {subjects.find(s => s.id === filterSubject)?.name}
              </span>
            )}
          </h2>
          {filterSubject !== 'all' && (
            <button onClick={() => setFilterSubject('all')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">
              Voir tout
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[var(--text-sm)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-gray-bg)]">
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Matière</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Évaluation</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {sorted.map(g => {
                const subj = subjects.find(s => s.id === g.subjectId)
                return (
                  <tr key={g.id} className="hover:bg-[var(--color-gray-bg)] transition-colors">
                    <td className="px-6 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                      {new Date(g.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: subj?.color }} />
                        <span className="text-[var(--color-text)] font-medium">{subj?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-[var(--color-text)]">{g.title}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium ${typeBadge[g.type] ?? ''}`}>
                        {typeLabel[g.type] ?? g.type}
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-right text-base font-bold ${gradeColor(g.value)}`}>
                      {g.value}/20
                    </td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[var(--color-text-secondary)] text-[var(--text-sm)]">
                    Aucune note pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
