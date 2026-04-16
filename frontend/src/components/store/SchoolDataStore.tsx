'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { DashboardLanguage, SchoolSettings } from '#/types/Types'
import i18n from '#/components/dashboard/i18n.instance'
import { useGetSchoolSettings } from '#/components/query/AdminQuery'
const ANNOUNCEMENTS: any[] = []
const ATTENDANCE: Record<string, string[]> = {}
const GRADES: Record<string, any[]> = {}
const PERIODS = [
  { id: 1, name: 'Period 1', start: '08:00', end: '09:00', isBreak: false },
  { id: 2, name: 'Period 2', start: '09:00', end: '10:00', isBreak: false },
  { id: 3, name: 'Break', start: '10:00', end: '10:30', isBreak: true },
  { id: 4, name: 'Period 3', start: '10:30', end: '11:30', isBreak: false },
  { id: 5, name: 'Period 4', start: '11:30', end: '12:30', isBreak: false },
]
const PUBLICATIONS: any[] = []

const SCHOOL = {
  name: 'Sunridge International School',
  description: 'Where Education meets performance',
  term: 'Term 2',
  year: '2026',
  language: 'en' as DashboardLanguage,
  logo: '/logo.svg',
}
const STUDENTS: any[] = []
const SUBJECT_COLORS: Record<string, string> = {}
const TEACHERS: any[] = []
const TIMETABLE: Record<string, Record<string, string[]>> = {}
const YEAR_GROUPS: any[] = []

const scoreLetter = (score: number) => {
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

const STORAGE_KEY = 'school_dashboard_state' // Normalized key

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

// --- Helper Functions --- //

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

function normalizeState(input: Partial<SchoolState>): SchoolState {
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
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function readStateFromStorage(): SchoolState | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return normalizeState(JSON.parse(raw))
  } catch {
    return null
  }
}

// --- Zustand Store Setup --- //

type SchoolStoreValue = SchoolState & {
  isReady: boolean
  init: () => Promise<void>
  updateSchoolSettings: (input: {
    name: string
    term: string
    year: string
    description: string
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

export const useSchoolStore = create<SchoolStoreValue>((set, get) => {
  // Internal helper to handle normalization and local storage
  const updateState = (updater: (current: SchoolState) => SchoolState) => {
    set((state) => {
      const next = normalizeState(updater(state))
      saveStateToStorage(next)
      return next
    })
  }

  return {
    ...createSeedState(),
    isReady: false,

    init: async () => {
      const storedState = readStateFromStorage()
      if (storedState) {
        set({ ...storedState })
      }

      try {
        const res = await fetch('/api/admin/school-settings')
        const responseData = await res.json()

        if (res.ok && responseData?.data) {
          const settings = responseData.data as SchoolSettings
          updateState((current) => ({
            ...current,
            school: {
              ...current.school,
              ...settings,
              logo: settings.logo ?? current.school.logo,
              description: settings.description ?? current.school.description,
            },
          }))
        }
      } catch (error) {
        console.error('Failed to hydrate school settings', error)
      } finally {
        set({ isReady: true })
      }
    },

    updateSchoolSettings: ({ name, term, year, language }) => {
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
    },

    postAnnouncement: (input) => {
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
    },

    saveYearGroup: (input) => {
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
    },

    assignTeachersToYear: ({ yearId, teacherIds }) => {
      updateState((current) => ({
        ...current,
        teachers: current.teachers.map((teacher) => {
          const hasYear = teacher.years.includes(yearId)
          const shouldHaveYear = teacherIds.includes(teacher.id)

          if (hasYear === shouldHaveYear) return teacher

          return {
            ...teacher,
            years: shouldHaveYear
              ? Array.from(new Set([...teacher.years, yearId])).sort(
                  (a, b) => a - b,
                )
              : teacher.years.filter(
                  (assignedYearId: any) => assignedYearId !== yearId,
                ),
          }
        }),
      }))
    },

    enrolStudentsToYear: ({ yearId, studentIds }) => {
      updateState((current) => ({
        ...current,
        students: current.students.map((student) =>
          studentIds.includes(student.id)
            ? { ...student, year: yearId }
            : student,
        ),
      }))
    },

    addTeacher: ({ name, email, subjects, years }) => {
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
    },

    addStudent: ({ name, email, year, feeTotal }) => {
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
    },

    addPublication: ({ name, year, subject, published, teacherId }) => {
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
    },

    togglePublication: (publicationId) => {
      updateState((current) => ({
        ...current,
        publications: current.publications.map((publication) =>
          publication.id === publicationId
            ? { ...publication, published: !publication.published }
            : publication,
        ),
      }))
    },

    saveAttendance: ({ statusesByStudent }) => {
      updateState((current) => {
        const nextAttendance = { ...current.attendance }

        Object.entries(statusesByStudent).forEach(([studentId, status]) => {
          const existingRecord = nextAttendance[String(studentId)]
          nextAttendance[String(studentId)] = [
            ...(existingRecord ?? []),
            String(status).charAt(0).toUpperCase(),
          ].slice(-20)
        })

        return { ...current, attendance: nextAttendance }
      })
    },

    saveFeeStructures: (structures) => {
      updateState((current) => ({
        ...current,
        feeStructures: {
          ...current.feeStructures,
          ...structures,
        },
      }))
    },

    saveTimetableSlot: ({ yearId, day, periodIndex, subject }) => {
      updateState((current) => {
        const yearSchedule =
          current.timetable[String(yearId)] ??
          buildDefaultTimetable(
            current.yearGroups.find((yearGroup) => yearGroup.id === yearId),
          )
        const existingDay = yearSchedule[day]
        const nextDay = [
          ...(existingDay ?? Array.from({ length: 5 }, () => '-')),
        ]
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
    },

    saveGrade: ({
      studentId,
      subject,
      midTerm,
      assignmentAvg,
      teacher,
      comment,
    }) => {
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
        const existingGrades = current.grades[String(studentId)] ?? []
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
    },

    resetDemoData: () => {
      const seedState = createSeedState()
      set(seedState)
      saveStateToStorage(seedState)
    },
  }
})

// --- Integration Wrappers --- //

/**
 * Acts as a logical initializer for hydration and language syncing.
 * By keeping this component, you avoid breaking changes in layout wrappers.
 */
export function SchoolDataProvider({ children }: { children: ReactNode }) {
  const { init, language, updateSchoolSettings, schoolName } = useSchoolStore(
    useShallow((state) => ({
      init: state.init,
      language: state.school.language,
      updateSchoolSettings: state.updateSchoolSettings,
      schoolName: state.school.name,
    })),
  )

  const { data: schoolSettings } = useGetSchoolSettings()

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    if (schoolSettings) {
      updateSchoolSettings({
        name: schoolSettings.name,
        term: schoolSettings.term,
        year: schoolSettings.year,
        description: schoolSettings.description,
        language: schoolSettings.language as DashboardLanguage,
      })
    }
  }, [schoolSettings, updateSchoolSettings])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
      document.title = schoolName
    }
    void i18n.changeLanguage(language)
  }, [language, schoolName])

  return <>{children}</>
}

export function useSchoolData() {
  const store = useSchoolStore()

  return {
    ...store,
    subjectOptions: getSubjectOptionsFromState(store),
  }
}
