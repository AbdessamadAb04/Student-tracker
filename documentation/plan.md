# Student Tracker — AI Copilot Master Plan
> Restructuration complète du frontend React · Supabase DB · Design system unifié
> Version 1.0 — Juin 2026

---

## Table des matières

1. [Diagnostic — Ce qui ne va pas](#1-diagnostic)
2. [Design System unifié](#2-design-system)
3. [Architecture des données — DB → Frontend mapping](#3-data-architecture)
4. [Restructuration des Services & Hooks](#4-services-hooks)
5. [Restructuration page par page](#5-pages)
6. [Composants partagés à reconstruire](#6-shared-components)
7. [Contexts — refactor](#7-contexts)
8. [Types — nettoyage & alignement DB](#8-types)
9. [Routing & guards](#9-routing)
10. [Ordre d'exécution recommandé](#10-execution-order)

---

## 1. Diagnostic

### 1.1 Problèmes de données

| Problème | Localisation | Impact |
|---|---|---|
| `mockData.ts` coexiste avec Supabase | `src/data/mockData.ts` | Pages lisent le mock au lieu de la DB |
| `ProgressContext` persiste en localStorage uniquement | `completedLessons`, `completedChapters` | Pas de table `progress` en DB — orphelin |
| `apprentissageData.ts` est un filtre redondant de `mockData` | `src/data/apprentissageData.ts` | Doublon inutile, source de confusion |
| Pas de service pour `grades`, `absences`, `tasks` | Manquant | Ces pages lisent directement le mock |
| `group_id` présent sur `tasks`, `grades`, `absences` mais jamais utilisé côté front | Partout | Logique teacher/group cassée |
| `profiles.role` n'est pas lu après login | `AuthContext` | Role-based routing ne fonctionne pas vraiment |

### 1.2 Problèmes UI / Design

| Problème | Symptôme |
|---|---|
| Pas de design token centralisé | Couleurs hardcodées en inline style et Tailwind en parallèle |
| Sidebar ne reflète pas le rôle (`teacher` voit les routes `student only`) | Pas de guard sur les liens nav |
| Pages utilisent des layouts différents | Padding, max-width, grid incohérents entre pages |
| Pas de loading state uniforme | Certaines pages flashent le contenu mock avant Supabase |
| Pas de empty state uniforme | Pages vides sans message ou CTA |
| Pas de toast / feedback système unifié | Certaines actions silencieuses |

### 1.3 Tables DB sans service frontend

| Table DB | Service existant | Action requise |
|---|---|---|
| `profiles` | ❌ Non | Créer `profileService.ts` |
| `subjects` | ✅ `subjectService.ts` | Aligner les types |
| `tasks` | ❌ Non | Créer `taskService.ts` |
| `subtasks` | ❌ Non | Créer `subtaskService.ts` |
| `grades` | ❌ Non | Créer `gradeService.ts` |
| `absences` | ❌ Non | Créer `absenceService.ts` |
| `study_sessions` | ✅ `studySessionService.ts` | OK — aligner types |
| `reflections` | ✅ `reflectionService.ts` | OK — aligner types |
| `groups` | ❌ Non | Créer `groupService.ts` |
| `group_students` | ❌ Non | Inclus dans `groupService` |
| `group_teachers` | ❌ Non | Inclus dans `groupService` |

---

## 2. Design System

### 2.1 Palette de couleurs — tokens

Créer `src/styles/tokens.ts` :

```ts
export const colors = {
  // Primaire — Teal académique
  primary: {
    50:  '#E1F5EE',
    100: '#9FE1CB',
    200: '#5DCAA5',
    400: '#1D9E75',
    600: '#0F6E56',
    800: '#085041',
    900: '#04342C',
  },
  // Secondaire — Violet doux
  purple: {
    50:  '#EEEDFE',
    100: '#CECBF6',
    400: '#7F77DD',
    600: '#534AB7',
    800: '#3C3489',
  },
  // Accent — Ambre pour warnings/grades moyens
  amber: {
    50:  '#FAEEDA',
    100: '#FAC775',
    400: '#BA7517',
    600: '#854F0B',
    800: '#633806',
  },
  // Danger
  red: {
    50:  '#FCEBEB',
    400: '#E24B4A',
    600: '#A32D2D',
    800: '#791F1F',
  },
  // Neutres
  gray: {
    50:  '#F8F8F6',
    100: '#F1EFE8',
    200: '#D3D1C7',
    400: '#888780',
    600: '#5F5E5A',
    800: '#2C2C2A',
    900: '#1A1A18',
  },
}

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
}

export const shadow = {
  card: '0 1px 3px rgba(0,0,0,0.06)',
  modal: '0 8px 32px rgba(0,0,0,0.12)',
}
```

### 2.2 Typography

```ts
// src/styles/typography.ts
export const typography = {
  display: "'DM Serif Display', serif",   // Titres de page h1
  body:    "'DM Sans', sans-serif",        // Tout le reste
  mono:    "'JetBrains Mono', monospace",  // Données chiffrées, notes
}

// Scale
// h1 — 28px / 500 / display font — une seule fois par page
// h2 — 18px / 500 / body
// h3 — 15px / 500 / body
// body — 14px / 400 / body / line-height 1.6
// caption — 12px / 400 / body / color gray-400
// data  — 13px / 500 / mono — notes, scores, heures
```

### 2.3 Layout system

```
AppShell
├── Sidebar (200px fixe, sticky)
└── MainArea
    ├── PageHeader (sticky top, 56px)
    └── PageContent (padding: 24px 32px, max-width: 1100px, margin: auto)
        ├── PageTitle (h1 + subtitle)
        ├── ActionBar (filtres + bouton primaire)
        └── ContentGrid
```

**Grilles autorisées :**
- `grid-cols-4` — KPI cards uniquement
- `grid-cols-3` — cards larges (subjects, modules)
- `grid-cols-2` — split 50/50 (chart + table)
- `grid-cols-1` — liste, table pleine largeur

**Règle d'or :** chaque page a exactement une zone "hero" — le chiffre ou graphique le plus important, présenté en premier avant tout le reste.

### 2.4 Composants atomiques — règles

| Composant | Variantes | Jamais |
|---|---|---|
| `Button` | `primary`, `secondary`, `ghost`, `danger` | Inline styles |
| `Badge` | `success`, `warning`, `danger`, `info`, `neutral` | Couleurs hardcodées |
| `Card` | `default`, `interactive` (hover border) | Shadows multiples |
| `Input` | `default`, `error` | Styles par page |
| `Skeleton` | `line`, `card`, `circle` | Flash de contenu vide |
| `EmptyState` | icon + title + description + CTA optionnel | Page blanche |
| `Toast` | `success`, `error`, `info` | `alert()` ou console |

---

## 3. Architecture des données — DB → Frontend mapping

### 3.1 Mapping complet table → page

```
profiles           → Profil.tsx (lecture + update name/institution/year/track)
subjects           → Modules.tsx (CRUD complet) + Dashboard (stats)
tasks              → TasksPage.tsx (CRUD) + Dashboard (KPI)
subtasks           → TasksPage.tsx (nested dans task card)
grades             → GradesPage.tsx (CRUD) + Dashboard (avg KPI)
absences           → AbsencesPage.tsx (CRUD) + Dashboard (KPI)
study_sessions     → ProgressTrackerPage.tsx (log + stats)
reflections        → ReflectionPage.tsx (CRUD)
groups             → Teacher mode sur GradesPage, AbsencesPage, TasksPage
group_students     → Teacher mode — sélecteur d'étudiants
group_teachers     → AuthContext — détermine les groupes accessibles
```

### 3.2 Flux de données par rôle

**Étudiant (`role = 'student'`) :**
```
Login → AuthContext charge profiles row
     → charge subjects (WHERE user_id = me)
     → charge tasks (WHERE user_id = me)
     → Dashboard agrège tout
```

**Enseignant (`role = 'teacher'`) :**
```
Login → AuthContext charge profiles row
     → charge group_teachers (WHERE teacher_id = me) → group_ids[]
     → charge group_students (WHERE group_id IN group_ids) → student_ids[]
     → GradesPage / AbsencesPage / TasksPage affichent sélecteur de groupe
     → données filtrées par group_id sélectionné
```

### 3.3 Règle sur mockData

```
RÈGLE : mockData.ts ne doit plus être importé dans aucune Page.
Il reste uniquement pour :
- Tests unitaires
- Storybook / démo sans Supabase
- Fallback localStorage si isConfigured = false (AuthContext)

Toute Page doit passer par un Hook.
Tout Hook doit passer par un Service.
Tout Service doit passer par supabase-js (ou localStorage si !isConfigured).
```

### 3.4 Schéma des relations frontend

```
AuthContext (user, role, profile)
    │
    ├── useSubjects()        → subjects[]
    │       ├── Modules.tsx
    │       ├── Dashboard.tsx (stats)
    │       └── AnalyticsPage.tsx
    │
    ├── useTasks()           → tasks[] + subtasks[]
    │       ├── TasksPage.tsx
    │       └── Dashboard.tsx (KPI)
    │
    ├── useGrades()          → grades[]
    │       ├── GradesPage.tsx
    │       └── Dashboard.tsx (moyenne)
    │
    ├── useAbsences()        → absences[]
    │       ├── AbsencesPage.tsx
    │       └── Dashboard.tsx (KPI)
    │
    ├── useStudySessions()   → sessions[] + stats
    │       └── ProgressTrackerPage.tsx
    │
    ├── useReflections()     → reflections[]
    │       └── ReflectionPage.tsx
    │
    └── useGroups()          → groups[] (teacher only)
            ├── GradesPage.tsx (teacher mode)
            ├── AbsencesPage.tsx (teacher mode)
            └── TasksPage.tsx (teacher mode)
```

---

## 4. Services & Hooks — Restructuration complète

### 4.1 Fichiers à créer

#### `src/services/profileService.ts`
```ts
// Fonctions :
getProfile(userId: string): Promise<Profile>
updateProfile(userId: string, data: Partial<ProfileUpdate>): Promise<Profile>

// Requêtes Supabase :
// SELECT * FROM profiles WHERE id = userId
// UPDATE profiles SET ... WHERE id = userId
```

#### `src/services/taskService.ts`
```ts
// Fonctions :
getTasks(userId: string): Promise<Task[]>
getTasksByGroup(groupId: string): Promise<Task[]>          // teacher
createTask(data: TaskInsert): Promise<Task>
updateTask(id: string, data: TaskUpdate): Promise<Task>
deleteTask(id: string): Promise<void>
updateTaskStatus(id: string, status: string): Promise<Task>

// Règle : jointure avec subtasks sur getTasks
// SELECT tasks.*, subtasks.* FROM tasks
//   LEFT JOIN subtasks ON subtasks.task_id = tasks.id
//   WHERE tasks.user_id = userId
```

#### `src/services/subtaskService.ts`
```ts
createSubtask(data: SubtaskInsert): Promise<Subtask>
updateSubtask(id: string, data: SubtaskUpdate): Promise<Subtask>
deleteSubtask(id: string): Promise<void>
updateSubtaskStatus(id: string, status: SubtaskStatus): Promise<Subtask>
```

#### `src/services/gradeService.ts`
```ts
getGrades(userId: string): Promise<Grade[]>
getGradesByGroup(groupId: string): Promise<Grade[]>        // teacher
createGrade(data: GradeInsert): Promise<Grade>
updateGrade(id: string, data: GradeUpdate): Promise<Grade>
deleteGrade(id: string): Promise<void>

// Calcul côté front (pas en DB) :
computeAverage(grades: Grade[], subjectId?: string): number
computeWeightedAverage(grades: Grade[]): number
```

#### `src/services/absenceService.ts`
```ts
getAbsences(userId: string): Promise<Absence[]>
getAbsencesByGroup(groupId: string): Promise<Absence[]>    // teacher
createAbsence(data: AbsenceInsert): Promise<Absence>
updateAbsence(id: string, data: AbsenceUpdate): Promise<Absence>
deleteAbsence(id: string): Promise<void>

// Statistiques calculées côté front :
computeAbsenceStats(absences: Absence[]): {
  total: number
  excused: number
  unexcused: number
  halfDays: number
  fullDays: number
}
```

#### `src/services/groupService.ts`
```ts
getTeacherGroups(teacherId: string): Promise<Group[]>
getGroupStudents(groupId: string): Promise<Profile[]>
createGroup(name: string, description?: string): Promise<Group>
addStudentToGroup(groupId: string, studentId: string): Promise<void>
removeStudentFromGroup(groupId: string, studentId: string): Promise<void>
```

### 4.2 Hooks à créer

#### `src/hooks/useTasks.ts`
```ts
interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  create: (data: TaskFormData) => Promise<void>
  update: (id: string, data: Partial<TaskFormData>) => Promise<void>
  remove: (id: string) => Promise<void>
  updateStatus: (id: string, status: string) => Promise<void>
  reload: () => Promise<void>
  // Computed
  stats: {
    pending: number
    inProgress: number
    completed: number
    overdue: number
  }
}
// Source : taskService.ts → Supabase | localStorage fallback
```

#### `src/hooks/useGrades.ts`
```ts
interface UseGradesReturn {
  grades: Grade[]
  loading: boolean
  error: string | null
  create: (data: GradeFormData) => Promise<void>
  update: (id: string, data: Partial<GradeFormData>) => Promise<void>
  remove: (id: string) => Promise<void>
  reload: () => Promise<void>
  // Computed
  averageBySubject: Record<string, number>
  globalAverage: number
  trend: { date: string; avg: number }[]
}
```

#### `src/hooks/useAbsences.ts`
```ts
interface UseAbsencesReturn {
  absences: Absence[]
  loading: boolean
  error: string | null
  create: (data: AbsenceFormData) => Promise<void>
  update: (id: string, data: Partial<AbsenceFormData>) => Promise<void>
  remove: (id: string) => Promise<void>
  reload: () => Promise<void>
  // Computed
  stats: AbsenceStats
  byMonth: { month: string; count: number }[]
  bySubject: { subjectId: string; count: number }[]
}
```

#### `src/hooks/useGroups.ts` (teacher only)
```ts
interface UseGroupsReturn {
  groups: Group[]
  selectedGroup: Group | null
  groupStudents: Profile[]
  loading: boolean
  selectGroup: (groupId: string) => void
  reload: () => Promise<void>
}
// Ce hook ne charge que si profile.role === 'teacher'
```

### 4.3 Services existants — corrections

#### `subjectService.ts` — aligner les types
```ts
// AVANT (mauvais) :
type Subject = { id: string; title: string; color: string; chapters: Chapter[] }

// APRÈS — aligner avec DB :
type Subject = {
  id: string
  user_id: string
  name: string          // DB: name, pas title
  color: string
  type: 'academic' | 'personal'
  coefficient: number | null
  teacher: string | null
  is_active: boolean
  created_at: string
  // Jointure client-side :
  chapters?: SubjectChapter[]
}

// ATTENTION : la table subjects n'a PAS de colonne chapters.
// Les chapitres sont dans src/types/index.ts uniquement.
// → DÉCISION : créer une table chapters en DB, ou garder localStorage pour chapters
// → RECOMMANDATION : garder localStorage pour chapters (scope soutenance)
//   et documenter comme "dette technique à migrer"
```

---

## 5. Pages — Restructuration page par page

### 5.1 `Dashboard.tsx`

**État actuel :** lit depuis mockData + quelques hooks. Layout incohérent.

**Restructuration :**

```
Dashboard
├── PageHeader ("Bonjour {name}" + date)
├── KPIGrid (4 cartes)
│   ├── KPICard — Moyenne générale (source: useGrades → globalAverage)
│   ├── KPICard — Absences totales (source: useAbsences → stats.total)
│   ├── KPICard — Tâches en retard (source: useTasks → stats.overdue)
│   └── KPICard — Heures d'étude (source: useStudySessions → stats.totalHours)
├── SectionRow (2 colonnes)
│   ├── RecentGradesCard (5 dernières notes, trend sparkline)
│   └── TaskStatusCard (pie chart pending/inProgress/done)
├── SectionRow (2 colonnes)
│   ├── SubjectProgressCard (barres par matière, source: subjects + grades)
│   └── RecentActivityCard (dernières actions timeline)
└── ResumeCard (dernière leçon vue, si ProgressContext.lastSeenLesson)
```

**Données requises :**
```ts
// Tous ces hooks appelés en parallèle dans Dashboard :
const { grades, globalAverage } = useGrades()
const { stats: absenceStats } = useAbsences()
const { stats: taskStats } = useTasks()
const { stats: sessionStats } = useStudySessions()
const { subjects } = useSubjects()
// PAS d'import depuis mockData
```

**Règle critique :** si un hook est en `loading`, afficher `<SkeletonCard />` à la place. Jamais de flash de contenu mock.

---

### 5.2 `Modules.tsx` (Apprentissage)

**État actuel :** lit depuis `apprentissageData.ts` + mockData. ProgressContext en localStorage.

**Restructuration :**

```
Modules
├── PageHeader ("Mes matières")
├── SubjectGrid (source: useSubjects)
│   └── SubjectCard (name, color, progress bar, chapter count)
│       └── onClick → drill-down ChapterView
├── ChapterView (quand subject sélectionné)
│   ├── BreadcrumbBar (Matières > {subject.name})
│   ├── ChapterList
│   │   └── ChapterRow (title, toggle complete, resource list)
│   │       └── ResourceItem (PDF/image/lien)
│   └── AddChapterForm (inline, si student)
└── SubjectFormModal (créer/éditer une matière)
```

**Données requises :**
```ts
const { subjects, create, update, remove } = useSubjects()
const { isCompleted, completeLesson } = useProgress()  // localStorage — OK pour soutenance

// ATTENTION : chapters ne sont pas en DB.
// Ils sont stockés dans localStorage sous la clé :
// `chapters_${subjectId}` → SubjectChapter[]
// Créer un hook useChapters(subjectId) qui wrap localStorage
```

**Hook `useChapters` à créer :**
```ts
// src/hooks/useChapters.ts
function useChapters(subjectId: string) {
  const [chapters, setChapters] = useState<SubjectChapter[]>(() => {
    const raw = localStorage.getItem(`chapters_${subjectId}`)
    return raw ? JSON.parse(raw) : []
  })

  const save = (updated: SubjectChapter[]) => {
    setChapters(updated)
    localStorage.setItem(`chapters_${subjectId}`, JSON.stringify(updated))
  }

  const addChapter = (title: string) => {
    save([...chapters, { id: crypto.randomUUID(), title, lessons: [] }])
  }

  const removeChapter = (id: string) => {
    save(chapters.filter(c => c.id !== id))
  }

  return { chapters, addChapter, removeChapter, save }
}
```

---

### 5.3 `GradesPage.tsx`

**État actuel :** lit depuis mockData. Pas de service grades.

**Restructuration :**

```
GradesPage
├── PageHeader ("Mes notes")
├── [Teacher only] GroupSelector (dropdown groupes → charge étudiants)
├── [Teacher only] StudentSelector (liste étudiants du groupe)
├── KPIRow
│   ├── KPICard — Moyenne générale
│   ├── KPICard — Meilleure matière
│   └── KPICard — Matière à améliorer (score le plus bas)
├── GradesTrendChart (LineChart par matière, source: useGrades → trend)
├── SubjectAveragesGrid (une card par matière avec moyenne + coefficient)
├── GradesTable
│   ├── Colonnes: Matière | Type | Titre | Note | Date | Enseignant
│   ├── Tri par date (défaut), matière, note
│   └── Actions: Éditer (student own) | Supprimer (student own)
└── [Teacher only] AddGradeForm (modal)
```

**Données requises :**
```ts
// Student :
const { grades, averageBySubject, globalAverage, trend, create, remove } = useGrades()
const { subjects } = useSubjects()

// Teacher :
const { groups, selectedGroup, groupStudents, selectGroup } = useGroups()
// puis charger grades du student sélectionné via gradeService.getGradesByGroup(selectedGroup.id)
```

**Logique teacher mode :**
```ts
// Dans GradesPage :
const { profile } = useAuth()
const isTeacher = profile?.role === 'teacher'

// Si isTeacher : afficher GroupSelector en haut
// Si !isTeacher : afficher uniquement ses propres notes
```

---

### 5.4 `AbsencesPage.tsx`

**État actuel :** lit depuis mockData. Pas de service absences.

**Restructuration :**

```
AbsencesPage
├── PageHeader ("Mes absences")
├── [Teacher only] GroupSelector
├── AbsenceStatsRow (4 KPIs)
│   ├── Total absences
│   ├── Absences justifiées
│   ├── Absences injustifiées
│   └── Demi-journées
├── AbsenceBarChart (par mois, source: useAbsences → byMonth)
├── AbsenceBySubjectChart (horizontal bar, source: bySubject)
└── AbsenceHistoryTable
    ├── Colonnes: Date | Matière | Durée | Raison | Justifiée
    └── [Teacher only] Actions: Valider justificatif | Supprimer
```

**Données requises :**
```ts
const { absences, stats, byMonth, bySubject, create, update, remove } = useAbsences()
const { subjects } = useSubjects()  // pour résoudre subject_id → name
```

---

### 5.5 `TasksPage.tsx`

**État actuel :** lit depuis mockData. Pas de service tasks. Types dans task.ts partiellement alignés.

**Restructuration :**

```
TasksPage
├── PageHeader ("Mes tâches")
├── [Teacher only] GroupSelector + mode "Assigner une tâche"
├── KPIRow (pending | inProgress | done | overdue)
├── FilterBar
│   ├── SearchInput
│   ├── StatusFilter (all | pending | in_progress | completed)
│   ├── PriorityFilter (all | low | medium | high)
│   └── SubjectFilter (dropdown matières)
├── TaskColumns (Kanban simplifié) OU TaskList (toggle vue)
│   └── TaskCard
│       ├── Title, priority badge, due date, subject tag
│       ├── SubtaskList (collapsible)
│       │   └── SubtaskRow (checkbox + title)
│       └── Actions: Éditer | Marquer complété | Supprimer
└── TaskCreationModal (réutiliser TaskCreationForm existant)
```

**Données requises :**
```ts
const { tasks, stats, loading, create, update, remove, updateStatus } = useTasks()
const { subjects } = useSubjects()  // pour subject_ids → noms
```

**Alignement type `Task` avec DB :**
```ts
// DB: subject_ids est ARRAY (uuid[])
// Front: doit afficher les noms des matières
// Solution :
const taskWithSubjectNames = tasks.map(task => ({
  ...task,
  subjects: task.subject_ids
    .map(id => subjects.find(s => s.id === id))
    .filter(Boolean)
}))
```

---

### 5.6 `AnalyticsPage.tsx`

**État actuel :** mélange mockData + hooks partiels. KPI "Apprentissage" peu clair.

**Restructuration :**

```
AnalyticsPage
├── PageHeader ("Analytics")
├── PeriodSelector (7j | 30j | 90j | cette année)
├── KPIRow (5 cartes)
│   ├── Moyenne générale
│   ├── Heures d'étude totales
│   ├── Taux de complétion chapitres
│   ├── Taux de réussite tâches
│   └── Score auto-évaluation moyen (reflections)
├── Row 2 colonnes
│   ├── RadarChart (axes: notes | présence | tâches | étude | réflexion)
│   └── GradeTrendLine (par matière, période sélectionnée)
├── SubjectBreakdownTable
│   └── Par matière: moyenne | nb absences | tâches | heures étude | %chapitres
└── InsightsPanel
    └── 3-4 bullets auto-générés depuis les données
        ex: "Tu étudies 40% plus le weekend"
        ex: "Ta moyenne en Maths a baissé de 2 pts ce mois"
```

**Données requises :**
```ts
const { grades, averageBySubject, globalAverage, trend } = useGrades()
const { stats: sessionStats } = useStudySessions()
const { stats: taskStats } = useTasks()
const { stats: absenceStats } = useAbsences()
const { reflections } = useReflections()
const { subjects } = useSubjects()
// Toutes les données filtrées par la période sélectionnée
```

---

### 5.7 `ProgressTrackerPage.tsx`

**État actuel :** partiellement branché sur studySessionService.

**Restructuration :**

```
ProgressTrackerPage
├── PageHeader ("Suivi du temps d'étude")
├── WeeklyGoalCard (objectif heures/semaine + progress bar)
├── StudyHoursBarChart (heures par matière, 7 derniers jours)
├── SessionHistoryTable
│   ├── Colonnes: Date | Matière | Durée | Qualité | Notes
│   └── Actions: Supprimer
├── LogSessionModal (bouton flottant "+" )
│   ├── SubjectSelector (source: useSubjects)
│   ├── TaskSelector optionnel (source: useTasks)
│   ├── StartTime / EndTime ou Duration
│   ├── QualityRating (1-5 étoiles)
│   └── Notes textarea
└── StatsRow
    ├── Total ce mois
    ├── Matière la plus étudiée
    └── Session la plus longue
```

**Données requises :**
```ts
const { sessions, stats, loading, log, remove } = useStudySessions()
const { subjects } = useSubjects()
const { tasks } = useTasks()  // pour lier session à une tâche
```

---

### 5.8 `ReflectionPage.tsx`

**État actuel :** partiellement branché sur reflectionService.

**Restructuration :**

```
ReflectionPage
├── PageHeader ("Mes réflexions")
├── LastReflectionSummary (dernière entrée, date + scores clés)
├── RadarChart (moyenne sur 8 métriques des 30 derniers jours)
├── MetricTrendLines (sparklines pour chaque métrique)
├── ReflectionHistory (liste accordéon, date + résumé)
└── NewReflectionButton → ReflectionModal
    └── ReflectionForm (existant — garder, juste retyper)
```

**Données requises :**
```ts
const { reflections, loading, create, remove, getTrend } = useReflections()
// getTrend(metric, days) → { date: string; value: number }[]
```

---

### 5.9 `FeedbackPage.tsx`

**État actuel :** lit uniquement depuis mockData `feedbacks[]`. Pas de table en DB.

**DÉCISION :** `feedbacks` n'existe pas dans la DB fournie.

```
OPTIONS :
A) Supprimer la page pour la soutenance (scope réduit)
B) Garder avec mockData explicitement marqué comme "demo data"
C) Utiliser la table reflections comme proxy "auto-feedback"

→ RECOMMANDATION pour soutenance : Option B
   Ajouter un banner "Mode démonstration — données fictives"
   et documenter comme feature post-MVP
```

---

### 5.10 `Profil.tsx`

**État actuel :** lit depuis mockData.profile. Pas de mise à jour Supabase.

**Restructuration :**

```
Profil
├── PageHeader ("Mon profil")
├── ProfileCard
│   ├── Avatar (initiales) + Name + role badge
│   ├── institution, year, track
│   └── EditButton → ProfileEditModal
├── StatsGrid (4 cartes)
│   ├── Moyenne générale
│   ├── Matières actives
│   ├── Tâches complétées
│   └── Heures d'étude
├── BadgesSection (badges débloqués — depuis ProgressContext)
└── AccountSection
    ├── Email (readonly, depuis auth.users)
    └── SignOut button
```

**Données requises :**
```ts
const { profile, updateProfile } = useProfile()  // nouveau hook
const { user } = useAuth()
const { globalAverage } = useGrades()
const { stats: taskStats } = useTasks()
const { stats: sessionStats } = useStudySessions()
```

**`useProfile` hook à créer :**
```ts
// src/hooks/useProfile.ts
function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    profileService.getProfile(user.id).then(p => {
      setProfile(p)
      setLoading(false)
    })
  }, [user?.id])

  const updateProfile = async (data: Partial<ProfileUpdate>) => {
    if (!user) return
    const updated = await profileService.updateProfile(user.id, data)
    setProfile(updated)
  }

  return { profile, loading, updateProfile }
}
```

---

## 6. Composants partagés — Reconstruire

### 6.1 `Sidebar.tsx` — refactor

**Problèmes actuels :**
- Affiche tous les liens peu importe le rôle
- Pas de lien actif visuel cohérent
- Pas de section pour les routes teacher

**Restructuration :**
```tsx
// src/components/shared/Sidebar.tsx

const STUDENT_LINKS = [
  { to: '/',           label: 'Dashboard',    icon: 'ti-home' },
  { to: '/modules',    label: 'Apprentissage', icon: 'ti-book' },
  { to: '/notes',      label: 'Notes',        icon: 'ti-chart-bar' },
  { to: '/absences',   label: 'Absences',     icon: 'ti-calendar-off' },
  { to: '/taches',     label: 'Tâches',       icon: 'ti-checklist' },
  { to: '/progression',label: 'Temps d\'étude',icon: 'ti-clock' },
  { to: '/reflexion',  label: 'Réflexion',    icon: 'ti-mood-smile' },
  { to: '/analytics',  label: 'Analytics',    icon: 'ti-trending-up' },
]

const TEACHER_LINKS = [
  { to: '/',          label: 'Dashboard',  icon: 'ti-home' },
  { to: '/notes',     label: 'Notes',      icon: 'ti-chart-bar' },
  { to: '/absences',  label: 'Absences',   icon: 'ti-calendar-off' },
  { to: '/taches',    label: 'Tâches',     icon: 'ti-checklist' },
]

// Sidebar affiche STUDENT_LINKS ou TEACHER_LINKS selon profile.role
// NavLink className basé sur isActive uniquement, jamais inline style
```

### 6.2 `Toast.tsx` — créer

```tsx
// src/components/shared/Toast.tsx
// Context + hook pattern

// Usage dans n'importe quelle page :
const { toast } = useToast()
toast.success('Note ajoutée avec succès')
toast.error('Erreur lors de la suppression')
toast.info('Synchronisation en cours...')

// Implémentation :
// ToastProvider wrappé dans App.tsx autour de tout
// useToast() retourne { success, error, info }
// Affiche max 3 toasts en bas à droite
// Disparaît après 3s
```

### 6.3 `PageHeader.tsx` — créer

```tsx
// src/components/shared/PageHeader.tsx
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
    icon?: string
  }
}

// Rendu :
// <div sticky top-0 bg-white border-b>
//   <h1>{title}</h1>
//   <p>{subtitle}</p>
//   {action && <Button onClick={action.onClick}>{action.label}</Button>}
// </div>

// Toutes les pages utilisent ce composant — jamais de h1 inline
```

### 6.4 `DataTable.tsx` — créer

```tsx
// src/components/shared/DataTable.tsx
// Tableau générique avec :
// - Colonnes configurables
// - Tri par colonne (click header)
// - Loading state (skeleton rows)
// - Empty state slot
// - Actions par ligne (dropdown)

// Utilisé par : GradesPage, AbsencesPage, TasksPage, ProgressTrackerPage
```

### 6.5 `KPICard.tsx` — remplacer StatCard

```tsx
// src/components/shared/KPICard.tsx
interface KPICardProps {
  label: string
  value: string | number
  delta?: { value: string; direction: 'up' | 'down' | 'neutral' }
  icon?: string
  color?: 'default' | 'success' | 'warning' | 'danger'
  loading?: boolean   // affiche skeleton si true
}
// Remplace StatCard.tsx — supprimer StatCard après migration
```

### 6.6 `EmptyState.tsx` — créer

```tsx
// src/components/shared/EmptyState.tsx
interface EmptyStateProps {
  icon: string          // Tabler icon name
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

// Exemples d'usage :
// GradesPage sans notes : icon=ti-chart-bar title="Aucune note" action="Ajouter une note"
// TasksPage sans tâches : icon=ti-checklist title="Aucune tâche" action="Créer une tâche"
```

---

## 7. Contexts — Refactor

### 7.1 `AuthContext.tsx`

**Problèmes actuels :**
- `profile` n'est pas chargé depuis `profiles` table après login
- `isConfigured` ne bloque pas les services si Supabase non configuré

**Corrections :**
```ts
// Après signIn réussi :
// 1. Récupérer user depuis supabase.auth.getUser()
// 2. Charger le profil : await profileService.getProfile(user.id)
// 3. Stocker profile dans le context (inclut role)

// AuthContext doit exposer :
interface AuthContextType {
  user: User | null
  profile: Profile | null     // ← AJOUTER
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signUp: (email, password, profileData) => Promise<void>
  signIn: (email, password) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>  // ← AJOUTER (pour Profil.tsx)
}
```

### 7.2 `ProgressContext.tsx`

**État actuel :** gère `completedLessons` et `completedChapters` en localStorage.

**Décision :** conserver en localStorage pour la soutenance, documenter comme dette technique.

**Corrections mineures :**
```ts
// Ajouter une fonction reset() pour les tests
// Ajouter completionPercentage(subjectId) → number
// S'assurer que lastSeenLesson stocke aussi le subjectId pour le breadcrumb
```

---

## 8. Types — Nettoyage & alignement DB

### 8.1 `src/types/database.ts` — source de vérité

Ce fichier est le miroir exact de la DB. **Ne jamais modifier manuellement** — générer depuis Supabase CLI :
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### 8.2 `src/types/index.ts` — types applicatifs

Règle : les types applicatifs **étendent** les types DB, ils ne les remplacent pas.

```ts
// AVANT (mauvais) :
type Subject = { id: string; title: string; chapters: Chapter[] }

// APRÈS (correct) :
import type { Database } from './database'
type SubjectRow = Database['public']['Tables']['subjects']['Row']

// Type applicatif = DB row + jointures front-end
type Subject = SubjectRow & {
  chapters?: SubjectChapter[]  // Pas en DB, géré localStorage
}

// Même pattern pour Task :
type TaskRow = Database['public']['Tables']['tasks']['Row']
type Task = TaskRow & {
  subtasks?: Subtask[]         // Chargé par jointure
  subjectNames?: string[]      // Résolu depuis subjects[]
}
```

### 8.3 Renommages critiques

| Ancien nom | Nouveau nom | Raison |
|---|---|---|
| `Subject.title` | `Subject.name` | Aligner avec colonne DB `name` |
| `Grade.subject` | `Grade.subject_id` | Aligner avec FK DB |
| `Absence.subjectId` | `Absence.subject_id` | Snake_case cohérent avec DB |
| `Task.subjectIds` | `Task.subject_ids` | Aligner avec colonne DB `subject_ids` |
| `UserProfile` | `Profile` | Aligner avec table DB `profiles` |

---

## 9. Routing & Guards

### 9.1 Guards par rôle

```tsx
// src/components/auth/RoleGuard.tsx
interface RoleGuardProps {
  allowedRoles: ('student' | 'teacher')[]
  children: ReactNode
  fallback?: ReactNode  // par défaut : redirect vers /
}

// Usage dans App.tsx :
<Route path="/modules" element={
  <RoleGuard allowedRoles={['student']}>
    <Modules />
  </RoleGuard>
} />

<Route path="/analytics" element={
  <RoleGuard allowedRoles={['student']}>
    <AnalyticsPage />
  </RoleGuard>
} />
```

### 9.2 Routes finales

```tsx
// App.tsx — routes complètes avec guards

// Public
<Route path="/login" element={<AuthForm />} />

// Protégé — tous rôles
<Route element={<ProtectedLayout />}>
  <Route path="/"          element={<Dashboard />} />
  <Route path="/notes"     element={<GradesPage />} />
  <Route path="/absences"  element={<AbsencesPage />} />
  <Route path="/taches"    element={<TasksPage />} />
  <Route path="/profil"    element={<Profil />} />

  // Student only
  <Route path="/modules"    element={<RoleGuard allowedRoles={['student']}><Modules /></RoleGuard>} />
  <Route path="/avis"       element={<RoleGuard allowedRoles={['student']}><FeedbackPage /></RoleGuard>} />
  <Route path="/analytics"  element={<RoleGuard allowedRoles={['student']}><AnalyticsPage /></RoleGuard>} />
  <Route path="/progression"element={<RoleGuard allowedRoles={['student']}><ProgressTrackerPage /></RoleGuard>} />
  <Route path="/reflexion"  element={<RoleGuard allowedRoles={['student']}><ReflectionPage /></RoleGuard>} />
</Route>

// 404
<Route path="*" element={<NotFoundPage />} />
```

### 9.3 `ProtectedLayout.tsx` — corrections

```tsx
// Doit vérifier :
// 1. session existe → sinon redirect /login
// 2. profile chargé → sinon spinner global (pas flash)
// 3. Wrapper AppShell (Sidebar + header + main)

// AJOUTER : écouter supabase.auth.onAuthStateChange
// pour détecter session expirée et redirect /login automatiquement
```

---

## 10. Ordre d'exécution recommandé

### Phase 1 — Fondations (Jours 1-2)

```
[ ] 1. Générer src/types/database.ts depuis Supabase CLI
[ ] 2. Mettre à jour src/types/index.ts — renommages critiques (section 8.3)
[ ] 3. Créer src/styles/tokens.ts — palette et typographie
[ ] 4. Corriger AuthContext — charger profile après login
[ ] 5. Créer profileService.ts + useProfile hook
[ ] 6. Créer composants shared : PageHeader, KPICard, EmptyState, Toast
```

### Phase 2 — Services manquants (Jours 3-4)

```
[ ] 7.  Créer gradeService.ts
[ ] 8.  Créer useGrades hook
[ ] 9.  Créer absenceService.ts
[ ] 10. Créer useAbsences hook
[ ] 11. Créer taskService.ts + subtaskService.ts
[ ] 12. Créer useTasks hook
[ ] 13. Créer groupService.ts + useGroups hook
```

### Phase 3 — Pages (Jours 5-7)

```
[ ] 14. Refactor Dashboard — brancher tous les hooks, supprimer mockData
[ ] 15. Refactor GradesPage — useGrades + teacher mode
[ ] 16. Refactor AbsencesPage — useAbsences + teacher mode
[ ] 17. Refactor TasksPage — useTasks + useSubjects pour résoudre subject_ids
[ ] 18. Refactor Profil — useProfile + stats agrégées
[ ] 19. Vérifier Modules — useSubjects + useChapters localStorage
[ ] 20. Vérifier ProgressTrackerPage — useStudySessions + useSubjects
[ ] 21. Vérifier ReflectionPage — useReflections
[ ] 22. Vérifier AnalyticsPage — tous les hooks + period filter
```

### Phase 4 — Polish UI (Jours 8-9)

```
[ ] 23. Implémenter Sidebar role-based (STUDENT_LINKS / TEACHER_LINKS)
[ ] 24. Ajouter RoleGuard sur toutes les routes student-only
[ ] 25. Ajouter DataTable générique — migrer GradesPage + AbsencesPage
[ ] 26. Ajouter loading skeletons sur toutes les pages
[ ] 27. Ajouter empty states sur toutes les pages
[ ] 28. Tester le flow complet : login → dashboard → notes → tâches → profil
[ ] 29. Tester le teacher mode : login teacher → notes groupe → absences groupe
[ ] 30. Déploiement Vercel + variables d'environnement Supabase
```

---

## Annexe — Checklist anti-chaos

### Avant de toucher une page, vérifier :

- [ ] Est-ce que cette page importe depuis `mockData.ts` ? → Remplacer par le hook correspondant
- [ ] Est-ce que le hook correspondant existe ? → Sinon, créer service + hook d'abord
- [ ] Est-ce que les types utilisés matchent la DB (`name` pas `title`, snake_case) ?
- [ ] Est-ce que la page a un `loading` state avec skeleton ?
- [ ] Est-ce que la page a un `empty` state avec CTA ?
- [ ] Est-ce que les actions (create/update/delete) affichent un toast ?
- [ ] Est-ce que le layout utilise `<PageHeader>` et la grille définie en section 2.3 ?

### Structure de fichier pour chaque nouvelle page :

```tsx
// Template standard pour toute Page
export default function PageName() {
  // 1. Auth context
  const { profile } = useAuth()

  // 2. Hooks de données
  const { data, loading, error, create, update, remove } = useData()

  // 3. State local UI
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selected, setSelected] = useState<Item | null>(null)

  // 4. Toast
  const { toast } = useToast()

  // 5. Handlers
  const handleCreate = async (formData) => {
    try {
      await create(formData)
      toast.success('Créé avec succès')
      setIsModalOpen(false)
    } catch {
      toast.error('Une erreur est survenue')
    }
  }

  // 6. Render
  if (loading) return <PageSkeleton />

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Titre de la page"
        subtitle="Sous-titre optionnel"
        action={{ label: 'Ajouter', onClick: () => setIsModalOpen(true) }}
      />
      {data.length === 0
        ? <EmptyState ... />
        : <ContentHere />
      }
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
```

---

*Plan généré pour le projet Student Tracker — EMSI Casablanca · Juin 2026*
*À utiliser comme prompt système ou contexte pour un agent de refactoring*