import useUserStore from '#/components/store/UserStore.ts'
import type { Timetable, YearGroup } from '#/types/Types.ts'

export default function useCurrentStudent() {
  const user = useUserStore().user

  // We strictly rely on backend data now.
  if (!user || user.role !== 'STUDENT') {
    return null
  }

  // Define sensible empty defaults if the student hasn't been assigned correctly yet
  // This prevents the dashboard from crashing while waiting for admin configuration.
  const emptyYearGroup: YearGroup = {
    id: 0,
    name: 'Unassigned',
    level: 'Primary',
    subjects: [],
    fees: [],
  }

  const hasRealData = !!user.enrolledYearGroup

  const yearGroupMapping = hasRealData
    ? user.enrolledYearGroup!
    : emptyYearGroup

  const yearGroup = {
    ...yearGroupMapping,
    subjects: hasRealData
      ? yearGroupMapping.subjects?.map((s) => s.name) || []
      : [],
  }

  const feeItems =
    hasRealData && yearGroupMapping.fees
      ? yearGroupMapping.fees.map((fee) => {
          const payment = fee.payments?.find(
            (entry) => entry.studentId === user.id,
          )
          const paid = payment?.amountPaid || 0
          return {
            id: fee.id,
            title: fee.title,
            description: fee.description || '',
            amount: fee.amount,
            paid,
            remaining: Math.max(fee.amount - paid, 0),
            amountInWords: payment?.amountInWords || '',
            isFullyPaid: payment?.isFullyPaid || paid >= fee.amount,
          }
        })
      : []

  const totalFees = feeItems.reduce((sum, fee) => sum + fee.amount, 0)
  const totalPaid = feeItems.reduce((sum, fee) => sum + fee.paid, 0)

  const attendanceCount = user.attendance?.length || 0
  const presentCount =
    user.attendance?.filter((a) => a.status === 'P').length || 0

  const student = {
    ...user,
    year: yearGroup.id,
    att:
      attendanceCount > 0
        ? Math.round((presentCount / attendanceCount) * 100)
        : 0,
    fees: {
      total: totalFees,
      paid: totalPaid,
      items: feeItems,
    },
  }

  const studentGrades =
    user.grades?.map((g) => ({
      subject: g.subject?.name || 'Unknown',
      score: g.score,
      grade: g.grade,
      teacher: g.teacher?.name || 'Teacher',
    })) || []

  // Assuming announcements and timetables might come from yearGroup eventually,
  // but if they aren't included yet, map to empty arrays to prevent breaks.
  // Note: we'd need to make sure authControllers is returning these.
  const studentAnnouncements: any[] =
    hasRealData && 'announcements' in yearGroupMapping
      ? (yearGroupMapping as any).announcements
      : []

  const rawTimetable: Timetable[] =
    hasRealData && 'timetables' in yearGroupMapping
      ? (yearGroupMapping as any).timetables
      : []

  // Group timetable by day -> index array as required by UI
  // { 'Monday': ['Math', 'Science', ...], 'Tuesday': [...] }
  const studentTimetable: Record<string, string[]> = {}
  if (Array.isArray(rawTimetable)) {
    rawTimetable.forEach((t) => {
      if (!studentTimetable[t.day]) {
        // pre-fill with dashes
        studentTimetable[t.day] = ['-', '-', '-', '-', '-']
      }
      // Map periodId or order to index (simplified assumes period 1-5 maps cleanly)
      // Assuming Period 1-3 = index 0-2, Break is skipped, Period 4-5 = index 3-4
      // A more perfect mapping requires the period.label, but this will work for the visual.
      let slotIndex = 0
      if (t.period?.label === 'Period 1') slotIndex = 0
      else if (t.period?.label === 'Period 2') slotIndex = 1
      else if (t.period?.label === 'Period 3') slotIndex = 2
      else if (t.period?.label === 'Period 4') slotIndex = 3
      else if (t.period?.label === 'Period 5') slotIndex = 4

      if (t.subject) {
        studentTimetable[t.day][slotIndex] = t.subject.name
      }
    })
  }

  const teachers =
    hasRealData && 'teachers' in yearGroupMapping
      ? ((yearGroupMapping as any).teachers ?? [])
      : []

  return {
    student,
    yearGroup,
    teachers,
    studentAnnouncements,
    studentGrades,
    studentTimetable,
    studentTimetableSlots: rawTimetable,
    subjects: yearGroup.subjects,
  }
}
