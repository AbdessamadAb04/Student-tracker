import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { subjects, grades, tasks, mockGroups, mockGroupStudents } from '../data/mockData'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      <span className="w-36 flex-shrink-0 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span className="text-sm text-[var(--color-text)] font-medium">{value}</span>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-center">
      <div className="text-3xl font-bold text-[var(--color-text)]">{value}</div>
      <div className="mt-1 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{sub}</div>}
    </div>
  )
}

function RoleBadge({ role }: { role: 'student' | 'teacher' }) {
  return role === 'teacher' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Enseignant
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zm0-3a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
      Étudiant
    </span>
  )
}

// ─── Student profile ───────────────────────────────────────────────────────────

function StudentProfile({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const { isChapterCompleted } = useProgress()

  const displayName = user.user_metadata?.name ?? user.email ?? 'Étudiant'
  const initials = displayName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ET'

  // Chapter progress
  const subjectsWithCh = subjects.filter(s => s.chapters && s.chapters.length > 0)
  const allChapterIds = subjectsWithCh.flatMap(s => (s.chapters ?? []).map(ch => ch.id))
  const totalChaptersProfil = allChapterIds.length
  const completedChaptersProfil = allChapterIds.filter(id => isChapterCompleted(id)).length
  const lessonPct = totalChaptersProfil ? Math.round((completedChaptersProfil / totalChaptersProfil) * 100) : 0

  const subjectsDone = subjectsWithCh.filter(s => {
    const ids = (s.chapters ?? []).map(ch => ch.id)
    return ids.every(id => isChapterCompleted(id))
  }).length

  // Grade average (mock data for demo)
  const totalWeight = grades.reduce((s, g) => s + g.weight, 0)
  const weightedSum = grades.reduce((s, g) => s + g.value * g.weight, 0)
  const avgGrade = totalWeight ? +(weightedSum / totalWeight).toFixed(1) : 0

  // Task stats
  const completedTasks = tasks.filter(t => (t.status as string) === 'completed' || (t.status as string) === 'graded').length
  const pendingTasks = tasks.filter(t => (t.status as string) === 'pending' || (t.status as string) === 'in_progress').length

  // Group info — from auth user (Supabase) or mockGroupStudents (demo)
  const groupName = user.groupName
    ?? mockGroupStudents.find(gs => gs.studentId === 'EMSI-2024-0142')
      ? mockGroups.find(g => g.id === (user.groupId ?? 'g1'))?.name
      : undefined

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Demo'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold text-xl select-none" style={{ height: 72, width: 72 }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-[var(--color-text)] truncate">{displayName}</h1>
              <RoleBadge role="student" />
              {groupName && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {groupName}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-6 divide-y divide-[var(--color-border)]">
          <InfoRow label="Nom complet" value={displayName} />
          <InfoRow label="Email" value={user.email ?? '—'} />
          <InfoRow label="Rôle" value={<RoleBadge role="student" />} />
          {groupName && <InfoRow label="Groupe" value={groupName} />}
          <InfoRow label="Membre depuis" value={joinedDate} />
          <InfoRow
            label="Compte"
            value={
              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Actif
              </span>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Progression" value={`${lessonPct}%`} sub={`${completedChaptersProfil}/${totalChaptersProfil} chapitres`} />
        <StatCard label="Matières" value={subjectsDone} sub="terminées" />
        <StatCard label="Moyenne" value={`${avgGrade}/20`} sub={`${grades.length} notes`} />
        <StatCard label="Tâches" value={completedTasks} sub={`${pendingTasks} en cours`} />
      </div>

      {/* Read-only notice */}
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3">
        <svg className="h-4 w-4 text-[var(--color-text-secondary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Ces informations sont en lecture seule. Pour modifier vos données, contactez votre administrateur.
        </p>
      </div>
    </div>
  )
}

// ─── Teacher profile ───────────────────────────────────────────────────────────

function TeacherProfile({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const displayName = user.user_metadata?.name ?? user.email ?? 'Enseignant'
  const initials = displayName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'EN'

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Demo'

  const totalStudents = mockGroupStudents.length
  const totalGroups = mockGroups.length
  const assignedTasks = tasks.filter(t => (t as any).createdBy === 'teacher' || (t as any).created_by === 'teacher').length
  const totalGrades = grades.length

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex items-center gap-5">
          <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xl select-none" style={{ height: 72, width: 72 }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-[var(--color-text)] truncate">{displayName}</h1>
              <RoleBadge role="teacher" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-6 divide-y divide-[var(--color-border)]">
          <InfoRow label="Nom complet" value={displayName} />
          <InfoRow label="Email" value={user.email ?? '—'} />
          <InfoRow label="Rôle" value={<RoleBadge role="teacher" />} />
          <InfoRow label="Membre depuis" value={joinedDate} />
          <InfoRow
            label="Compte"
            value={
              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Actif
              </span>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Groupes" value={totalGroups} sub="classes" />
        <StatCard label="Étudiants" value={totalStudents} sub="inscrits" />
        <StatCard label="Devoirs" value={assignedTasks} sub="assignés" />
        <StatCard label="Notes" value={totalGrades} sub="saisies" />
      </div>

      {/* Assigned groups */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Groupes assignés</h2>
        <div className="space-y-2">
          {mockGroups.map(g => {
            const studentCount = mockGroupStudents.filter(gs => gs.groupId === g.id).length
            return (
              <div key={g.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {g.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text)] truncate">{g.name}</div>
                  {g.description && <div className="text-xs text-[var(--color-text-secondary)] truncate">{g.description}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-[var(--color-text)]">{studentCount}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">étudiants</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Read-only notice */}
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3">
        <svg className="h-4 w-4 text-[var(--color-text-secondary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Ces informations sont en lecture seule. Pour modifier vos données, contactez votre administrateur.
        </p>
      </div>
    </div>
  )
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function Profil() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)] text-sm">
        Vous devez être connecté pour accéder à votre profil.
      </div>
    )
  }

  return user.role === 'teacher'
    ? <TeacherProfile user={user} />
    : <StudentProfile user={user} />
}