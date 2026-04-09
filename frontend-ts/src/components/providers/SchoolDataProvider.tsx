'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { DashboardLanguage, SchoolSettings } from '#/types/Types'
import i18n from '#/components/dashboard/i18n.instance'

const ANNOUNCEMENTS = []
const ATTENDANCE = {}
const GRADES = {}
const PERIODS = [
  { id: 1, name: 'Period 1', start: '08:00', end: '09:00', isBreak: false },
  { id: 2, name: 'Period 2', start: '09:00', end: '10:00', isBreak: false },
  { id: 3, name: 'Break', start: '10:00', end: '10:30', isBreak: true },
  { id: 4, name: 'Period 3', start: '10:30', end: '11:30', isBreak: false },
  { id: 5, name: 'Period 4', start: '11:30', end: '12:30', isBreak: false },
]
const PUBLICATIONS = []
const SCHOOL = {
  name: 'Sunridge International School',
  term: 'Term 2',
  year: '2026',
  language: 'en' as DashboardLanguage,
  logo: '/logo.svg',
}
const STUDENTS = []
const SUBJECT_COLORS = {}
const TEACHERS = []
const TIMETABLE = {}
const YEAR_GROUPS = []
const scoreLetter = (score) => {
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

const STORAGE_KEY = 'sunridge-school-data'

const COLOR_PALETTE = [
  { color: 'var(--accent-text)', bg: 'var(--accent-bg)' },
  { color: 'var(--green-text)', bg: 'var(--green-bg)' },
  { color: 'var(--amber-text)', bg: 'var(--amber-bg)' },
  { color: 'var(--red-text)', bg: 'var(--red-bg)' },
  { color: 'var(--purple-text)', bg: 'var(--purple-bg)' },
]

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
export const PERIOD_OPTIONS = PERIODS.filter((period) => !period.isBreak)

export type SchoolState = {
  school: typeof SCHOOL
  yearGroups: any[]
  teachers: any[]
  students: any[]
  announcements: any[]
  publications: any[]
  grades: Record<string, any[]>
  attendance: Record<string, string[]>
  timetable: Record<string, Record<string, string[]>>
  feeStructures: Record<string, number>
}

type SchoolDataContextValue = SchoolState & {
  isReady: boolean
  subjectOptions: string[]
  updateSchoolSettings: (input: {
    name: string
    term: string
    year: string
    language: DashboardLanguage
  }) => void
  resetDemoData: () => void
  postAnnouncement: (input: any) => void
  saveYearGroup: (input: any) => void
  assignTeachersToYear: (input: any) => void
  enrolStudentsToYear: (input: any) => void
  addTeacher: (input: any) => void
  addStudent: (input: any) => void
  addPublication: (input: any) => void
  togglePublication: (publicationId: number) => void
  saveAttendance: (input: any) => void
  saveFeeStructures: (structures: Record<string, number>) => void
  saveTimetableSlot: (input: any) => void
  saveGrade: (input: any) => void
}

const SchoolDataContext = createContext<SchoolDataContextValue | undefined>(
  undefined,
)

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function getNextId(items: any[]) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date())
}

function getColorPair(index: number) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length]
}

function calculateAttendancePct(record: string[] = []) {
  const schoolDays = record.filter((entry) => entry !== 'H')

  if (!schoolDays.length) {
    return 0
  }

  const presentish = schoolDays.filter(
    (entry) => entry === 'P' || entry === 'T',
  ).length
  return Math.round((presentish / schoolDays.length) * 100)
}

function buildDefaultTimetable(yearGroup: any) {
  const subjects = yearGroup.subjects?.length
    ? yearGroup.subjects
    : ['Study Hall']

  return DAYS.reduce(
    (schedule, day, dayIndex) => {
      schedule[day] = PERIOD_OPTIONS.map(
        (_, periodIndex) =>
          subjects[(dayIndex + periodIndex) % subjects.length],
      )
      return schedule
    },
    {} as Record<string, string[]>,
  )
}

function getInitialFeeStructures(students: any[]) {
  return students.reduce(
    (structures, student) => {
      if (!structures[student.year]) {
        structures[student.year] = student.fees.total
      }
      return structures
    },
    {} as Record<string, number>,
  )
}

