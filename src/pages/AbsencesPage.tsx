import { useState } from 'react'
import { MapPin, AlertTriangle, Check, X, FileText, PartyPopper } from 'lucide-react'
import { useAcademicData } from '../hooks/useAcademicData'

const durationLabel = { half: 'Demi-journée', full: 'Journée entière' }

export default function AbsencesPage() {
  const { subjects, absences, loading } = useAcademicData()
  const [filterExcused, setFilterExcused] = useState<'all' | 'excused' | 'unexcused'>('all')

  const totalDays = absences.reduce((s, a) => s + (a.duration === 'full' ? 1 : 0.5), 0)
  const excusedCount = absences.filter(a => a.excused).length
  const unexcusedCount = absences.filter(a => !a.excused).length
  const absenceRate = +((totalDays / 120) * 100).toFixed(1)

  const filtered = absences.filter(a => {
    if (filterExcused === 'excused') return a.excused
    if (filterExcused === 'unexcused') return !a.excused
    return true
  })
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-xl bg-[var(--color-gray-bg)]" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-[var(--color-gray-bg)]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
          <MapPin className="h-6 w-6 text-red-500" /> Mes Absences
        </h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Historique de vos absences et justificatifs.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className={`rounded-2xl p-5 ${absenceRate > 10 ? 'bg-red-500 text-white' : 'bg-[var(--color-primary)] text-white'}`}>
          <div className="text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">Taux d'absence</div>
          <div className="mt-2 text-4xl font-bold">{absenceRate}%</div>
          <div className="mt-1 text-[var(--text-xs)] opacity-70">{totalDays} jour{totalDays !== 1 ? 's' : ''}</div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Total</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{absences.length}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">absences</div>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
          <div className="text-[var(--text-xs)] font-medium text-green-700 uppercase tracking-wider">Justifiées</div>
          <div className="mt-2 text-4xl font-bold text-green-700">{excusedCount}</div>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <div className="text-[var(--text-xs)] font-medium text-red-700 uppercase tracking-wider">Non justifiées</div>
          <div className="mt-2 text-4xl font-bold text-red-700">{unexcusedCount}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">Taux de présence</span>
          <span className="text-[var(--text-sm)] font-bold text-[var(--color-text)]">{(100 - absenceRate).toFixed(1)}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-[var(--color-gray-bg)]">
          <div
            className="h-3 rounded-full transition-all"
            style={{ width: `${100 - absenceRate}%`, background: absenceRate > 10 ? '#ef4444' : 'var(--color-primary)' }}
          />
        </div>
        <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          Seuil critique : 80% de présence requise. {absenceRate > 20 ? <span className="text-red-500 font-medium inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Attention !</span> : ''}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {([
          { key: 'all', label: 'Toutes' },
          { key: 'excused', label: <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Justifiées</span> },
          { key: 'unexcused', label: <span className="flex items-center gap-1"><X className="h-3 w-3" /> Non justifiées</span> },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterExcused(key)}
            className={`rounded-full px-4 py-1.5 text-[var(--text-xs)] font-medium transition-all ${
              filterExcused === key
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-gray-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-[var(--text-xs)] text-[var(--color-text-secondary)] self-center">
          {sorted.length} entrée{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[var(--text-sm)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-gray-bg)]">
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Matière</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Durée</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Raison</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {sorted.map(a => {
                const subj = subjects.find(s => s.id === a.subjectId)
                return (
                  <tr key={a.id} className="hover:bg-[var(--color-gray-bg)] transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-[var(--color-text-secondary)]">
                      {new Date(a.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3">
                      {subj ? (
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: subj.color }} />
                          <span className="text-[var(--color-text)]">{subj.name}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-secondary)]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-[var(--color-text)]">{durationLabel[a.duration]}</td>
                    <td className="px-6 py-3 text-[var(--color-text-secondary)]">{a.reason || '—'}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium ${
                            a.excused ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {a.excused ? 'Justifiée' : 'Non justifiée'}
                        </span>
                        {a.certificateProvided && (
                          <span className="flex items-center text-[var(--text-xs)] text-[var(--color-text-secondary)]"><FileText className="h-3 w-3 mr-1" /> Cert.</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[var(--color-text-secondary)] text-[var(--text-sm)]">
                    <div className="flex items-center justify-center gap-2">
                      Aucune absence enregistrée <PartyPopper className="h-4 w-4" />
                    </div>
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
