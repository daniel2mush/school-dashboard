import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Subject, YearGroup, User, Timetable } from '@/types/Types'

// The shape of data returned by /api/teacher/classes
export type TaughtYearGroupData = YearGroup & {
  subjects: Subject[]
  timetables: Timetable[]
  students: (User & {
    attendance: any[]
    grades: any[]
  })[]
}

export type Material = {
  id: number
  title: string
  description?: string
  fileUrl: string
  fileType?: string
  subjectId: number
  yearGroupId?: number
  teacherId: number
  isPublished: boolean
  subject: Subject
  yearGroup?: YearGroup
  createdAt: string
  updatedAt: string
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
      score?: number
      grade?: string
      midterm?: number
      assignmentAvg?: number
      projectFinal?: number
      performance?: string
      teacherReport?: string
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

export const useGetTeacherMaterials = () => {
  return useQuery({
    queryKey: ['teacher', 'materials'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/materials')
      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to fetch materials',
        )
      }

      return responseData.data as Material[]
    },
  })
}

export const useUploadMaterial = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['teacher', 'uploadMaterial'],
    mutationFn: async (data: {
      title: string
      description?: string
      fileUrl: string
      subjectId: number
      yearGroupId?: number
      fileType?: string
    }) => {
      const res = await fetch('/api/teacher/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to upload material',
        )
      }
      return responseData
    },
    onSuccess: () => {
      toast.success('Material uploaded successfully')
      queryClient.invalidateQueries({ queryKey: ['teacher', 'materials'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useToggleMaterialStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['teacher', 'toggleMaterialStatus'],
    mutationFn: async (data: { id: number; isPublished: boolean }) => {
      const res = await fetch(`/api/teacher/materials/${data.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: data.isPublished }),
      })

      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to update status',
        )
      }
      return responseData
    },
    onSuccess: () => {
      toast.success('Material status updated')
      queryClient.invalidateQueries({ queryKey: ['teacher', 'materials'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useCreateTeacherAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['teacher', 'createAnnouncement'],
    mutationFn: async (data: {
      title: string
      content: string
      targetYearGroupId: number
      targetType?: 'YEAR_GROUP'
      priority?: string
    }) => {
      const res = await fetch('/api/teacher/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to send announcement',
        )
      }
      return responseData
    },
    onSuccess: () => {
      toast.success('Announcement broadcasted successfully')
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
