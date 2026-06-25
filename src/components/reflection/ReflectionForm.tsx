import { useState, type ReactNode } from 'react'
import { ClipboardList, Clock, CheckCircle2, Target, Lightbulb, Brain } from 'lucide-react'
import type { ReflectionFormData } from '../../types/reflection'
import { REFLECTION_METRICS } from '../../types/reflection'
import type { Subject } from '../../types'

interface ReflectionFormProps {
  subjects: Subject[]
  onSubmit: (data: ReflectionFormData) => Promise<void>
  onCancel: () => void
}

function ScaleInput({ label, description, value, min = 1, max = 10, onChange }: {
  label: string; description: string; value: number; min?: number; max?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{label}</span>
          <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{description}</p>
        </div>
      </div>
      <div className="flex justify-between gap-1">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(num => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              value === num 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'bg-[var(--color-gray-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ReflectionForm({ subjects, onSubmit, onCancel }: ReflectionFormProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ReflectionFormData>({
    date: today,
    subjectId: undefined,
    hoursStudied: 2,
    sessionsCount: 1,
    avgSessionMinutes: 60,
    tasksCompleted: 1,
    studyConsistency: 5,
    concentrationLevel: 6,
    distractionsCount: 3,
    progressSatisfaction: 6,
    confidenceLevel: 6,
    motivationLevel: 7,
    selfAssessedMastery: 6,
    perceivedDifficulty: 5,
    notes: '',
  })

  const set = (key: keyof ReflectionFormData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
  }

  const Section = ({ title, icon, children }: { title: string; icon: ReactNode; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 space-y-4">
      <h3 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[85vh] overflow-y-auto pr-1">
      <div className="flex items-center justify-between sticky top-0 bg-[var(--color-white)] pb-2 z-10">
        <div>
          <h2 className="flex items-center gap-2 text-[var(--text-xl)] font-bold text-[var(--color-text)]">
            <ClipboardList className="h-6 w-6 text-[var(--color-primary)]" /> Réflexion personnelle
          </h2>
          <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">Évaluation de tes comportements contrôlables</p>
        </div>
      </div>

      {/* Header: Date + Subject */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Date de réflexion</label>
          <input
            type="date" value={form.date} max={today}
            onChange={e => set('date', e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Matière (optionnel)</label>
          <select
            value={form.subjectId ?? ''}
            onChange={e => set('subjectId', e.target.value || undefined)}
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">Général (toutes matières)</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Time Investment */}
      <Section title="Investissement Temps" icon={<Clock className="h-4 w-4" />}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[var(--text-xs)] text-[var(--color-text-secondary)] block mb-1">Heures étudiées</label>
            <input type="number" min={0} step={0.5} value={form.hoursStudied}
              onChange={e => set('hoursStudied', parseFloat(e.target.value))}
              className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] bg-[var(--color-white)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>
          <div>
            <label className="text-[var(--text-xs)] text-[var(--color-text-secondary)] block mb-1">Séances de travail</label>
            <input type="number" min={0} value={form.sessionsCount}
              onChange={e => set('sessionsCount', parseInt(e.target.value))}
              className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] bg-[var(--color-white)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>
          <div>
            <label className="text-[var(--text-xs)] text-[var(--color-text-secondary)] block mb-1">Durée moy. (min)</label>
            <input type="number" min={0} step={5} value={form.avgSessionMinutes}
              onChange={e => set('avgSessionMinutes', parseInt(e.target.value))}
              className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] bg-[var(--color-white)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>
        </div>
      </Section>

      {/* Productivity */}
      <Section title="Productivité" icon={<CheckCircle2 className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[var(--text-xs)] text-[var(--color-text-secondary)] block mb-1">Tâches complétées</label>
            <input type="number" min={0} value={form.tasksCompleted}
              onChange={e => set('tasksCompleted', parseInt(e.target.value))}
              className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] bg-[var(--color-white)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>
          <ScaleInput label="Régularité d'étude" description="Consistance dans tes séances (1–10)"
            value={form.studyConsistency} onChange={v => set('studyConsistency', v)} />
        </div>
      </Section>

      {/* Focus */}
      <Section title="Concentration & Focus" icon={<Target className="h-4 w-4" />}>
        <ScaleInput label="Niveau de concentration" description="Capacité à rester focalisé (1–10)"
          value={form.concentrationLevel} onChange={v => set('concentrationLevel', v)} />
        <div>
          <label className="text-[var(--text-xs)] text-[var(--color-text-secondary)] block mb-1">Nombre de distractions</label>
          <input type="number" min={0} value={form.distractionsCount}
            onChange={e => set('distractionsCount', parseInt(e.target.value))}
            className="w-32 rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] bg-[var(--color-white)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
        </div>
      </Section>

      {/* Satisfaction */}
      <Section title="Satisfaction & Motivation" icon={<Lightbulb className="h-4 w-4" />}>
        {REFLECTION_METRICS.filter(m => ['progressSatisfaction', 'confidenceLevel', 'motivationLevel'].includes(m.key)).map(m => (
          <ScaleInput key={m.key} label={m.label} description={m.description}
            value={form[m.key as keyof ReflectionFormData] as number}
            onChange={v => set(m.key as keyof ReflectionFormData, v)} />
        ))}
      </Section>

      {/* Understanding */}
      <Section title="Compréhension & Maîtrise" icon={<Brain className="h-4 w-4" />}>
        <ScaleInput label="Maîtrise auto-évaluée" description="Comment tu évalues ta maîtrise du sujet (1–10)"
          value={form.selfAssessedMastery} onChange={v => set('selfAssessedMastery', v)} />
        <ScaleInput label="Difficulté perçue" description="Difficulté ressentie du contenu (1 = facile, 10 = très difficile)"
          value={form.perceivedDifficulty} onChange={v => set('perceivedDifficulty', v)} />
      </Section>

      {/* Notes */}
      <div>
        <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Notes libres</label>
        <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)}
          rows={3} placeholder="Ce qui a bien fonctionné, ce qui doit s'améliorer..."
          className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] bg-[var(--color-white)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--text-sm)] text-[var(--color-text)] hover:bg-[var(--color-gray-bg)] transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-[var(--text-sm)] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
          {loading ? 'Enregistrement...' : 'Sauvegarder la réflexion'}
        </button>
      </div>
    </form>
  )
}
