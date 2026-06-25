// ─── Existing Lesson / Module Types ─────────────────────────────────────────

export interface Lesson {
  id: string
  title: string
  duration: string
  content: string
}

export interface Chapter {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Module {
  id: string
  title: string
  description: string
  chapters: Chapter[]
  color: string
}

export interface UserProfile {
  name: string
  initials: string
  track: string
  startDate: string
  studentId: string
  year: string
  institution: string
  email: string
}

export interface ProgressState {
  completedLessons: string[]   // lesson ids
  completedChapters?: string[] // chapter ids
  lastSeenLesson: string | null
}

// ─── Academic Types ──────────────────────────────────────────────────────────

export type SubjectType = 'academic' | 'personal'

export interface ChapterResource {
  id: string
  name: string
  type: 'course' | 'exercise' | 'other'
  fileUrl: string
  uploadedAt: string
}

export interface SubjectChapter {
  id: string
  title: string
  content: string
  resources: ChapterResource[]
}

export interface Subject {
  id: string
  name: string
  color: string
  type: SubjectType
  coefficient?: number    // only for academic subjects
  teacher?: string        // only for academic subjects
  isActive?: boolean
  chapters?: SubjectChapter[]
}

export interface Grade {
  id: string
  studentId: string
  subjectId: string
  title: string           // "Examen Final", "TP1", "Contrôle continu"
  value: number           // 0–20
  weight: number          // coefficient
  date: string            // ISO date string
  teacher: string
  type: 'exam' | 'tp' | 'cc' | 'project' | 'quiz'
}

export interface Absence {
  id: string
  studentId: string
  date: string            // ISO date string
  duration: 'half' | 'full'
  reason?: string
  excused: boolean
  certificateProvided: boolean
  subjectId?: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'graded' | 'overdue'

export interface Task {
  id: string
  studentId: string
  title: string
  description: string
  dueDate: string         // ISO date string
  subjectId: string
  status: TaskStatus
  grade?: number
  submittedDate?: string
}

export interface TeacherFeedback {
  id: string
  studentId: string
  teacherName: string
  subjectId: string
  comment: string
  rating: 1 | 2 | 3 | 4 | 5
  date: string            // ISO date string
  isPositive: boolean
}

export interface AcademicStats {
  generalAverage: number
  averageBySubject: Record<string, number>
  absenceRate: number
  totalAbsenceDays: number
  tasksOnTime: number
  tasksOverdue: number
  taskCompletionRate: number
  highestGrade: number
  lowestGrade: number
}