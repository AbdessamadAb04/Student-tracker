import type { Database } from './database'

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

export interface Profile {
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
  completedLessons: string[]
  completedChapters?: string[]
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

export type SubjectRow = Database['public']['Tables']['subjects']['Row']

export interface Subject {
  id: string
  user_id: string
  name: string
  color: string
  type: SubjectType
  coefficient?: number
  teacher?: string
  is_active: boolean
  created_at: string
  chapters?: SubjectChapter[]
}

export type GradeRow = Database['public']['Tables']['grades']['Row']

export interface Grade {
  id: string
  studentId: string
  subject_id: string
  title: string
  value: number
  weight: number
  date: string
  teacher: string
  type: 'exam' | 'tp' | 'cc' | 'project' | 'quiz'
}

export type AbsenceRow = Database['public']['Tables']['absences']['Row']

export interface Absence {
  id: string
  studentId: string
  date: string
  duration: 'half' | 'full'
  reason?: string
  excused: boolean
  certificateProvided: boolean
  subject_id?: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'graded' | 'overdue'

export type TaskRow = Database['public']['Tables']['tasks']['Row']

export interface Task {
  id: string
  studentId: string
  title: string
  description: string
  dueDate: string
  subject_ids: string[]
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
  date: string
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