function getSubjectOptionsFromState(state: SchoolState) {
  const fromYearGroups = state.yearGroups.flatMap(
    (yearGroup) => yearGroup.subjects || [],
  )
  const fromTeachers = state.teachers.flatMap(
    (teacher) => teacher.subjects || [],
  )
  const fromPublications = state.publications.map(
    (publication) => publication.subject,
  )
  const fromColors = Object.keys(SUBJECT_COLORS)

  return Array.from(
    new Set([
      ...fromYearGroups,
      ...fromTeachers,
      ...fromPublications,
      ...fromColors,
    ]),
  ).sort()
}

function createSeedState(): SchoolState {
  return normalizeState({
    school: deepClone(SCHOOL),
    yearGroups: deepClone(YEAR_GROUPS),
    teachers: deepClone(TEACHERS),
    students: deepClone(STUDENTS),
    announcements: deepClone(ANNOUNCEMENTS),
    publications: deepClone(PUBLICATIONS),
    grades: deepClone(GRADES),
    attendance: deepClone(ATTENDANCE),
    timetable: deepClone(TIMETABLE),
    feeStructures: getInitialFeeStructures(deepClone(STUDENTS)),
  })
}

function normalizeState(input: Partial<SchoolState>) {
  const yearGroups = deepClone(input.yearGroups || YEAR_GROUPS).map(
    (yearGroup: any, index: number) => {
      const colorPair = getColorPair(index)
      return {
        ...yearGroup,
        subjects: Array.from(
          new Set((yearGroup.subjects || []).filter(Boolean)),
        ),
        color: yearGroup.color || colorPair.color,
        bg: yearGroup.bg || colorPair.bg,
      }
    },
  )

  const feeStructures = {
    ...getInitialFeeStructures(input.students || STUDENTS),
    ...(input.feeStructures || {}),
  }

  const attendance = Object.entries(input.attendance || ATTENDANCE).reduce(
    (records, [studentId, record]) => {
      records[String(studentId)] = Array.isArray(record)
        ? record.slice(-20)
        : []
      return records
    },
    {} as Record<string, string[]>,
  )

  const students = deepClone(input.students || STUDENTS).map((student: any) => {
    const record = attendance[String(student.id)] as string[] | undefined
    const totalFee =
      feeStructures[String(student.year)] ??
      feeStructures[student.year] ??
      student.fees.total

    return {
      ...student,
      fees: {
        ...student.fees,
        total: totalFee,
      },
      att: record?.length ? calculateAttendancePct(record) : student.att,
    }
  })

  const studentCountByYear = students.reduce(
    (counts, student) => {
      counts[student.year] = (counts[student.year] || 0) + 1
      return counts
    },
    {} as Record<string, number>,
  )

  const normalizedYearGroups = yearGroups.map((yearGroup: any) => ({
    ...yearGroup,
    students: studentCountByYear[yearGroup.id] || 0,
  }))

  const timetable = normalizedYearGroups.reduce(
    (schedule, yearGroup) => {
      schedule[String(yearGroup.id)] =
        input.timetable?.[yearGroup.id] ||
        input.timetable?.[String(yearGroup.id)] ||
        buildDefaultTimetable(yearGroup)
      return schedule
    },
    {} as Record<string, Record<string, string[]>>,
  )

  return {
    school: {
      ...deepClone(SCHOOL),
      ...deepClone(input.school || {}),
    },
    yearGroups: normalizedYearGroups,
    teachers: deepClone(input.teachers || TEACHERS),
    students,
    announcements: deepClone(input.announcements || ANNOUNCEMENTS),
    publications: deepClone(input.publications || PUBLICATIONS),
    grades: deepClone(input.grades || GRADES),
    attendance,
    timetable,
    feeStructures,
  }
}

function saveStateToStorage(state: SchoolState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function readStateFromStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return normalizeState(JSON.parse(raw))
  } catch {
    return null
  }
}

