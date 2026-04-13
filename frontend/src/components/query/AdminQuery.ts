import type {
  User,
  YearGroup,
  Subject,
  Fee,
  Timetable,
  FeePayment,
  Announcement,
  SchoolSettings,
} from '#/types/Types'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { toast } from 'sonner'

export type AdminAnalyticsRes = {
  data: AdminAnalyticsData
}

export type AdminAnalyticsData = {
  students: number
  teachers: number
  yearGroups: number
  subjects: number
  totalExpectedRevenue: number
  totalCollectedRevenue: number
  /** % present among P/A/T records; null when there is no attendance data */
  attendancePresentPct: number | null
  /** Active students in year groups that still have under-paid fee records */
  studentsWithOutstandingFees: number
  paymentStats: {
    fullyPaid: number
    partiallyPaid: number
    notPaid: number
  }
  studentStats: {
    studentId: number
    name: string
    email: string
    yearGroupName: string
    totalBilled: number
    totalPaid: number
    balance: number
    fees: {
      feeId: number
      title: string
      totalAmount: number
      amountPaid: number
      isFullyPaid: boolean
    }[]
    attendance: {
      present: number
      absent: number
      tardy: number
      holiday: number
      total: number
    }
    attendance_records: {
      status: string
      date: string
    }[]
  }[]
}

export type AdminDirectoryUser = User & {
  enrolledYearGroupId: number | null
  enrolledYearGroup: { id: number; name: string } | null
  specialization: string | null
  gender: 'Male' | 'Female' | 'Other' | null
  phoneNumber: string | null
  address: string | null
  avatarUrl: string | null
  dateOfBirth: string | null
}

export type AdminCreateTeacherPayload = {
  role: 'TEACHER'
  email: string
  password: string
  name: string
  gender?: 'Male' | 'Female' | 'Other'
  phoneNumber?: string
  specialization?: string
}

export type AdminCreateStudentPayload = {
  role: 'STUDENT'
  email: string
  password: string
  name: string
  gender?: 'Male' | 'Female' | 'Other'
  phoneNumber?: string
  enrolledYearGroupId: number
}

export type CredentialsPayload = {
  email: string
  temporaryPassword: string
}

export type AdminUpdateTeacherPayload = {
  userId: number
  role: 'TEACHER'
  email: string
  name: string
  gender?: 'Male' | 'Female' | 'Other' | null
  phoneNumber?: string | null
  address?: string | null
  dateOfBirth?: string | null
  specialization?: string | null
}

export type AdminUpdateStudentPayload = {
  userId: number
  role: 'STUDENT'
  email: string
  name: string
  gender?: 'Male' | 'Female' | 'Other' | null
  phoneNumber?: string | null
  address?: string | null
  dateOfBirth?: string | null
  enrolledYearGroupId: number | null
}

export const useGetAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics')
      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to fetch analytics',
        )
      }

      const analytics = responseData.data as AdminAnalyticsRes

      return analytics.data as AdminAnalyticsData
    },
  })
}

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users')
      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || 'Failed to fetch users',
        )
      }

      return responseData.data as AdminDirectoryUser[]
    },
  })
}

export type YearGroupTeacherBrief = {
  id: number
  name: string
  email: string
  specialization: string | null
}

export type AdminYearGroupStructure = YearGroup & {
  subjects: Subject[]
  fees: Fee[]
  timetables: Timetable[]
  teachers: YearGroupTeacherBrief[]
  _count: { students: number; teachers: number }
}

export type AdminFeeStudent = {
  id: number
  name: string
  email: string
}

export type AdminFeeRecord = Fee & {
  payments: (FeePayment & { student: AdminFeeStudent })[]
}

export type AdminFeeYearGroup = Pick<
  YearGroup,
  'id' | 'name' | 'level' | 'roomNumber'
> & {
  students: AdminFeeStudent[]
  fees: AdminFeeRecord[]
}

export const useGetSchoolStructure = () => {
  return useQuery({
    queryKey: ['admin', 'structure'],
    queryFn: async () => {
      const res = await fetch('/api/admin/structure')
      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to fetch structure',
        )
      }

      return responseData.data as AdminYearGroupStructure[]
    },
  })
}

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Announcement>) => {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to create announcement')
      }
      return responseData.data
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

const invalidateYearGroupRelated = (qc: QueryClient) => {
  qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
  qc.invalidateQueries({ queryKey: ['admin', 'users'] })
  qc.invalidateQueries({ queryKey: ['admin', 'analytics'] })
}

