import { useState } from 'react'
import { GraduationCap, Sprout, Book, TrendingUp, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useSubjects } from '../hooks/useSubjects'
import { useStudySessions } from '../hooks/useStudySessions'
import type { Subject } from '../types'

// ─── Subject Management Modal ─────────────────────────────────────────────────

const PRESET_COLORS = ['#7F77DD', '#1D9E75', '#BA7517', '#D4537E', '#0E7490', '#9333EA', '#F59E0B', '#EF4444', '#06B6D4', '#10B981']

function AddSubjectModal({ onAdd, onClose }: { onAdd: (s: Omit<Subject, 'id'>) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'academic' | 'personal'>('personal')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [teacher, setTeacher] = useState('')
  const [coeff, setCoeff] = useState(2)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-white)] rounded-2xl p-6 max-w-md w-full space-y-4">
        <h3 className="text-[var(--text-base)] font-bold text-[var(--color-text)]">Ajouter une matière</h3>
        <div>
          <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] block mb-1">Type</label>
          <div className="flex gap-3">
            {(['academic', 'personal'] as const).map(t => (
              <label key={t} className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all ${type === t ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-[var(--color-border)]'}`}>
                <input type="radio" className="sr-only" checked={type === t} onChange={() => setType(t)} />
                <span className="flex items-center gap-1 text-[var(--text-xs)] font-medium">
                  {t === 'academic' ? <><GraduationCap className="h-3 w-3" /> Académique</> : <><Sprout className="h-3 w-3" /> Personnel</>}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] block mb-1">Nom *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Intelligence Artificielle"
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
        </div>
        <div>
          <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] block mb-2">Couleur</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} type="button"
                className={`h-7 w-7 rounded-full border-2 transition-all ${color === c ? 'border-[var(--color-text)] scale-110' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
        {type === 'academic' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] block mb-1">Professeur</label>
              <input value={teacher} onChange={e => setTeacher(e.target.value)} placeholder="Pr. Nom"
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
            <div>
              <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] block mb-1">Coefficient</label>
              <input type="number" min={1} max={10} value={coeff} onChange={e => setCoeff(parseInt(e.target.value))}
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--text-sm)] text-[var(--color-text)] hover:bg-[var(--color-gray-bg)]">Annuler</button>
          <button
            onClick={() => { if (!name.trim()) return; onAdd({ name: name.trim(), color, type, ...(type === 'academic' ? { teacher, coefficient: coeff } : {}), isActive: true }); onClose() }}
            className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-[var(--text-sm)] font-semibold hover:opacity-90">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Study Session Logger ─────────────────────────────────────────────────────

function SessionLogger({ subjects, onLog, onClose }: { subjects: Subject[]; onLog: (d: { subjectId: string; durationMinutes: number; date: string; quality?: number }) => void; onClose: () => void }) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '')
  const [hours, setHours] = useState(1)
  const [minutes, setMinutes] = useState(0)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [quality, setQuality] = useState(3)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-white)] rounded-2xl p-6 max-w-md w-full space-y-4">
        <h3 className="flex items-center gap-2 text-[var(--text-base)] font-bold text-[var(--color-text)]">
          <Book className="h-5 w-5" /> Enregistrer une séance d'étude
        </h3>
        <div>
          <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] block mb-1">Matière</label>
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] block mb-1">Durée (heures)</label>
            <input type="number" min={0} max={12} value={hours} onChange={e => setHours(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>
          <div>
            <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] block mb-1">Durée (minutes)</label>
            <input type="number" min={0} max={59} step={5} value={minutes} onChange={e => setMinutes(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>
        </div>
        <div>
          <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] block mb-1">Date</label>
          <input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={e => setDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)]">Qualité de la séance</label>
            <span className="text-[var(--text-sm)] font-bold text-[var(--color-primary)]">{quality}/5</span>
          </div>
          <input type="range" min={1} max={5} value={quality} onChange={e => setQuality(parseInt(e.target.value))} className="w-full" />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--text-sm)] text-[var(--color-text)] hover:bg-[var(--color-gray-bg)]">Annuler</button>
          <button
            onClick={() => { const total = hours * 60 + minutes; if (total <= 0) return; onLog({ subjectId, durationMinutes: total, date, quality }); onClose() }}
            className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-[var(--text-sm)] font-semibold hover:opacity-90">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgressTrackerPage() {
  const { subjects, loading: subjectsLoading, create: createSubject } = useSubjects()
  const { sessions, stats, log: logSession } = useStudySessions()
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showLogSession, setShowLogSession] = useState(false)
  const [selectedType, setSelectedType] = useState<'all' | 'academic' | 'personal'>('all')

  const filtered = selectedType === 'all' ? subjects : subjects.filter(s => s.type === selectedType)

  // Build bar chart data: study hours per subject
  const studyBySubject = subjects.map(s => ({
    name: s.name.split(' ')[0],
    fullName: s.name,
    heures: +((stats?.bySubject[s.id] || 0) / 60).toFixed(1),
    color: s.color,
  })).filter(d => d.heures > 0)

  // Recent sessions for the list
  const recentSessions = sessions.slice(0, 8)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
            <TrendingUp className="h-6 w-6 text-[var(--color-primary)]" /> Suivi de Progression
          </h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Matières académiques et personnelles — temps d'étude et progression.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowLogSession(true)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-2.5 text-[var(--text-sm)] font-medium text-[var(--color-text)] hover:bg-[var(--color-gray-bg)] transition-colors">
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Séance d'étude</span>
          </button>
          <button onClick={() => setShowAddSubject(true)}
            className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[var(--text-sm)] font-semibold text-white hover:opacity-90 transition-opacity">
            + Matière
          </button>
        </div>
      </div>

      {showAddSubject && <AddSubjectModal onAdd={s => { createSubject(s); setShowAddSubject(false) }} onClose={() => setShowAddSubject(false)} />}
      {showLogSession && subjects.length > 0 && (
        <SessionLogger subjects={subjects} onLog={d => logSession({ ...d, notes: '' })} onClose={() => setShowLogSession(false)} />
      )}

      {/* Study stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-[var(--color-primary)] p-5 text-white">
            <div className="text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">Temps total</div>
            <div className="mt-2 text-4xl font-bold">{stats.totalHours}h</div>
            <div className="mt-1 text-[var(--text-xs)] opacity-70">{stats.sessionCount} séance{stats.sessionCount !== 1 ? 's' : ''}</div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
            <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Durée moy. séance</div>
            <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{stats.avgSessionMinutes}<span className="text-lg ml-1">min</span></div>
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="text-[var(--text-xs)] font-medium text-green-700 uppercase tracking-wider">Série actuelle</div>
            <div className="mt-2 text-4xl font-bold text-green-700">{stats.currentStreak}<span className="text-lg ml-1">j</span></div>
            <div className="mt-1 text-[var(--text-xs)] text-green-600">record: {stats.longestStreak}j</div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
            <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Moy. quotidienne</div>
            <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{stats.avgDailyMinutes}<span className="text-lg ml-1">min</span></div>
          </div>
        </div>
      )}

      {/* Study time chart */}
      {studyBySubject.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <h2 className="mb-5 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Temps d'étude par matière</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={studyBySubject} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis unit="h" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v: any, _: any, props: any) => [`${v}h`, props.payload?.fullName ?? 'Heures']} />
              <Bar dataKey="heures" radius={[6, 6, 0, 0]}>
                {studyBySubject.map((entry, idx) => (
                  <rect key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject type filter */}
      <div className="flex items-center gap-2">
        {(['all', 'academic', 'personal'] as const).map(t => (
          <button key={t} onClick={() => setSelectedType(t)}
            className={`rounded-full px-4 py-1.5 text-[var(--text-xs)] font-medium transition-all ${
              selectedType === t ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-gray-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}>
            {t === 'all' ? 'Toutes' : t === 'academic' ? '🎓 Académiques' : '🌱 Personnelles'}
          </button>
        ))}
        <span className="ml-auto text-[var(--text-xs)] text-[var(--color-text-secondary)]">{filtered.length} matière{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Subject cards grid */}
      {subjectsLoading ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(s => {
            const studyMins = stats?.bySubject[s.id] || 0
            const studyHours = +(studyMins / 60).toFixed(1)
            const sessionCount = sessions.filter(sess => sess.subjectId === s.id).length
            return (
              <div key={s.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: s.color + '20' }}>
                    <span className="text-lg">{s.type === 'academic' ? '🎓' : '🌱'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[var(--color-text)] truncate">{s.name}</div>
                    <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                      {s.type === 'academic' ? `${s.teacher ?? ''} · Coeff. ${s.coefficient ?? '—'}` : 'Matière personnelle'}
                    </div>
                  </div>
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: s.color }} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[var(--text-xs)]">
                    <span className="text-[var(--color-text-secondary)]">Temps d'étude</span>
                    <span className="font-semibold text-[var(--color-text)]">{studyHours}h</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--color-gray-bg)]">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min((studyHours / 20) * 100, 100)}%`, background: s.color }} />
                  </div>
                  <div className="flex justify-between text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    <span>{sessionCount} séance{sessionCount !== 1 ? 's' : ''}</span>
                    <span>{studyMins} min</span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add card */}
          <button onClick={() => setShowAddSubject(true)}
            className="rounded-2xl border-2 border-dashed border-[var(--color-border)] p-5 text-center text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">+</div>
            <div className="text-[var(--text-sm)] font-medium">Ajouter une matière</div>
          </button>
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] overflow-hidden">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Séances récentes</h2>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {recentSessions.map(sess => {
              const subj = subjects.find(s => s.id === sess.subjectId)
              return (
                <div key={sess.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-gray-bg)] transition-colors">
                  <div className="h-8 w-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: (subj?.color ?? '#6b7280') + '20' }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: subj?.color ?? '#6b7280', display: 'block' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{subj?.name ?? 'Matière inconnue'}</div>
                    <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                      {new Date(sess.startTime).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  <div className="text-[var(--text-sm)] font-semibold text-[var(--color-text)]">
                    {sess.durationMinutes >= 60 ? `${Math.floor(sess.durationMinutes / 60)}h${sess.durationMinutes % 60 ? String(sess.durationMinutes % 60).padStart(2, '0') : ''}` : `${sess.durationMinutes}min`}
                  </div>
                  {sess.quality && (
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= sess.quality! ? 'bg-amber-400' : 'bg-gray-200'}`} />)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
