import { useAcademicData } from '../hooks/useAcademicData'

const ratingStars = (rating: number) =>
  [1, 2, 3, 4, 5].map(i => (
    <svg key={i} className={`h-4 w-4 ${i <= rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ))

export default function FeedbackPage() {
  const { subjects, feedbacks, loading } = useAcademicData()

  const positive = feedbacks.filter(f => f.isPositive)
  const negative = feedbacks.filter(f => !f.isPositive)
  const avgRating = feedbacks.length
    ? +(feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0

  const sorted = [...feedbacks].sort((a, b) => b.date.localeCompare(a.date))

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
        <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">💬 Avis Professeurs</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Retours de vos enseignants sur votre parcours académique.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[var(--color-primary)] p-5 text-white">
          <div className="text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">Note moyenne</div>
          <div className="mt-2 text-4xl font-bold">{avgRating || '—'}</div>
          <div className="mt-1 flex gap-0.5">{ratingStars(Math.round(avgRating))}</div>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
          <div className="text-[var(--text-xs)] font-medium text-green-700 uppercase tracking-wider">Positifs</div>
          <div className="mt-2 text-4xl font-bold text-green-700">{positive.length}</div>
          <div className="mt-1 text-[var(--text-xs)] text-green-600">👍 encouragements</div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <div className="text-[var(--text-xs)] font-medium text-amber-700 uppercase tracking-wider">À améliorer</div>
          <div className="mt-2 text-4xl font-bold text-amber-700">{negative.length}</div>
          <div className="mt-1 text-[var(--text-xs)] text-amber-600">📌 axes de travail</div>
        </div>
      </div>

      {/* Feedback cards */}
      <div className="space-y-4">
        {sorted.map(f => {
          const subj = subjects.find(s => s.id === f.subjectId)
          return (
            <div
              key={f.id}
              className={`rounded-2xl border p-5 ${
                f.isPositive
                  ? 'border-green-100 bg-green-50/60'
                  : 'border-amber-100 bg-amber-50/60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white font-bold"
                  style={{ background: subj?.color ?? 'var(--color-primary)' }}
                >
                  {f.teacherName.split(' ').pop()?.charAt(0) ?? 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-semibold text-[var(--color-text)]">{f.teacherName}</span>
                      {subj && (
                        <span
                          className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium text-white"
                          style={{ background: subj.color }}
                        >
                          {subj.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">{ratingStars(f.rating)}</div>
                      <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)] whitespace-nowrap">
                        {new Date(f.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text)] italic leading-relaxed">
                    "{f.comment}"
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium ${
                        f.isPositive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {f.isPositive ? '👍 Positif' : '📌 À améliorer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] p-16 text-center">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Aucun avis pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
