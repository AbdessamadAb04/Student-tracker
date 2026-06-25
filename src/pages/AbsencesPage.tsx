import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockGroups, mockGroupStudents } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useAbsences } from '../hooks/useAbsences'
import { useSubjects } from '../hooks/useSubjects'
import type { Absence, Subject } from '../types'

const TOTAL_SCHOOL_DAYS = 120 // approximate semester days

function countDays(abs: Absence[]) {
  return abs.reduce((s, a) => s + (a.duration === 'full' ? 1 : 0.5), 0)
}

export default function AbsencesPage() {
  const { user, isConfigured } = useAuth()
  const isTeacher = user?.role === 'teacher'

  const { absences } = useAbsences()
  const { subjects: subjectsList } = useSubjects()

  // Teacher Classroom state
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [roster, setRoster] = useState<{ studentId: string; name: string; absent: boolean; reason: string; excused: boolean }[]>([])

  // Attendance Form Inputs
  const [formSubjectId, setFormSubjectId] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formDuration, setFormDuration] = useState<'half' | 'full'>('full')

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

  // Load roster
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
                  absent: false,
                  reason: '',
                  excused: false,
                }))
              setRoster(list)
            }
          })
      } else {
        const list = mockGroupStudents
          .filter(gs => gs.groupId === selectedGroupId)
          .map(gs => ({
            studentId: gs.studentId,
            name: gs.name,
            absent: false,
            reason: '',
            excused: false,
          }))
        setRoster(list)
      }
    }
  }, [isTeacher, selectedGroupId, isConfigured])

  // Set form subject when subjects load
  useEffect(() => {
    if (subjectsList.length > 0) {
      setFormSubjectId(subjectsList[0].id)
    } else {
      setFormSubjectId('')
    }
  }, [subjectsList])

  const handleCheckboxChange = (studId: string, field: 'absent' | 'reason' | 'excused', value: any) => {
    setRoster(prev => prev.map(item => {
      if (item.studentId === studId) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const handleSubmitAbsences = async () => {
    const absentStudents = roster.filter(s => s.absent)
    if (absentStudents.length === 0) {
      alert("Appel enregistré (aucun étudiant absent).")
      return
    }

    if (isConfigured) {
      const rowsToInsert = absentStudents.map(s => ({
        user_id: s.studentId,
        subject_id: formSubjectId || null,
        group_id: selectedGroupId || null,
        date: formDate,
        duration: formDuration,
        reason: s.reason || null,
        excused: s.excused,
        certificate_provided: s.excused,
      }))
      const { error } = await supabase.from('absences').insert(rowsToInsert)
      if (error) {
        alert("Erreur lors de l'enregistrement des absences : " + error.message)
        return
      }
    } else {
      // Demo mode: save for each student in local storage
      absentStudents.forEach(s => {
        const newAbsence: Absence = {
          id: `abs-${Date.now()}-${s.studentId}`,
          studentId: s.studentId,
          date: formDate,
          duration: formDuration,
          reason: s.reason || undefined,
          excused: s.excused,
          certificateProvided: s.excused,
          subject_id: formSubjectId || undefined,
        }

        const studentAbs = localStorage.getItem(`student_absences_${s.studentId}`)
        const list: Absence[] = studentAbs ? JSON.parse(studentAbs) : []
        list.push(newAbsence)
        localStorage.setItem(`student_absences_${s.studentId}`, JSON.stringify(list))

        const allAbs = localStorage.getItem('demo_all_absences')
        const allList: Absence[] = allAbs ? JSON.parse(allAbs) : []
        allList.push(newAbsence)
        localStorage.setItem('demo_all_absences', JSON.stringify(allList))
      })
    }

    alert(`Appel enregistré ! ${absentStudents.length} absences enregistrées.`)
    // Reset roster
    setRoster(prev => prev.map(s => ({ ...s, absent: false, reason: '', excused: false })))
  }

  // Build chart data
  function buildMonthlyData(absList: Absence[]) {
    const byMonth: Record<string, { excused: number; unexcused: number }> = {}
    absList.forEach(a => {
      const month = a.date.slice(0, 7)
      if (!byMonth[month]) byMonth[month] = { excused: 0, unexcused: 0 }
      const val = a.duration === 'full' ? 1 : 0.5
      if (a.excused) byMonth[month].excused += val
      else byMonth[month].unexcused += val
    })
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        Excusé: data.excused,
        'Non excusé': data.unexcused,
      }))
  }

  const totalDays = countDays(absences)
  const excusedDays = countDays(absences.filter(a => a.excused))
  const unexcusedDays = countDays(absences.filter(a => !a.excused))
  const absenceRate = +((totalDays / TOTAL_SCHOOL_DAYS) * 100).toFixed(1)
  const monthlyData = buildMonthlyData(absences)

  const rateColor =
    absenceRate > 15 ? 'text-red-500' :
    absenceRate > 8  ? 'text-amber-500' :
    'text-green-600'

  const sorted = [...absences].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            {isTeacher ? 'Appel de Présence' : 'Suivi des Absences'}
          </h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {isTeacher 
              ? "Feuille d'appel pour enregistrer les absences d'un groupe." 
              : 'Historique et statistiques de présence.'}
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
          </div>
        )}
      </div>

      {isTeacher && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-sm">
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)] mb-4">Feuille d'Appel</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Matière *</label>
              <select
                value={formSubjectId}
                onChange={e => setFormSubjectId(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjectsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Date *</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Durée *</label>
              <select
                value={formDuration}
                onChange={e => setFormDuration(e.target.value as 'half' | 'full')}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full">Journée complète</option>
                <option value="half">Demi-journée</option>
              </select>
            </div>
          </div>

          {selectedGroupId ? (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-white)]">
                <table className="w-full text-[var(--text-sm)] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-gray-bg)]">
                      <th className="px-6 py-3 text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-1/4">Étudiant</th>
                      <th className="px-6 py-3 text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-24 text-center">Absent</th>
                      <th className="px-6 py-3 text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Motif / Justification</th>
                      <th className="px-6 py-3 text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-32 text-center">Excusée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {roster.map(student => (
                      <tr key={student.studentId} className="hover:bg-[var(--color-gray-bg)] transition-colors">
                        <td className="px-6 py-4 font-medium text-[var(--color-text)]">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={student.absent}
                            onChange={e => handleCheckboxChange(student.studentId, 'absent', e.target.checked)}
                            className="h-4 w-4 rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={student.reason}
                            onChange={e => handleCheckboxChange(student.studentId, 'reason', e.target.value)}
                            disabled={!student.absent}
                            placeholder="Ex. Maladie, Rendez-vous"
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={student.excused}
                            onChange={e => handleCheckboxChange(student.studentId, 'excused', e.target.checked)}
                            disabled={!student.absent}
                            className="h-4 w-4 rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500 disabled:opacity-40"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmitAbsences}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Enregistrer les présences
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-[var(--color-text-secondary)] text-sm py-4">Veuillez sélectionner un groupe pour charger la liste des étudiants.</p>
          )}
        </div>
      )}

      {/* Student View */}
      {!isTeacher && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
              <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)] uppercase tracking-wider">Taux d'absence</div>
              <div className={`mt-2 text-4xl font-bold ${rateColor}`}>{absenceRate}%</div>
              <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">sur {TOTAL_SCHOOL_DAYS} jours</div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--color-gray-bg)]">
                <div className={`h-1.5 rounded-full ${absenceRate > 15 ? 'bg-red-400' : absenceRate > 8 ? 'bg-amber-400' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(absenceRate, 100)}%` }} />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
              <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)] uppercase tracking-wider">Jours totaux</div>
              <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{totalDays}</div>
              <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{absences.length} entrées</div>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
              <div className="text-[var(--text-xs)] text-green-700 font-medium uppercase tracking-wider">Excusées</div>
              <div className="mt-2 text-4xl font-bold text-green-700">{excusedDays}j</div>
              <div className="mt-1 text-[var(--text-xs)] text-green-600">{absences.filter(a => a.excused).length} absences</div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
              <div className="text-[var(--text-xs)] text-red-700 font-medium uppercase tracking-wider">Non excusées</div>
              <div className="mt-2 text-4xl font-bold text-red-500">{unexcusedDays}j</div>
              <div className="mt-1 text-[var(--text-xs)] text-red-500">{absences.filter(a => !a.excused).length} absences</div>
            </div>
          </div>

          {/* Monthly bar chart */}
          {monthlyData.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
              <h2 className="mb-6 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Absences par mois</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                    formatter={(v: any) => [`${v}j`]}
                  />
                  <Bar dataKey="Excusé" stackId="a" fill="#86efac" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Non excusé" stackId="a" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex gap-4 justify-center text-[var(--text-xs)]">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-green-300 inline-block" />Excusées</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-300 inline-block" />Non excusées</span>
              </div>
            </div>
          )}

          {/* Absence list */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-6 py-4">
              <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Historique des absences</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[var(--text-sm)]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-gray-bg)]">
                    <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Durée</th>
                    <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Matière</th>
                    <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Raison</th>
                    <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Certificat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {sorted.map(a => {
                    const subj = subjectsList.find(s => s.id === a.subject_id)
                    return (
                      <tr key={a.id} className="hover:bg-[var(--color-gray-bg)] transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap text-[var(--color-text-secondary)]">
                          {new Date(a.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium ${
                            a.duration === 'full' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {a.duration === 'full' ? 'Journée complète' : 'Demi-journée'}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {subj ? (
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: subj.color }} />
                              <span className="text-[var(--color-text)]">{subj.name}</span>
                            </div>
                          ) : <span className="text-[var(--color-text-secondary)]">—</span>}
                        </td>
                        <td className="px-6 py-3 text-[var(--color-text)]">{a.reason ?? '—'}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium ${
                            a.excused ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {a.excused ? '✓ Excusée' : '✗ Non excusée'}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {a.certificateProvided
                            ? <span className="text-[var(--text-xs)] text-green-600 font-medium">✓ Fourni</span>
                            : <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">—</span>
                          }
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
