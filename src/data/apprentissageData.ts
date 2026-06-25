import { subjects } from './mockData'
import type { Subject } from '../types'

export type SubjectWithChapters = Subject & { chapters: NonNullable<Subject['chapters']> }

export const subjectsWithChapters: SubjectWithChapters[] = subjects
  .filter((s): s is SubjectWithChapters => !!s.chapters && s.chapters.length > 0)
