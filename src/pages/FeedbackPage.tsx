import { feedbacks } from '../data/mockData'
import { useSubjects } from '../hooks/useSubjects'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`h-4 w-4 ${i <= rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

const avgRating = +(feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
const positiveCount = feedbacks.filter(f => f.isPositive).length

export default function FeedbackPage() {
  const { subjects } = useSubjects()
  const sorted = [...feedbacks].sort((a, b) => b.date.localeCompare(a.date))

  // Group by subject
  const bySubject = subjects
    .map(s => ({
      subject: s,
      items: feedbacks.filter(f => f.subjectId === s.id),
    }))
    .filter(g => g.items.length > 0)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Demo banner */}
      <div className="mb-4 rounded bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        Mode démonstration — données fictives
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Avis des Professeurs</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Retours qualitatifs et évaluations de vos enseignants.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[var(--color-primary)] p-6 text-white text-center">
          <div className="text-[var(--text-xs)] font-medium uppercase tracking-wider opacity-80 mb-2">Note Moyenne</div>
          <div className="text-5xl font-bold">{avgRating}</div>
          <div className="mt-2 flex justify-center">
            <Stars rating={Math.round(avgRating)} />
          </div>
          <div className="mt-1 text-[var(--text-xs)] opacity-70">/ 5</div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
          <div className="text-[var(--text-xs)] font-medium text-green-700 uppercase tracking-wider mb-2">Avis Positifs</div>
          <div className="text-5xl font-bold text-green-700">{positiveCount}</div>
          <div className="mt-1 text-[var(--text-xs)] text-green-600">sur {feedbacks.length} avis</div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 text-center">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Total Avis</div>
          <div className="text-5xl font-bold text-[var(--color-text)]">{feedbacks.length}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">par {new Set(feedbacks.map(f => f.teacherName)).size} professeurs</div>
        </div>
      </div>

      {/* Rating distribution by subject */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <h2 className="mb-5 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Évaluation par matière</h2>
        <div className="space-y-4">
          {bySubject.map(({ subject, items }) => {
            const avg = +(items.reduce((s, f) => s + f.rating, 0) / items.length).toFixed(1)
            return (
              <div key={subject.id} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-48 flex-shrink-0">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: subject.color }} />
                  <span className="text-[var(--text-sm)] text-[var(--color-text)] truncate">{subject.name}</span>
                </div>
                <div className="flex-1 h-2.5 rounded-full bg-[var(--color-gray-bg)]">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{ width: `${(avg / 5) * 100}%`, background: subject.color }}
                  />
                </div>
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  <Stars rating={Math.round(avg)} />
                  <span className="text-[var(--text-sm)] font-bold text-[var(--color-text)]">{avg}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Feedback timeline */}
      <div>
        <h2 className="mb-5 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Timeline des retours</h2>
        <div className="space-y-4">
          {sorted.map(f => {
            const subj = subjects.find(s => s.id === f.subjectId)
            return (
              <div
                key={f.id}
                className={`rounded-2xl border bg-[var(--color-white)] p-5 transition-shadow hover:shadow-sm ${
                  f.isPositive ? 'border-l-4' : 'border-l-4 border-l-amber-300'
                }`}
                style={f.isPositive ? { borderLeftColor: subj?.color || 'var(--color-success)' } : {}}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-semibold text-[var(--color-text)]">{f.teacherName}</span>
                      {subj && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[var(--text-xs)] font-medium text-white"
                          style={{ background: subj.color }}
                        >
                          {subj.name}
                        </span>
                      )}
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium ${
                        f.isPositive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {f.isPositive ? '👍 Positif' : '⚡ À améliorer'}
                      </span>
                    </div>
                    <p className="text-[var(--text-sm)] text-[var(--color-text)] leading-relaxed italic">"{f.comment}"</p>
                    <div className="mt-3 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                      {new Date(f.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <Stars rating={f.rating} />
                    <span className="mt-1 text-[var(--text-sm)] font-bold text-[var(--color-text)]">{f.rating}/5</span>
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
