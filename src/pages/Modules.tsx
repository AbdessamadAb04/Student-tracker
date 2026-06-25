import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { v4 as uid } from '../lib/uid'
import { useSubjects } from '../hooks/useSubjects'
import { useChapters } from '../hooks/useChapters'
import { useProgress } from '../context/ProgressContext'
import type { Subject, SubjectChapter, ChapterResource } from '../types'
import ProgressBar from '../components/shared/ProgressBar'

function loadChaptersFromStorage(subjectId: string): SubjectChapter[] {
  try {
    const raw = localStorage.getItem(`chapters_${subjectId}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export default function Modules() {
  const { subjects } = useSubjects()
  const { isChapterCompleted, completeChapter, uncompleteChapter } = useProgress()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const subjectId = searchParams.get('subjectId')
  const { chapters, updateChapter } = useChapters(subjectId ?? '')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    const id = searchParams.get('subjectId')
    if (!id) { setSelectedSubject(null); return }
    const found = subjects.find(s => s.id === id) ?? null
    setSelectedSubject(found)
  }, [searchParams, subjects])

  function handleToggleComplete(chapterId: string) {
    isChapterCompleted(chapterId) ? uncompleteChapter(chapterId) : completeChapter(chapterId)
  }

  function startEdit(chapter: SubjectChapter) {
    setEditingId(chapter.id)
    setEditTitle(chapter.title)
    setEditContent(chapter.content)
  }

  function saveEdit() {
    if (!editingId) return
    updateChapter(editingId, { title: editTitle, content: editContent })
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function handleFileUpload(chapterId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || file.type !== 'application/pdf') return

    const url = URL.createObjectURL(file)
    const resource: ChapterResource = {
      id: uid(),
      name: file.name,
      type: 'course',
      fileUrl: url,
      uploadedAt: new Date().toISOString(),
    }

    const chapter = chapters.find(c => c.id === chapterId)
    if (chapter) {
      updateChapter(chapterId, { resources: [...(chapter.resources ?? []), resource] })
    }
    e.target.value = ''
  }

  function removeResource(chapterId: string, resourceId: string) {
    const chapter = chapters.find(c => c.id === chapterId)
    if (chapter) {
      updateChapter(chapterId, { resources: (chapter.resources ?? []).filter(r => r.id !== resourceId) })
    }
  }

  const completedCount = chapters.filter(ch => isChapterCompleted(ch.id)).length
  const pct = chapters.length ? Math.round((completedCount / chapters.length) * 100) : 0

  const academicSubjects = subjects.filter(s => s.type === 'academic')
  const totalChapters = academicSubjects.reduce((sum, s) => sum + loadChaptersFromStorage(s.id).length, 0)
  const allChapterIds = academicSubjects.flatMap(s => loadChaptersFromStorage(s.id).map(ch => ch.id))
  const globalCompleted = allChapterIds.filter(id => isChapterCompleted(id)).length
  const globalPct = totalChapters ? Math.round((globalCompleted / totalChapters) * 100) : 0

  if (selectedSubject) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => { setSelectedSubject(null); setSearchParams({}) }}
          className="mb-6 flex items-center gap-1 text-[var(--text-xs)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          ← Toutes les matières
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: selectedSubject.color }} />
            <h1 className="text-[var(--text-xl)] font-bold text-[var(--color-text)]">{selectedSubject.name}</h1>
          </div>
          <p className="mb-3 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Enseignant : {selectedSubject.teacher} · Coefficient : {selectedSubject.coefficient}</p>
          <ProgressBar value={pct} color={selectedSubject.color} />
          <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{completedCount}/{chapters.length} chapitres · {pct}% complété</p>
        </div>

        <div className="space-y-4">
          {chapters.map(ch => {
            const completed = isChapterCompleted(ch.id)
            const editing = editingId === ch.id
            return (
              <div key={ch.id} className={`rounded-2xl border bg-[var(--color-white)] p-5 transition-colors ${completed ? 'border-green-200' : 'border-[var(--color-border)]'}`}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(ch.id)}
                    className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${completed ? 'border-[var(--color-success)] bg-[var(--color-success)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
                  >
                    {completed && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" /></svg>}
                  </button>

                  <div className="flex-1 min-w-0">
                    {editing ? (
                      <div className="space-y-3">
                        <input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full rounded-lg border border-[var(--color-primary)] px-3 py-2 text-[var(--text-sm)] font-medium text-[var(--color-text)] outline-none"
                          placeholder="Titre du chapitre"
                        />
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          rows={4}
                          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] outline-none resize-y"
                          placeholder="Contenu du chapitre"
                        />
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="rounded-lg bg-[var(--color-primary)] px-4 py-1.5 text-[var(--text-xs)] text-white hover:opacity-90">Enregistrer</button>
                          <button onClick={cancelEdit} className="rounded-lg border border-[var(--color-border)] px-4 py-1.5 text-[var(--text-xs)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-bg)]">Annuler</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className={`text-[var(--text-sm)] font-semibold ${completed ? 'text-[var(--color-success)] line-through' : 'text-[var(--color-text)]'}`}>{ch.title}</h3>
                          <button onClick={() => startEdit(ch)} className="text-[var(--text-xs)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">✎ Modifier</button>
                        </div>
                        <p className={`mt-1 text-[var(--text-xs)] leading-relaxed ${completed ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'}`}>{ch.content}</p>
                      </>
                    )}

                    {/* Resources section */}
                    <div className="mt-4 border-t border-[var(--color-border)] pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)]">Ressources pédagogiques</span>
                        <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1 text-[var(--text-xs)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-bg)]">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Ajouter un PDF
                          <input type="file" accept=".pdf" onChange={e => handleFileUpload(ch.id, e)} className="hidden" />
                        </label>
                      </div>
                      {ch.resources.length === 0 ? (
                        <p className="text-[var(--text-xs)] text-[var(--color-gray)]">Aucune ressource pour ce chapitre.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {ch.resources.map(r => (
                            <div key={r.id} className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-gray-bg)] px-3 py-1.5">
                              <svg className="h-3.5 w-3.5 text-[var(--color-danger)]" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2" fill="none" /></svg>
                              <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline truncate max-w-[160px]">{r.name}</a>
                              <button onClick={() => removeResource(ch.id, r.id)} className="text-[var(--text-xs)] text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] ml-1">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-[var(--text-2xl)] font-bold text-[var(--color-text)]">Mes matières</h1>
      <p className="mb-8 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Clique sur une matière pour voir ses chapitres et suivre ta progression.</p>

      {/* Global progress */}
      <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold text-lg">{globalPct}%</div>
          <div>
            <h2 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)]">Progression globale</h2>
            <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{globalCompleted}/{totalChapters} chapitres complétés sur {academicSubjects.length} matières</p>
          </div>
        </div>
        <ProgressBar value={globalPct} />
      </div>

      {/* Subject cards */}
      <div className="grid grid-cols-2 gap-4">
        {academicSubjects.map(sub => {
          const subChapters = loadChaptersFromStorage(sub.id)
          const done = subChapters.filter(ch => isChapterCompleted(ch.id)).length
          const subPct = subChapters.length ? Math.round((done / subChapters.length) * 100) : 0
          return (
            <button
              key={sub.id}
              onClick={() => { setSelectedSubject(sub); setSearchParams({ subjectId: sub.id }) }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-left transition-colors hover:border-[var(--color-primary)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: sub.color }} />
                <div className="text-[var(--text-base)] font-medium text-[var(--color-text)]">{sub.name}</div>
              </div>
              <div className="mb-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{sub.teacher} · Coeff. {sub.coefficient}</div>
              <ProgressBar value={subPct} color={sub.color} />
              <div className="mt-1.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{done}/{subChapters.length} chapitres · {subPct}%</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
