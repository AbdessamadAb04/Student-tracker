import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { grades, mockGroups, mockGroupStudents } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getSubjects } from '../services/subjectService'
import type { Grade, Subject } from '../types'

const typeLabel: Record<string, string> = {
  exam: 'Examen',
  tp: 'TP',
  cc: 'CC',
  project: 'Projet',
  quiz: 'Quiz',
}

const typeBadge: Record<string, string> = {
  exam:    'bg-purple-100 text-purple-700',
  tp:      'bg-blue-100 text-blue-700',
  cc:      'bg-amber-100 text-amber-700',
  project: 'bg-green-100 text-green-700',
  quiz:    'bg-pink-100 text-pink-700',
}

function gradeColor(v: number) {
  if (v >= 16) return 'text-green-600'
  if (v >= 12) return 'text-amber-600'
  return 'text-red-500'
}

function getSubjectAverage(gradesList: Grade[], subjectId: string) {
  const sg = gradesList.filter(g => g.subjectId === subjectId)
  if (!sg.length) return 0
  const totalWeight = sg.reduce((s, g) => s + g.weight, 0)
  const weighted = sg.reduce((s, g) => s + g.value * g.weight, 0)
  return +(weighted / totalWeight).toFixed(2)
}

function getGeneralAverage(gradesList: Grade[], subjectsList: Subject[]) {
  let totalCoeff = 0, weightedSum = 0
  const academicSubjects = subjectsList.filter(s => s.type === 'academic')
  if (academicSubjects.length === 0) return 0

  academicSubjects.forEach(s => {
    const avg = getSubjectAverage(gradesList, s.id)
    const coeff = s.coefficient || 1
    weightedSum += avg * coeff
    totalCoeff += coeff
  })
  return totalCoeff ? +(weightedSum / totalCoeff).toFixed(2) : 0
}

function buildChartData(gradesList: Grade[]) {
  const sorted = [...gradesList].sort((a, b) => a.date.localeCompare(b.date))
  const byMonth: Record<string, number[]> = {}
  sorted.forEach(g => {
    const month = g.date.slice(0, 7) // YYYY-MM
    if (!byMonth[month]) byMonth[month] = []
    byMonth[month].push(g.value)
  })
  return Object.entries(byMonth).map(([month, vals]) => ({
    month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    moyenne: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
  }))
}

