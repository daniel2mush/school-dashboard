import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Subject, YearGroup, User } from '@/types/Types'

// The shape of data returned by /api/teacher/classes
export type TaughtYearGroupData = YearGroup & {
  subjects: Subject[]
  students: (User & {
    attendance: any[]
    grades: any[]
  })[]
}

export const useGetTeacherClasses = () => {
  return useQuery({
    queryKey: ['teacher', 'classes'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/classes')
      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to fetch teacher classes',
        )
      }

      return responseData.data as TaughtYearGroupData[]
    },
  })
}

export const useSubmitGrade = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['teacher', 'submitGrade'],
    mutationFn: async (data: {
      studentId: number
      subjectId: number
      score: number
      grade: string
    }) => {
      const res = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to submit grade',
        )
      }
      return responseData
    },
    onSuccess: () => {
      toast.success('Grade submitted successfully')
      queryClient.invalidateQueries({ queryKey: ['teacher', 'classes'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useSubmitAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['attendance', 'submitAttendance'],
    mutationFn: async (data: {
      studentId: number
      status: string
      date?: Date
    }) => {
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to mark attendance',
        )
      }
      return responseData
    },
    onSuccess: () => {
      toast.success('Attendance marked successfully')
      queryClient.invalidateQueries({ queryKey: ['teacher', 'classes'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
