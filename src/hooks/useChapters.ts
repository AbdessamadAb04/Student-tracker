import { useState, useCallback } from 'react'
import type { SubjectChapter } from '../types'

export function useChapters(subjectId: string) {
  const [chapters, setChapters] = useState<SubjectChapter[]>(() => {
    const raw = localStorage.getItem(`chapters_${subjectId}`)
    return raw ? JSON.parse(raw) : []
  })

  const save = useCallback((updated: SubjectChapter[]) => {
    setChapters(updated)
    localStorage.setItem(`chapters_${subjectId}`, JSON.stringify(updated))
  }, [subjectId])

  const addChapter = useCallback((title: string, content?: string) => {
    const chapter: SubjectChapter = {
      id: crypto.randomUUID(),
      title,
      content: content ?? '',
      resources: [],
    }
    save([...chapters, chapter])
  }, [chapters, save])

  const updateChapter = useCallback((id: string, data: Partial<SubjectChapter>) => {
    save(chapters.map(c => c.id === id ? { ...c, ...data } : c))
  }, [chapters, save])

  const removeChapter = useCallback((id: string) => {
    save(chapters.filter(c => c.id !== id))
  }, [chapters, save])

  return { chapters, addChapter, updateChapter, removeChapter, save }
}