export default function GradesPage() {
  const { user, isConfigured } = useAuth()
  const isTeacher = user?.role === 'teacher'

  // Map logged-in user in demo mode to EMSI-2024-0142 student to see mock data
  const studentId = user?.id?.startsWith('demo-') ? 'EMSI-2024-0142' : (user?.id || 'EMSI-2024-0142')

  const [localGrades, setLocalGrades] = useState<Grade[]>([])
  const [subjectsList, setSubjectsList] = useState<Subject[]>([])
  const [filterSubject, setFilterSubject] = useState<string>('all')

  // Teacher Classroom state
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [groupStudentsList, setGroupStudentsList] = useState<{ studentId: string; name: string }[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')

  // Grade Form Inputs
  const [formSubjectId, setFormSubjectId] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formValue, setFormValue] = useState('')
  const [formWeight, setFormWeight] = useState('1')
  const [formType, setFormType] = useState<'exam' | 'tp' | 'cc' | 'project' | 'quiz'>('cc')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])

  // Load groups if teacher
  useEffect(() => {
    if (isTeacher) {
      if (isConfigured) {
        supabase.from('groups')
          .select('id, name')
          .order('name')
          .then(({ data, error }) => {
            if (!error && data) {
              setGroups(data)
              if (data.length > 0) setSelectedGroupId(data[0].id)
            }
          })
      } else {
        setGroups(mockGroups)
        if (mockGroups.length > 0) setSelectedGroupId(mockGroups[0].id)
      }
    }
  }, [isTeacher, isConfigured])

  // Load students of selected group
  useEffect(() => {
    if (isTeacher && selectedGroupId) {
      if (isConfigured) {
        supabase.from('group_students')
          .select('student_id, profiles(id, name)')
          .eq('group_id', selectedGroupId)
          .then(({ data, error }) => {
            if (!error && data) {
              const list = data
                .filter((item: any) => item.profiles)
                .map((item: any) => ({
                  studentId: item.profiles.id,
                  name: item.profiles.name,
                }))
              setGroupStudentsList(list)
              if (list.length > 0) {
                setSelectedStudentId(list[0].studentId)
              } else {
                setSelectedStudentId('')
              }
            }
          })
      } else {
        const list = mockGroupStudents
          .filter(gs => gs.groupId === selectedGroupId)
          .map(gs => ({ studentId: gs.studentId, name: gs.name }))
        setGroupStudentsList(list)
        if (list.length > 0) {
          setSelectedStudentId(list[0].studentId)
        } else {
          setSelectedStudentId('')
        }
      }
    }
  }, [isTeacher, selectedGroupId, isConfigured])

  // Load subjects
  useEffect(() => {
    if (isTeacher) {
      if (selectedStudentId) {
        getSubjects(selectedStudentId).then(list => {
          setSubjectsList(list)
          if (list.length > 0) setFormSubjectId(list[0].id)
          else setFormSubjectId('')
        })
      } else {
        setSubjectsList([])
        setFormSubjectId('')
      }
    } else {
      if (user?.id) {
        getSubjects(user.id).then(list => {
          setSubjectsList(list)
          if (list.length > 0) setFormSubjectId(list[0].id)
        })
      }
    }
  }, [isTeacher, selectedStudentId, user?.id, isConfigured])

  // Fetch grades for either student or selected student
  const loadGradesData = async (uid: string) => {
    if (!uid) return
    if (isConfigured) {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', uid)
      if (!error && data) {
        const mapped: Grade[] = data.map(g => ({
          id: g.id,
          studentId: g.user_id,
          subjectId: g.subject_id,
          title: g.title,
          value: g.value,
          weight: g.weight,
          date: g.date,
          teacher: g.teacher,
          type: g.type as any,
        }))
        setLocalGrades(mapped)
      }
    } else {
      const studentGrades = localStorage.getItem(`student_grades_${uid}`)
      if (studentGrades) {
        setLocalGrades(JSON.parse(studentGrades))
      } else {
        // Fallback to mockData
        const filtered = grades.filter(g => g.studentId === uid)
        setLocalGrades(filtered)
      }
    }
  }

  useEffect(() => {
    if (isTeacher) {
      if (selectedStudentId) {
        loadGradesData(selectedStudentId)
      } else {
        setLocalGrades([])
      }
    } else {
      loadGradesData(studentId)
    }
  }, [isTeacher, selectedStudentId, studentId, isConfigured])

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId || !formSubjectId || !formValue || !formTitle.trim()) {
      alert('Veuillez remplir tous les champs obligatoires.')
      return
    }

    const valueNum = parseFloat(formValue)
    if (isNaN(valueNum) || valueNum < 0 || valueNum > 20) {
      alert('La note doit être comprise entre 0 et 20.')
      return
    }

    const weightNum = parseFloat(formWeight)

    const newGrade: Grade = {
      id: `grade-${Date.now()}`,
      studentId: selectedStudentId,
      subjectId: formSubjectId,
      title: formTitle,
      value: valueNum,
      weight: isNaN(weightNum) ? 1 : weightNum,
      date: formDate || new Date().toISOString().split('T')[0],
      teacher: user?.user_metadata?.name || 'Professeur',
      type: formType,
    }

    if (isConfigured) {
      const { error } = await supabase.from('grades').insert({
        user_id: selectedStudentId,
        subject_id: formSubjectId,
        group_id: selectedGroupId || null,
        title: formTitle,
        value: valueNum,
        weight: isNaN(weightNum) ? 1 : weightNum,
        date: formDate || new Date().toISOString().split('T')[0],
        teacher: user?.user_metadata?.name || 'Professeur',
        type: formType,
      })
      if (error) {
        alert("Erreur lors de l'insertion de la note : " + error.message)
        return
      }
    } else {
      // Demo mode: save to student's local grades
      const studentGrades = localStorage.getItem(`student_grades_${selectedStudentId}`)
      const list: Grade[] = studentGrades ? JSON.parse(studentGrades) : []
      list.push(newGrade)
      localStorage.setItem(`student_grades_${selectedStudentId}`, JSON.stringify(list))

      // Also update general list for demo if needed
      const allGrades = localStorage.getItem('demo_all_grades')
      const allList: Grade[] = allGrades ? JSON.parse(allGrades) : [...grades]
      allList.push(newGrade)
      localStorage.setItem('demo_all_grades', JSON.stringify(allList))
    }

    setFormTitle('')
    setFormValue('')
    setFormWeight('1')
    setFormDate(new Date().toISOString().split('T')[0])
    
    // Refresh list
    loadGradesData(selectedStudentId)
  }

  const filtered = filterSubject === 'all'
    ? localGrades
    : localGrades.filter(g => g.subjectId === filterSubject)

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
  const chartData = buildChartData(localGrades)
  const genAvg = getGeneralAverage(localGrades, subjectsList)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            {isTeacher ? 'Saisie des Notes' : 'Notes & Moyennes'}
          </h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {isTeacher 
              ? 'Sélectionnez un étudiant et saisissez ses performances académiques.' 
              : 'Suivi de vos performances académiques par matière.'}
          </p>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-3">
            <select
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none"
            >
              <option value="">Sélectionnez un groupe</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none"
              disabled={!selectedGroupId}
            >
              <option value="">Sélectionnez un étudiant</option>
              {groupStudentsList.map(s => (
                <option key={s.studentId} value={s.studentId}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isTeacher && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-sm">
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)] mb-4">Nouvelle Note</h2>
          <form onSubmit={handleAddGrade} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Matière *</label>
              <select
                value={formSubjectId}
                onChange={e => setFormSubjectId(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {subjectsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Évaluation *</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Ex. Contrôle Continu 1, Projet Web"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Note (sur 20) *</label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.25"
                value={formValue}
                onChange={e => setFormValue(e.target.value)}
                placeholder="Ex. 15.5"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Type d'évaluation *</label>
              <select
                value={formType}
                onChange={e => setFormType(e.target.value as any)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="cc">Contrôle Continu</option>
                <option value="tp">TP</option>
                <option value="exam">Examen Final</option>
                <option value="project">Projet</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Coefficient *</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formWeight}
                onChange={e => setFormWeight(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Date *</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={!selectedStudentId}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
              >
                Enregistrer la note
              </button>
            </div>
          </form>
        </div>
      )}

      {isTeacher && !selectedStudentId ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-text-secondary)] bg-[var(--color-white)]">
          <p className="text-lg font-medium mb-1">Aucun étudiant sélectionné</p>
          <p className="text-sm">Veuillez sélectionner une classe puis un étudiant pour saisir et visualiser ses notes.</p>
        </div>
      ) : (
        <>
          {/* General average + subject cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* General average */}
            <div className="col-span-1 flex flex-col items-center justify-center rounded-2xl bg-[var(--color-primary)] p-6 text-white shadow-sm">
              <div className="text-[var(--text-xs)] font-medium uppercase tracking-wider opacity-80">Moyenne Générale</div>
              <div className="mt-2 text-5xl font-bold">{genAvg}</div>
              <div className="mt-1 text-[var(--text-xs)] opacity-70">/ 20</div>
            </div>

            {/* Subject averages */}
            {subjectsList.slice(0, 3).map(s => {
              const avg = getSubjectAverage(localGrades, s.id)
              return (
                <div key={s.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] truncate">{s.name}</span>
                  </div>
                  <div className={`text-3xl font-bold ${gradeColor(avg)}`}>{avg}</div>
                  <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">/ 20 · Coeff. {s.coefficient}</div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--color-gray-bg)]">
                    <div className="h-1.5 rounded-full" style={{ width: `${(avg / 20) * 100}%`, background: s.color }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* All subject averages */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
            <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Moyennes par matière</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {subjectsList.map(s => {
                const avg = getSubjectAverage(localGrades, s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => setFilterSubject(filterSubject === s.id ? 'all' : s.id)}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      filterSubject === s.id ? 'shadow-md' : 'border-[var(--color-border)] hover:border-gray-300'
                    }`}
                    style={filterSubject === s.id ? { borderColor: s.color, background: s.color + '10' } : {}}
                  >
                    <div className="text-xl font-bold" style={{ color: s.color }}>{avg}</div>
                    <div className="mt-0.5 text-[var(--text-xs)] font-medium text-[var(--color-text)] leading-tight">{s.name}</div>
                    <div className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">Coeff. {s.coefficient}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chart */}
          {!isTeacher && chartData.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
              <h2 className="mb-6 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Évolution des notes dans le temps</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                    formatter={(v: any) => [`${v}/20`, 'Moyenne']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="moyenne"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--color-primary)', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Moyenne mensuelle"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Grades table */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
              <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">
                Détail des notes
                {filterSubject !== 'all' && (
                  <span className="ml-2 text-[var(--text-xs)] font-normal text-[var(--color-text-secondary)]">
                    — filtré par {subjectsList.find(s => s.id === filterSubject)?.name}
                  </span>
                )}
              </h2>
              {filterSubject !== 'all' && (
                <button
                  onClick={() => setFilterSubject('all')}
                  className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline"
                >
                  Voir tout
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[var(--text-sm)]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-gray-bg)]">
                    <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Matière</th>
                    <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Évaluation</th>
                    <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {sorted.map(g => {
                    const subj = subjectsList.find(s => s.id === g.subjectId)
                    return (
                      <tr key={g.id} className="hover:bg-[var(--color-gray-bg)] transition-colors">
                        <td className="px-6 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                          {new Date(g.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: subj?.color }} />
                            <span className="text-[var(--color-text)] font-medium">{subj?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-[var(--color-text)]">{g.title}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium ${typeBadge[g.type]}`}>
                            {typeLabel[g.type]}
                          </span>
                        </td>
                        <td className={`px-6 py-3 text-right text-base font-bold ${gradeColor(g.value)}`}>
                          {g.value}/20
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