export const useCreateYearGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      name: string
      level: string
      roomNumber?: string
      capacity?: number | null
      subjectIds?: number[]
    }) => {
      const res = await fetch('/api/admin/year-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not create cohort',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      toast.success('Year group created')
      invalidateYearGroupRelated(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useUpdateYearGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      id: number
      name: string
      level: string
      roomNumber?: string | null
      capacity?: number | null
    }) => {
      const res = await fetch(`/api/admin/year-groups/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          level: data.level,
          roomNumber: data.roomNumber,
          capacity: data.capacity,
        }),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not update cohort',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      toast.success('Year group updated')
      invalidateYearGroupRelated(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useGetFeeManagement = () => {
  return useQuery({
    queryKey: ['admin', 'fees'],
    queryFn: async () => {
      const res = await fetch('/api/admin/fees')
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || 'Failed to fetch fees',
        )
      }
      return responseData.data as AdminFeeYearGroup[]
    },
  })
}

export const useCreateFee = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      yearGroupId: number
      title: string
      description?: string | null
      amount: number
    }) => {
      const res = await fetch('/api/admin/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || 'Could not create fee',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fees'] })
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] })
      qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
      toast.success('Fee item created')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useUpdateFee = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      id: number
      title?: string
      description?: string | null
      amount?: number
    }) => {
      const res = await fetch(`/api/admin/fees/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || 'Could not update fee',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fees'] })
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] })
      qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
      toast.success('Fee item updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useDeleteFee = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/fees/${id}`, {
        method: 'DELETE',
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || 'Could not delete fee',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fees'] })
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] })
      qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
      toast.success('Fee item deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useUpsertFeePayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      feeId: number
      studentId: number
      amountPaid: number
      amountInWords?: string | null
      isFullyPaid: boolean
    }) => {
      const res = await fetch(
        `/api/admin/fees/${payload.feeId}/payments/${payload.studentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountPaid: payload.amountPaid,
            amountInWords: payload.amountInWords,
            isFullyPaid: payload.isFullyPaid,
          }),
        },
      )
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not update payment',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fees'] })
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] })
      qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
      toast.success('Payment updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useAssignTeacherToYearGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { yearGroupId: number; teacherId: number }) => {
      const res = await fetch('/api/admin/year-groups/assign-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not assign teacher',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      toast.success('Teacher assigned')
      invalidateYearGroupRelated(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useUpsertTimetableSlot = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      yearGroupId: number
      day: string
      periodId: number
      subjectId: number | null
      teacherId: number | null
    }) => {
      const res = await fetch('/api/admin/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not save timetable slot',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      toast.success('Timetable updated')
      invalidateYearGroupRelated(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useCreatePeriod = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      label: string
      startTime: string
      endTime: string
      isBreak?: boolean
    }) => {
      const res = await fetch('/api/admin/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || 'Could not create period')
      }
      return responseData.data
    },
    onSuccess: () => {
      toast.success('Period created')
      invalidateYearGroupRelated(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useAssignPeriodToYearGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { yearGroupId: number; periodId: number }) => {
      const res = await fetch('/api/admin/periods/assign-year-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || 'Could not assign period')
      }
      return responseData.data
    },
    onSuccess: () => {
      toast.success('Period added to year group')
      invalidateYearGroupRelated(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useDeletePeriod = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/periods/${id}`, {
        method: 'DELETE',
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || 'Could not delete period')
      }
      return responseData.data
    },
    onSuccess: () => {
      toast.success('Period deleted')
      invalidateYearGroupRelated(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useUpdatePeriod = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      id: number
      label?: string
      startTime?: string
      endTime?: string
      isBreak?: boolean
    }) => {
      const res = await fetch(`/api/admin/periods/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || 'Could not update period')
      }
      return responseData.data
    },
    onSuccess: () => {
      toast.success('Period updated')
      invalidateYearGroupRelated(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useUnassignTeacherFromYearGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { yearGroupId: number; teacherId: number }) => {
      const res = await fetch('/api/admin/year-groups/unassign-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not remove teacher',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      toast.success('Teacher removed from cohort')
      invalidateYearGroupRelated(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useMoveStudentYearGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { studentId: number; yearGroupId: number }) => {
      const res = await fetch('/api/admin/year-groups/move-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not move student',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      toast.success('Student moved')
      invalidateYearGroupRelated(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

const invalidateAdminDirectory = (qc: QueryClient) => {
  qc.invalidateQueries({ queryKey: ['admin', 'users'] })
  qc.invalidateQueries({ queryKey: ['admin', 'analytics'] })
  qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
}

export const useCreateAdminUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: AdminCreateTeacherPayload | AdminCreateStudentPayload,
    ) => {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not create account',
        )
      }
      return responseData.data as {
        user: AdminDirectoryUser
        temporaryPassword: string
      }
    },
    onSuccess: () => {
      invalidateAdminDirectory(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useUpdateUserStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      userId: number
      status: 'Active' | 'Inactive' | 'Suspended'
    }) => {
      const res = await fetch(`/api/admin/users/${payload.userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: payload.status }),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not update access',
        )
      }
      return responseData.data as AdminDirectoryUser
    },
    onSuccess: (_, v) => {
      invalidateAdminDirectory(qc)
      toast.success(
        v.status === 'Active'
          ? 'Access restored'
          : 'Access restricted for this account',
      )
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useUpdateAdminUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: AdminUpdateTeacherPayload | AdminUpdateStudentPayload,
    ) => {
      const res = await fetch(`/api/admin/users/${payload.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          payload.role === 'TEACHER'
            ? {
                email: payload.email,
                name: payload.name,
                gender: payload.gender,
                phoneNumber: payload.phoneNumber,
                address: payload.address,
                dateOfBirth: payload.dateOfBirth,
                specialization: payload.specialization,
              }
            : {
                email: payload.email,
                name: payload.name,
                gender: payload.gender,
                phoneNumber: payload.phoneNumber,
                address: payload.address,
                dateOfBirth: payload.dateOfBirth,
                enrolledYearGroupId: payload.enrolledYearGroupId,
              },
        ),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not update user details',
        )
      }
      return responseData.data as AdminDirectoryUser
    },
    onSuccess: () => {
      invalidateAdminDirectory(qc)
      toast.success('User details updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useDeleteAdminUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || 'Could not remove user',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      invalidateAdminDirectory(qc)
      toast.success('User removed from the directory')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useResetUserPassword = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not reset password',
        )
      }
      return responseData.data as CredentialsPayload
    },
    onSuccess: () => {
      invalidateAdminDirectory(qc)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export type CreateSubjectPayload = {
  name: string
  description?: string | null
}

export type UpdateSubjectPayload = {
  id: number
  name: string
  description?: string | null
}

export type SubjectWithRelations = Subject & {
  yearGroups: Pick<YearGroup, 'id' | 'name' | 'level'>[]
  _count: { yearGroups: number; grades: number; timetable: number }
}

export type AssignSubjectYearGroupPayload = {
  subjectId: number
  yearGroupId: number
}

export const useGetSubjects = () => {
  return useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: async () => {
      const res = await fetch('/api/admin/subjects')
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to fetch subjects')
      }
      return responseData.data as SubjectWithRelations[]
    },
  })
}

export const useCreateSubject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateSubjectPayload) => {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || 'Could not create subject')
      }
      return responseData.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] })
      toast.success('Subject created')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useUpdateSubject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateSubjectPayload) => {
      const res = await fetch(`/api/admin/subjects/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          description: payload.description,
        }),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || 'Could not update subject')
      }
      return responseData.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
      toast.success('Subject updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useDeleteSubject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/subjects/${id}`, {
        method: 'DELETE',
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || 'Could not delete subject')
      }
      return responseData.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] })
      toast.success('Subject deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useAssignSubjectToYearGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AssignSubjectYearGroupPayload) => {
      const res = await fetch('/api/admin/subjects/assign-year-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not assign subject',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
      toast.success('Year group linked')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useUnassignSubjectFromYearGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AssignSubjectYearGroupPayload) => {
      const res = await fetch('/api/admin/subjects/unassign-year-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not remove subject from year group',
        )
      }
      return responseData.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
      toast.success('Year group unlinked')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const useGetSchoolSettings = () => {
  return useQuery({
    queryKey: ['admin', 'school-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/school-settings')
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Could not fetch school settings',
        )
      }
      return responseData.data as SchoolSettings
    },
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  })
}

export const useSaveSchoolSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/admin/school-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()

      if (!res.ok) {
        toast.error(responseData.message || 'Failed to save settings')
        return
      }
      return responseData.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'school-settings'] })
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] })
      qc.invalidateQueries({ queryKey: ['admin', 'attendance'] })
      qc.invalidateQueries({ queryKey: ['admin', 'fees'] })
      qc.invalidateQueries({ queryKey: ['admin', 'timetable'] })
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'year-groups'] })
      qc.invalidateQueries({ queryKey: ['admin', 'structure'] })
      toast.success('School settings saved')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
