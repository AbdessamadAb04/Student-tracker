/**
 * Data Seeder Service
 * Seeds initial academic data (subjects, grades, absences, feedbacks)
 * for a user on first login. Safe to call multiple times (idempotent).
 */

import { supabase } from '../lib/supabase'

const SEED_FLAG_KEY = 'edutrack_seeded_v1'

export async function seedUserData(userId: string): Promise<void> {
  // Skip if already seeded for this user in this browser
  const flag = localStorage.getItem(`${SEED_FLAG_KEY}_${userId}`)
  if (flag) return

  // Check Supabase — if user already has subjects, skip
  const { data: existingSubjects } = await supabase
    .from('subjects')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (existingSubjects && existingSubjects.length > 0) {
    localStorage.setItem(`${SEED_FLAG_KEY}_${userId}`, '1')
    return
  }

  console.log('🌱 Seeding initial data for user', userId)

  // ─── 1. Subjects ──────────────────────────────────────────────────────────

  const subjectData = [
    { name: 'Algorithmes Avancés',   color: '#7F77DD', type: 'academic' as const, coefficient: 4, teacher: 'Pr. Khaled',   is_active: true },
    { name: 'Développement Web',     color: '#1D9E75', type: 'academic' as const, coefficient: 3, teacher: 'Pr. Karimi',   is_active: true },
    { name: 'Base de Données',       color: '#BA7517', type: 'academic' as const, coefficient: 3, teacher: 'Pr. Ouarrari', is_active: true },
    { name: 'Systèmes Distribués',   color: '#D4537E', type: 'academic' as const, coefficient: 4, teacher: 'Pr. Nasri',    is_active: true },
    { name: 'Gestion de Projet',     color: '#0E7490', type: 'academic' as const, coefficient: 2, teacher: 'Pr. Benali',   is_active: true },
    { name: 'Sécurité Informatique', color: '#9333EA', type: 'academic' as const, coefficient: 3, teacher: 'Pr. Tahiri',   is_active: true },
  ]

  const { data: insertedSubjects, error: subjectsError } = await supabase
    .from('subjects')
    .insert(subjectData.map(s => ({ ...s, user_id: userId })))
    .select('id, name')

  if (subjectsError || !insertedSubjects) {
    console.error('Failed to seed subjects:', subjectsError)
    return
  }

  // Build name→id map
  const subjectMap: Record<string, string> = {}
  insertedSubjects.forEach(s => { subjectMap[s.name] = s.id })

  const s = (name: string) => subjectMap[name] ?? ''

  // ─── 2. Grades ────────────────────────────────────────────────────────────

  const gradesData = [
    // Algorithmes Avancés
    { subject_id: s('Algorithmes Avancés'),   title: 'Contrôle Continu 1',      value: 15.5, weight: 1, date: '2024-10-10', teacher: 'Pr. Khaled',   type: 'cc'      as const },
    { subject_id: s('Algorithmes Avancés'),   title: 'TP Graphes',               value: 17,   weight: 1, date: '2024-11-05', teacher: 'Pr. Khaled',   type: 'tp'      as const },
    { subject_id: s('Algorithmes Avancés'),   title: 'Examen Final S1',          value: 14,   weight: 2, date: '2025-01-20', teacher: 'Pr. Khaled',   type: 'exam'    as const },
    { subject_id: s('Algorithmes Avancés'),   title: 'Contrôle Continu 2',       value: 16,   weight: 1, date: '2025-03-12', teacher: 'Pr. Khaled',   type: 'cc'      as const },
    { subject_id: s('Algorithmes Avancés'),   title: 'Projet Algorithmique',     value: 18,   weight: 2, date: '2025-05-08', teacher: 'Pr. Khaled',   type: 'project' as const },
    // Développement Web
    { subject_id: s('Développement Web'),     title: 'Quiz HTML/CSS',            value: 19,   weight: 1, date: '2024-10-15', teacher: 'Pr. Karimi',   type: 'quiz'    as const },
    { subject_id: s('Développement Web'),     title: 'TP React',                 value: 18.5, weight: 1, date: '2024-11-20', teacher: 'Pr. Karimi',   type: 'tp'      as const },
    { subject_id: s('Développement Web'),     title: 'Examen Final S1',          value: 16,   weight: 2, date: '2025-01-22', teacher: 'Pr. Karimi',   type: 'exam'    as const },
    { subject_id: s('Développement Web'),     title: 'Projet Web Full-Stack',    value: 20,   weight: 2, date: '2025-05-15', teacher: 'Pr. Karimi',   type: 'project' as const },
    // Base de Données
    { subject_id: s('Base de Données'),       title: 'Contrôle Continu 1',      value: 13,   weight: 1, date: '2024-10-18', teacher: 'Pr. Ouarrari', type: 'cc'      as const },
    { subject_id: s('Base de Données'),       title: 'TP SQL',                   value: 15,   weight: 1, date: '2024-11-28', teacher: 'Pr. Ouarrari', type: 'tp'      as const },
    { subject_id: s('Base de Données'),       title: 'Examen Final S1',          value: 12.5, weight: 2, date: '2025-01-25', teacher: 'Pr. Ouarrari', type: 'exam'    as const },
    { subject_id: s('Base de Données'),       title: 'Contrôle Continu 2',       value: 14,   weight: 1, date: '2025-03-20', teacher: 'Pr. Ouarrari', type: 'cc'      as const },
    // Systèmes Distribués
    { subject_id: s('Systèmes Distribués'),   title: 'Contrôle Continu 1',       value: 14.5, weight: 1, date: '2024-10-22', teacher: 'Pr. Nasri',    type: 'cc'      as const },
    { subject_id: s('Systèmes Distribués'),   title: 'TP Docker/K8s',            value: 16,   weight: 1, date: '2024-12-05', teacher: 'Pr. Nasri',    type: 'tp'      as const },
    { subject_id: s('Systèmes Distribués'),   title: 'Examen Final S1',          value: 13,   weight: 2, date: '2025-01-28', teacher: 'Pr. Nasri',    type: 'exam'    as const },
    // Gestion de Projet
    { subject_id: s('Gestion de Projet'),     title: 'Présentation SCRUM',       value: 17.5, weight: 1, date: '2024-11-10', teacher: 'Pr. Benali',   type: 'project' as const },
    { subject_id: s('Gestion de Projet'),     title: 'Contrôle Continu 1',       value: 16,   weight: 1, date: '2025-02-05', teacher: 'Pr. Benali',   type: 'cc'      as const },
    // Sécurité Informatique
    { subject_id: s('Sécurité Informatique'), title: 'Contrôle Continu 1',       value: 15,   weight: 1, date: '2024-11-15', teacher: 'Pr. Tahiri',   type: 'cc'      as const },
    { subject_id: s('Sécurité Informatique'), title: 'TP Pentest',               value: 18,   weight: 1, date: '2025-01-10', teacher: 'Pr. Tahiri',   type: 'tp'      as const },
    { subject_id: s('Sécurité Informatique'), title: 'Examen Final S1',          value: 14.5, weight: 2, date: '2025-02-01', teacher: 'Pr. Tahiri',   type: 'exam'    as const },
  ]

  await supabase.from('grades').insert(gradesData.map(g => ({ ...g, user_id: userId })))

  // ─── 3. Absences ──────────────────────────────────────────────────────────

  const absencesData = [
    { date: '2024-10-03', duration: 'full' as const, reason: 'Maladie',              excused: true,  certificate_provided: true,  subject_id: s('Algorithmes Avancés')   },
    { date: '2024-10-15', duration: 'half' as const, reason: 'Rendez-vous médical',  excused: true,  certificate_provided: true,  subject_id: s('Développement Web')     },
    { date: '2024-11-07', duration: 'full' as const, reason: 'Personnel',            excused: false, certificate_provided: false, subject_id: s('Base de Données')       },
    { date: '2024-11-22', duration: 'half' as const, reason: null,                   excused: false, certificate_provided: false, subject_id: s('Systèmes Distribués')   },
    { date: '2024-12-10', duration: 'full' as const, reason: 'Maladie',              excused: true,  certificate_provided: true,  subject_id: s('Algorithmes Avancés')   },
    { date: '2024-12-11', duration: 'full' as const, reason: 'Maladie',              excused: true,  certificate_provided: true,  subject_id: s('Gestion de Projet')     },
    { date: '2025-01-08', duration: 'half' as const, reason: 'Transport',            excused: false, certificate_provided: false, subject_id: s('Sécurité Informatique') },
    { date: '2025-02-14', duration: 'full' as const, reason: 'Famille',              excused: true,  certificate_provided: false, subject_id: s('Développement Web')     },
    { date: '2025-03-05', duration: 'half' as const, reason: null,                   excused: false, certificate_provided: false, subject_id: s('Base de Données')       },
    { date: '2025-04-20', duration: 'full' as const, reason: 'Maladie',              excused: true,  certificate_provided: true,  subject_id: s('Systèmes Distribués')   },
  ]

  await supabase.from('absences').insert(absencesData.map(a => ({ ...a, user_id: userId })))

  // ─── 4. Feedbacks ─────────────────────────────────────────────────────────

  const feedbacksData = [
    { teacher_name: 'Pr. Karimi',   subject_id: s('Développement Web'),     rating: 5, is_positive: true,  date: '2024-11-20', comment: "Excellent travail sur le TP React. La composantisation est très propre et le code TypeScript est bien typé. Continuez ainsi !" },
    { teacher_name: 'Pr. Khaled',   subject_id: s('Algorithmes Avancés'),   rating: 4, is_positive: true,  date: '2024-11-06', comment: "Bonne compréhension des algorithmes de graphe. L'analyse de complexité est correcte, mais pourrait être plus détaillée dans le rapport." },
    { teacher_name: 'Pr. Ouarrari', subject_id: s('Base de Données'),       rating: 3, is_positive: false, date: '2024-12-01', comment: "Les notions de base SQL sont acquises, mais les requêtes imbriquées manquent de précision. Revoir les sous-requêtes corrélées." },
    { teacher_name: 'Pr. Benali',   subject_id: s('Gestion de Projet'),     rating: 5, is_positive: true,  date: '2025-01-15', comment: "Présentation SCRUM remarquable. Excellente maîtrise des cérémonies Agile et du Product Backlog. Très bonne participation en classe." },
    { teacher_name: 'Pr. Nasri',    subject_id: s('Systèmes Distribués'),   rating: 3, is_positive: false, date: '2025-02-10', comment: "Le rendu Docker est correct mais la configuration Kubernetes présente quelques erreurs. Des efforts supplémentaires sont nécessaires." },
    { teacher_name: 'Pr. Tahiri',   subject_id: s('Sécurité Informatique'), rating: 4, is_positive: true,  date: '2025-02-20', comment: "Très bon lab de pentest. La méthodologie est rigoureuse et le rapport est bien structuré. Bon sens de l'analyse des vulnérabilités." },
    { teacher_name: 'Pr. Karimi',   subject_id: s('Développement Web'),     rating: 5, is_positive: true,  date: '2025-03-15', comment: "Le projet full-stack est impressionnant. Architecture propre, bonnes pratiques respectées, et une belle UI. Excellent candidat pour le marché du travail." },
    { teacher_name: 'Pr. Khaled',   subject_id: s('Algorithmes Avancés'),   rating: 4, is_positive: true,  date: '2025-04-01', comment: "Le projet algorithmique montre une vraie maturité. Les optimisations proposées sont pertinentes et bien argumentées." },
  ]

  await supabase.from('feedbacks').insert(feedbacksData.map(f => ({ ...f, user_id: userId })))

  // Mark seeded
  localStorage.setItem(`${SEED_FLAG_KEY}_${userId}`, '1')
  console.log('✅ Data seeded successfully for user', userId)
}