export function SchoolDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SchoolState>(createSeedState())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const hydrate = async () => {
      const storedState = readStateFromStorage()

      if (storedState) {
        setState(storedState)
      }

      try {
        const res = await fetch('/api/user/school-settings')
        const responseData = await res.json()

        if (res.ok && responseData?.data) {
          const settings = responseData.data as SchoolSettings
          setState((current) => {
            const next = normalizeState({
              ...current,
              school: {
                ...current.school,
                ...settings,
              },
            })
            saveStateToStorage(next)
            return next
          })
        }
      } catch (error) {
        console.error('Failed to hydrate school settings', error)
      } finally {
        setIsReady(true)
      }
    }

    void hydrate()
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = state.school.language
    }
    void i18n.changeLanguage(state.school.language)
  }, [state.school.language])

  const updateState = (updater: (current: SchoolState) => SchoolState) => {
    setState((current) => {
      const next = normalizeState(updater(current))
      saveStateToStorage(next)
      return next
    })
  }

  const postAnnouncement = (input: any) => {
    updateState((current) => ({
      ...current,
      announcements: [
        {
          id: getNextId(current.announcements),
          title: input.title,
          body: input.body,
          from: input.from,
          target: input.target,
          urgent: Boolean(input.urgent),
          date: formatTodayLabel(),
        },
        ...current.announcements,
      ],
    }))
  }

  const updateSchoolSettings = ({
    name,
    term,
    year,
    language,
  }: {
    name: string
    term: string
    year: string
    language: DashboardLanguage
  }) => {
    updateState((current) => ({
      ...current,
      school: {
        ...current.school,
        name: name.trim() || current.school.name,
        term: term.trim() || current.school.term,
        year: year.trim() || current.school.year,
        language,
      },
    }))
  }

  const saveYearGroup = (input: any) => {
    updateState((current) => {
      const existingIndex = current.yearGroups.findIndex(
        (yearGroup) => yearGroup.id === input.id,
      )

      if (existingIndex >= 0) {
        const nextYearGroups = current.yearGroups.map((yearGroup) =>
          yearGroup.id === input.id
            ? {
                ...yearGroup,
                name: input.name,
                level: input.level,
                subjects: input.subjects,
              }
            : yearGroup,
        )

        return {
          ...current,
          yearGroups: nextYearGroups,
          feeStructures: {
            ...current.feeStructures,
            [input.id]:
              Number(input.feeTotal) ||
              current.feeStructures[input.id] ||
              current.feeStructures[String(input.id)] ||
              3000,
          },
        }
      }

      const nextId = getNextId(current.yearGroups)
      const colorPair = getColorPair(current.yearGroups.length)

      return {
        ...current,
        yearGroups: [
          ...current.yearGroups,
          {
            id: nextId,
            name: input.name,
            level: input.level,
            students: 0,
            subjects: input.subjects,
            color: colorPair.color,
            bg: colorPair.bg,
          },
        ],
        timetable: {
          ...current.timetable,
          [nextId]: buildDefaultTimetable({
            id: nextId,
            subjects: input.subjects,
          }),
        },
        feeStructures: {
          ...current.feeStructures,
          [nextId]: input.feeTotal || 3000,
        },
      }
    })
  }

  const assignTeachersToYear = ({ yearId, teacherIds }: any) => {
    updateState((current) => ({
      ...current,
      teachers: current.teachers.map((teacher) => {
        const hasYear = teacher.years.includes(yearId)
        const shouldHaveYear = teacherIds.includes(teacher.id)

        if (hasYear === shouldHaveYear) {
          return teacher
        }

        return {
          ...teacher,
          years: shouldHaveYear
            ? Array.from(new Set([...teacher.years, yearId])).sort(
                (a, b) => a - b,
              )
            : teacher.years.filter(
                (assignedYearId) => assignedYearId !== yearId,
              ),
        }
      }),
    }))
  }

  const enrolStudentsToYear = ({ yearId, studentIds }: any) => {
    updateState((current) => ({
      ...current,
      students: current.students.map((student) =>
        studentIds.includes(student.id)
          ? {
              ...student,
              year: yearId,
            }
          : student,
      ),
    }))
  }

  const addTeacher = ({ name, email, subjects, years }: any) => {
    updateState((current) => {
      const colorPair = getColorPair(current.teachers.length)

      return {
        ...current,
        teachers: [
          ...current.teachers,
          {
            id: getNextId(current.teachers),
            name,
            initials: getInitials(name),
            color: colorPair.color,
            subjects,
            years,
            email,
            status: 'Active',
          },
        ],
      }
    })
  }

  const addStudent = ({ name, email, year, feeTotal }: any) => {
    updateState((current) => {
      const colorPair = getColorPair(current.students.length)
      const nextId = getNextId(current.students)

      return {
        ...current,
        students: [
          ...current.students,
          {
            id: nextId,
            name,
            initials: getInitials(name),
            color: colorPair.color,
            year,
            email,
            fees: {
              total: feeTotal,
              paid: 0,
            },
            att: 100,
          },
        ],
        attendance: {
          ...current.attendance,
          [nextId]: Array.from({ length: 20 }, () => 'P'),
        },
      }
    })
  }

  const addPublication = ({
    name,
    year,
    subject,
    published,
    teacherId,
  }: any) => {
    updateState((current) => ({
      ...current,
      publications: [
        {
          id: getNextId(current.publications),
          name,
          year,
          subject,
          published,
          date: formatTodayLabel(),
          teacherId,
        },
        ...current.publications,
      ],
    }))
  }

  const togglePublication = (publicationId: number) => {
    updateState((current) => ({
      ...current,
      publications: current.publications.map((publication) =>
        publication.id === publicationId
          ? { ...publication, published: !publication.published }
          : publication,
      ),
    }))
  }

  const saveAttendance = ({ statusesByStudent }: any) => {
    updateState((current) => {
      const nextAttendance = { ...current.attendance }

      Object.entries(statusesByStudent).forEach(([studentId, status]) => {
        const existingRecord = nextAttendance[String(studentId)] as
          | string[]
          | undefined
        nextAttendance[String(studentId)] = [
          ...(existingRecord ?? []),
          String(status).charAt(0).toUpperCase(),
        ].slice(-20)
      })

      return {
        ...current,
        attendance: nextAttendance,
      }
    })
  }

  const saveFeeStructures = (structures: Record<string, number>) => {
    updateState((current) => ({
      ...current,
      feeStructures: {
        ...current.feeStructures,
        ...structures,
      },
    }))
  }

  const saveTimetableSlot = ({ yearId, day, periodIndex, subject }: any) => {
    updateState((current) => {
      const yearSchedule =
        (current.timetable[String(yearId)] as
          | Record<string, string[]>
          | undefined) ??
        buildDefaultTimetable(
          current.yearGroups.find((yearGroup) => yearGroup.id === yearId),
        )
      const existingDay = yearSchedule[day] as string[] | undefined
      const nextDay = [...(existingDay ?? Array.from({ length: 5 }, () => '-'))]
      nextDay[periodIndex] = subject

      return {
        ...current,
        timetable: {
          ...current.timetable,
          [yearId]: {
            ...yearSchedule,
            [day]: nextDay,
          },
        },
      }
    })
  }

  const saveGrade = ({
    studentId,
    subject,
    midTerm,
    assignmentAvg,
    teacher,
    comment,
  }: any) => {
    updateState((current) => {
      const score = Math.round(
        Number(midTerm) * 0.6 + Number(assignmentAvg) * 0.4,
      )
      const nextEntry = {
        subject,
        score,
        grade: scoreLetter(score),
        teacher,
        midTerm: Number(midTerm),
        assignmentAvg: Number(assignmentAvg),
        comment,
      }
      const existingGrades =
        (current.grades[String(studentId)] as any[] | undefined) ?? []
      const existingIndex = existingGrades.findIndex(
        (grade) => grade.subject === subject,
      )

      const nextGrades =
        existingIndex >= 0
          ? existingGrades.map((grade, index) =>
              index === existingIndex ? nextEntry : grade,
            )
          : [...existingGrades, nextEntry]

      return {
        ...current,
        grades: {
          ...current.grades,
          [studentId]: nextGrades,
        },
      }
    })
  }

  const resetDemoData = () => {
    const seedState = createSeedState()
    setState(seedState)
    saveStateToStorage(seedState)
  }

  const contextValue: SchoolDataContextValue = {
    ...state,
    isReady,
    subjectOptions: getSubjectOptionsFromState(state),
    updateSchoolSettings,
    resetDemoData,
    postAnnouncement,
    saveYearGroup,
    assignTeachersToYear,
    enrolStudentsToYear,
    addTeacher,
    addStudent,
    addPublication,
    togglePublication,
    saveAttendance,
    saveFeeStructures,
    saveTimetableSlot,
    saveGrade,
  }

  return (
    <SchoolDataContext.Provider value={contextValue}>
      {children}
    </SchoolDataContext.Provider>
  )
}

export function useSchoolData() {
  const context = useContext(SchoolDataContext)

  if (!context) {
    throw new Error('useSchoolData must be used within a SchoolDataProvider')
  }

  return context
}
