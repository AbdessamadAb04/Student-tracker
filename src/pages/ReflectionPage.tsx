import { useState } from 'react'
import { Brain, ClipboardList, Clock, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { useReflections } from '../hooks/useReflections'
import { useSubjects } from '../hooks/useSubjects'
import ReflectionForm from '../components/reflection/ReflectionForm'
import { REFLECTION_METRICS } from '../types/reflection'
import type { ReflectionEntry } from '../types/reflection'

const METRIC_COLORS = Object.fromEntries(REFLECTION_METRICS.map(m => [m.key, m.color]))

function ScoreBadge({ value, label }: { value: number; label: string }) {
  const color = value >= 8 ? 'text-green-600' : value >= 5 ? 'text-amber-600' : 'text-red-500'
  const bg = value >= 8 ? 'bg-green-50 border-green-100' : value >= 5 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'
  return (
    <div className={`rounded-xl border p-4 text-center ${bg}`}>
      <div className={`text-3xl font-bold ${color}`}>{value}<span className="text-lg">/10</span></div>
      <div className="mt-1 text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)]">{label}</div>
    </div>
  )
}

export default function ReflectionPage() {
  const { reflections, loading, create, remove, getTrend } = useReflections()
  const { subjects } = useSubjects()
  const [showForm, setShowForm] = useState(false)
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(new Set(['satisfaction', 'motivation', 'mastery']))

  const trend = getTrend()

  // Latest reflection snapshot
  const latest = reflections[0] ?? null

  const latestSnapshot = latest ? [
    { metric: 'Satisfaction', value: latest.progressSatisfaction },
    { metric: 'Confiance',    value: latest.confidenceLevel },
    { metric: 'Motivation',   value: latest.motivationLevel },
    { metric: 'Concentration', value: latest.concentrationLevel },
    { metric: 'Maîtrise',    value: latest.selfAssessedMastery },
  ] : []

  const toggleMetric = (key: string) => {
    setActiveMetrics(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
            <Brain className="h-6 w-6 text-[var(--color-primary)]" /> Réflexion & Auto-évaluation
          </h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Mesure ton évolution sur les facteurs que tu contrôles.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[var(--text-sm)] font-semibold text-white hover:opacity-90 transition-opacity"
        >
          + Nouvelle réflexion
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-6">
          <div className="bg-[var(--color-white)] rounded-2xl p-6 max-w-2xl w-full my-8">
            <ReflectionForm
              subjects={subjects}
              onSubmit={async (data) => { await create(data); setShowForm(false) }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-[var(--color-text-secondary)]">Chargement...</div>
      ) : reflections.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] p-16 text-center">
          <div className="mb-4 flex justify-center"><ClipboardList className="h-12 w-12 text-[var(--color-text-secondary)]" /></div>
          <h3 className="text-[var(--text-base)] font-semibold text-[var(--color-text)] mb-2">Aucune réflexion enregistrée</h3>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-6">
            Créez votre première réflexion pour commencer à suivre votre évolution personnelle.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-[var(--text-sm)] font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Créer une réflexion
          </button>
        </div>
      ) : (
        <>
          {/* Latest snapshot cards */}
          {latest && (
            <>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">
                    Dernière réflexion — {new Date(latest.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </h2>
                  {latest.subjectId && (
                    <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                      {subjects.find(s => s.id === latest.subjectId)?.name ?? 'Matière inconnue'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {latestSnapshot.map(s => <ScoreBadge key={s.metric} value={s.value} label={s.metric} />)}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-xl bg-[var(--color-gray-bg)] p-3">
                    <div className="text-2xl font-bold text-[var(--color-text)]">{latest.hoursStudied}h</div>
                    <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">Heures étudiées</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-gray-bg)] p-3">
                    <div className="text-2xl font-bold text-[var(--color-text)]">{latest.sessionsCount}</div>
                    <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">Séances</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-gray-bg)] p-3">
                    <div className="text-2xl font-bold text-[var(--color-text)]">{latest.tasksCompleted}</div>
                    <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">Tâches complétées</div>
                  </div>
                </div>
                {latest.notes && (
                  <div className="mt-4 rounded-xl bg-[var(--color-gray-bg)] p-3 text-[var(--text-sm)] text-[var(--color-text-secondary)] italic">
                    "{latest.notes}"
                  </div>
                )}
              </div>

              {/* Radar snapshot */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
                  <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Profil psychologique (dernière réflexion)</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={latestSnapshot}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Radar name="Score" dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Trend line */}
                {trend.length >= 2 && (
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Évolution dans le temps</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {REFLECTION_METRICS.map(m => (
                        <button key={m.key}
                          onClick={() => toggleMetric(m.key)}
                          className={`rounded-full px-2.5 py-0.5 text-[var(--text-xs)] font-medium transition-all ${
                            activeMetrics.has(m.key) ? 'text-white' : 'bg-[var(--color-gray-bg)] text-[var(--color-text-secondary)]'
                          }`}
                          style={activeMetrics.has(m.key) ? { background: m.color } : {}}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={trend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 11 }} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                        {REFLECTION_METRICS.filter(m => activeMetrics.has(m.key)).map(m => (
                          <Line key={m.key} type="monotone" dataKey={
                            m.key === 'progressSatisfaction' ? 'satisfaction' :
                            m.key === 'confidenceLevel' ? 'confidence' :
                            m.key === 'motivationLevel' ? 'motivation' :
                            m.key === 'selfAssessedMastery' ? 'mastery' : 'concentration'
                          } stroke={m.color} strokeWidth={2} dot={{ r: 3 }} name={m.label} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}

          {/* History */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-6 py-4">
              <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Historique des réflexions ({reflections.length})</h2>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {reflections.map((r: ReflectionEntry) => {
                const subj = subjects.find(s => s.id === r.subjectId)
                const avgScore = Math.round((r.progressSatisfaction + r.confidenceLevel + r.motivationLevel + r.selfAssessedMastery + r.concentrationLevel) / 5)
                const scoreColor = avgScore >= 8 ? 'text-green-600' : avgScore >= 5 ? 'text-amber-600' : 'text-red-500'
                return (
                  <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--color-gray-bg)] transition-colors">
                    <div className="flex-shrink-0 text-center w-16">
                      <div className={`text-2xl font-bold ${scoreColor}`}>{avgScore}</div>
                      <div className="text-[10px] text-[var(--color-text-secondary)]">/ 10</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">
                          {new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long' })}
                        </span>
                        {subj && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ background: subj.color }}>
                            {subj.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {r.hoursStudied}h étudiées</span>
                        <span>· {r.sessionsCount} séance{r.sessionsCount > 1 ? 's' : ''}</span>
                        <span>· {r.tasksCompleted} tâche{r.tasksCompleted > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="hidden sm:flex gap-1">
                        {[r.progressSatisfaction, r.confidenceLevel, r.motivationLevel].map((v, i) => (
                          <div key={i} className="h-6 w-1.5 rounded-full" style={{ background: METRIC_COLORS[REFLECTION_METRICS[i].key], opacity: v / 10 + 0.2 }} />
                        ))}
                      </div>
                      <button onClick={() => remove(r.id)}
                        className="text-[var(--text-xs)] text-red-400 hover:text-red-600 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
