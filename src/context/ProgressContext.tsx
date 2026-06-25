import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { ProgressState } from '../types'

interface ProgressContextType {
  progress: ProgressState
  completeLesson: (lessonId: string) => void
  uncompleteLesson: (lessonId: string) => void
  isCompleted: (lessonId: string) => boolean
  setLastSeen: (lessonId: string) => void
  completeChapter: (chapterId: string) => void
  uncompleteChapter: (chapterId: string) => void
  isChapterCompleted: (chapterId: string) => boolean
}

const ProgressContext = createContext<ProgressContextType | null>(null)

const STORAGE_KEY = 'student-tracker-progress'

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : {}
    return {
      completedLessons: parsed.completedLessons ?? [],
      completedChapters: parsed.completedChapters ?? [],
      lastSeenLesson: parsed.lastSeenLesson ?? null,
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const completeLesson = (id: string) => {
    setProgress(p => ({
      ...p,
      completedLessons: p.completedLessons.includes(id) ? p.completedLessons : [...p.completedLessons, id],
      lastSeenLesson: id
    }))
  }

  const uncompleteLesson = (id: string) => {
    setProgress(p => ({ ...p, completedLessons: p.completedLessons.filter(l => l !== id) }))
  }

  const isCompleted = (id: string) => progress.completedLessons.includes(id)

  const setLastSeen = (id: string) => {
    setProgress(p => ({ ...p, lastSeenLesson: id }))
  }

  const completeChapter = (id: string) => {
    setProgress(p => ({
      ...p,
      completedChapters: p.completedChapters?.includes(id) ? p.completedChapters : [...(p.completedChapters ?? []), id],
    }))
  }

  const uncompleteChapter = (id: string) => {
    setProgress(p => ({ ...p, completedChapters: (p.completedChapters ?? []).filter(c => c !== id) }))
  }

  const isChapterCompleted = (id: string) => progress.completedChapters?.includes(id) ?? false

  return (
    <ProgressContext.Provider value={{ progress, completeLesson, uncompleteLesson, isCompleted, setLastSeen, completeChapter, uncompleteChapter, isChapterCompleted }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}