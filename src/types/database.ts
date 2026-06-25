/**
 * Supabase Database Type Definitions
 * Mirrors the actual PostgreSQL schema.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          institution: string | null
          year: string | null
          track: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          institution?: string | null
          year?: string | null
          track?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          institution?: string | null
          year?: string | null
          track?: string | null
        }
        Relationships: any[]
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          type: 'academic' | 'personal'
          coefficient: number | null
          teacher: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          type: 'academic' | 'personal'
          coefficient?: number | null
          teacher?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          color?: string
          type?: 'academic' | 'personal'
          coefficient?: number | null
          teacher?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }
      grades: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          title: string
          value: number
          weight: number
          date: string
          teacher: string
          type: 'exam' | 'tp' | 'cc' | 'project' | 'quiz'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          title: string
          value: number
          weight: number
          date: string
          teacher: string
          type: 'exam' | 'tp' | 'cc' | 'project' | 'quiz'
          created_at?: string
        }
        Update: {
          title?: string
          value?: number
          weight?: number
          date?: string
          teacher?: string
          type?: 'exam' | 'tp' | 'cc' | 'project' | 'quiz'
        }
        Relationships: any[]
      }
      absences: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          date: string
          duration: 'half' | 'full'
          reason: string | null
          excused: boolean
          certificate_provided: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          date: string
          duration: 'half' | 'full'
          reason?: string | null
          excused?: boolean
          certificate_provided?: boolean
          created_at?: string
        }
        Update: {
          reason?: string | null
          excused?: boolean
          certificate_provided?: boolean
        }
        Relationships: any[]
      }
      feedbacks: {
        Row: {
          id: string
          user_id: string
          teacher_name: string
          subject_id: string
          comment: string
          rating: number
          is_positive: boolean
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          teacher_name: string
          subject_id: string
          comment: string
          rating: number
          is_positive: boolean
          date: string
          created_at?: string
        }
        Update: {
          comment?: string
          rating?: number
          is_positive?: boolean
        }
        Relationships: any[]
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          type: 'simple' | 'complex'
          title: string
          description: string
          category: string
          created_by: 'student' | 'teacher' | 'system'
          due_date: string
          priority: 'low' | 'medium' | 'high'
          status: string
          estimated_hours: number
          actual_hours: number | null
          subject_ids: string[]
          tags: string[]
          started_date: string | null
          completed_date: string | null
          completion_quality: number | null
          learning_gain: number | null
          grade: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'simple' | 'complex'
          title: string
          description: string
          category: string
          created_by?: 'student' | 'teacher' | 'system'
          due_date: string
          priority: 'low' | 'medium' | 'high'
          status: string
          estimated_hours: number
          actual_hours?: number | null
          subject_ids?: string[]
          tags?: string[]
          started_date?: string | null
          completed_date?: string | null
          completion_quality?: number | null
          learning_gain?: number | null
          grade?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          category?: string
          due_date?: string
          priority?: 'low' | 'medium' | 'high'
          status?: string
          estimated_hours?: number
          actual_hours?: number | null
          subject_ids?: string[]
          tags?: string[]
          started_date?: string | null
          completed_date?: string | null
          completion_quality?: number | null
          learning_gain?: number | null
          grade?: number | null
          notes?: string | null
        }
        Relationships: any[]
      }
      subtasks: {
        Row: {
          id: string
          task_id: string
          title: string
          description: string | null
          estimated_hours: number
          due_date: string | null
          status: 'pending' | 'in_progress' | 'completed'
          completed_date: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          description?: string | null
          estimated_hours: number
          due_date?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          completed_date?: string | null
          notes?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          estimated_hours?: number
          due_date?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          completed_date?: string | null
          notes?: string | null
        }
        Relationships: any[]
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          task_id: string | null
          start_time: string
          end_time: string | null
          duration_minutes: number
          notes: string | null
          quality: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          task_id?: string | null
          start_time: string
          end_time?: string | null
          duration_minutes: number
          notes?: string | null
          quality?: number | null
          created_at?: string
        }
        Update: {
          end_time?: string | null
          duration_minutes?: number
          notes?: string | null
          quality?: number | null
        }
        Relationships: any[]
      }
      reflections: {
        Row: {
          id: string
          user_id: string
          date: string
          subject_id: string | null
          hours_studied: number
          sessions_count: number
          avg_session_minutes: number
          tasks_completed: number
          study_consistency: number
          concentration_level: number
          distractions_count: number
          progress_satisfaction: number
          confidence_level: number
          motivation_level: number
          self_assessed_mastery: number
          perceived_difficulty: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          subject_id?: string | null
          hours_studied: number
          sessions_count: number
          avg_session_minutes: number
          tasks_completed: number
          study_consistency: number
          concentration_level: number
          distractions_count: number
          progress_satisfaction: number
          confidence_level: number
          motivation_level: number
          self_assessed_mastery: number
          perceived_difficulty: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          hours_studied?: number
          sessions_count?: number
          avg_session_minutes?: number
          tasks_completed?: number
          study_consistency?: number
          concentration_level?: number
          distractions_count?: number
          progress_satisfaction?: number
          confidence_level?: number
          motivation_level?: number
          self_assessed_mastery?: number
          perceived_difficulty?: number
          notes?: string | null
        }
        Relationships: any[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
