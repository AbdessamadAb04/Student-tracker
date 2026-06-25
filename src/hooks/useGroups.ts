import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTeacherGroups, getGroupStudents } from '../services/groupService'
import type { Group } from '../services/groupService'
import type { Profile } from '../types'

export function useGroups() {
  const { user, profile } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groupStudents, setGroupStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  const isTeacher = profile?.role === 'teacher'

  const loadGroups = useCallback(async () => {
    if (!user || !isTeacher) {
      setGroups([])
      return
    }
    setLoading(true)
    const data = await getTeacherGroups(user.id)
    setGroups(data)
    setLoading(false)
  }, [user?.id, isTeacher])

  useEffect(() => { loadGroups() }, [loadGroups])

  const selectGroup = useCallback(async (groupId: string) => {
    const group = groups.find(g => g.id === groupId) ?? null
    setSelectedGroup(group)
    if (group) {
      const students = await getGroupStudents(group.id)
      setGroupStudents(students)
    } else {
      setGroupStudents([])
    }
  }, [groups])

  return {
    groups,
    selectedGroup,
    groupStudents,
    loading,
    selectGroup,
    reload: loadGroups,
    isTeacher,
  }
}
