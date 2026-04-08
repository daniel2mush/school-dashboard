import {
  Blocks,
  CalendarRange,
  Layers3,
  MoreHorizontal,
  Sparkles,
  X,
  Plus,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import styles from './AdminTimetable.module.scss'

import { Trash2 } from 'lucide-react'
import {
  useUpsertTimetableSlot,
  useCreatePeriod,
  useDeletePeriod,
  useAssignPeriodToYearGroup,
  useGetSchoolStructure,
  type AdminYearGroupStructure,
} from '#/components/query/AdminQuery'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

type EditState = {
  yearGroup: AdminYearGroupStructure
  day: string
  periodId: number
}

function getPeriods(yearGroup: AdminYearGroupStructure) {
  const periods = Array.from(
    new Map(
      yearGroup.timetables
        .filter((slot) => slot.period && !slot.period.isBreak)
        .map((slot) => [
          slot.periodId,
          {
            id: slot.periodId,
            label: slot.period.label,
            startTime: slot.period.startTime,
            endTime: slot.period.endTime,
          },
        ]),
    ).values(),
  ).sort((a, b) => {
    const timeA = a.startTime.split(':').map(Number)
    const timeB = b.startTime.split(':').map(Number)
    if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0]
    return timeA[1] - timeB[1]
  })

  return periods
}

function TimetableEditModal({
  editState,
  onClose,
}: {
  editState: EditState
  onClose: () => void
}) {
  const { mutate, isPending } = useUpsertTimetableSlot()
  const periods = useMemo(
    () => getPeriods(editState.yearGroup),
    [editState.yearGroup],
  )
  const [day, setDay] = useState(editState.day)
  const [periodId, setPeriodId] = useState(editState.periodId)
  const [subjectId, setSubjectId] = useState<string>('')
  const [teacherId, setTeacherId] = useState<string>('')

  const currentSlot = useMemo(
    () =>
      editState.yearGroup.timetables.find(
        (slot) => slot.day === day && slot.periodId === periodId,
      ),
    [day, editState.yearGroup.timetables, periodId],
  )

  useEffect(() => {
    setSubjectId(currentSlot?.subjectId ? String(currentSlot.subjectId) : '')
    setTeacherId(currentSlot?.teacherId ? String(currentSlot.teacherId) : '')
  }, [currentSlot])

  const currentPeriod = periods.find((period) => period.id === periodId)

  const save = () => {
    mutate(
      {
        yearGroupId: editState.yearGroup.id,
        day,
        periodId,
        subjectId: subjectId ? Number(subjectId) : null,
        teacherId: teacherId ? Number(teacherId) : null,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalCard}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalEyebrow}>Edit timetable slot</div>
            <h3 className={styles.modalTitle}>{editState.yearGroup.name}</h3>
            <p className={styles.modalCopy}>
              Update the subject, assigned teacher, and confirm the real time
              block for this lesson.
            </p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Close edit dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalGrid}>
          <label className={styles.field}>
            <span>Day</span>
            <select
              value={day}
              onChange={(event) => setDay(event.target.value)}
            >
              {DAYS.map((dayOption) => (
                <option key={dayOption} value={dayOption}>
                  {dayOption}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Period</span>
            <select
              value={String(periodId)}
              onChange={(event) => setPeriodId(Number(event.target.value))}
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label} ({period.startTime} - {period.endTime})
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Subject</span>
            <select
              value={subjectId}
              onChange={(event) => {
                const nextSubjectId = event.target.value
                setSubjectId(nextSubjectId)
                if (!nextSubjectId) {
                  setTeacherId('')
                }
              }}
            >
              <option value="">Free slot</option>
              {editState.yearGroup.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Teacher</span>
            <select
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
              disabled={!subjectId}
            >
              <option value="">
                {subjectId ? 'Teacher unassigned' : 'Select subject first'}
              </option>
              {editState.yearGroup.teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.slotPreview}>
          <div className={styles.slotPreviewLabel}>Slot preview</div>
          <strong className={styles.slotPreviewValue}>
            {subjectId
              ? editState.yearGroup.subjects.find(
                  (subject) => subject.id === Number(subjectId),
                )?.name
              : 'Free slot'}
          </strong>
          <span className={styles.slotPreviewMeta}>
            {currentPeriod
              ? `${currentPeriod.startTime} - ${currentPeriod.endTime}`
              : 'Time unavailable'}
            {subjectId
              ? ` · ${
                  editState.yearGroup.teachers.find(
                    (teacher) => teacher.id === Number(teacherId),
                  )?.name || 'Teacher unassigned'
                }`
              : ''}
          </span>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={save}
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save slot'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ManagePeriodsModal({
  yearGroup,
  onClose,
}: {
  yearGroup: AdminYearGroupStructure
  onClose: () => void
}) {
  const { mutate: createPeriod, isPending: isCreating } = useCreatePeriod()
  const { mutate: deletePeriod, isPending: isDeleting } = useDeletePeriod()
  const { mutate: assignPeriod, isPending: isAssigning } =
    useAssignPeriodToYearGroup()
  const currentPeriods = getPeriods(yearGroup)

  const [newLabel, setNewLabel] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')

  const handleAdd = () => {
    if (!newLabel || !newStart || !newEnd) return
    createPeriod(
      { label: newLabel, startTime: newStart, endTime: newEnd },
      {
        onSuccess: (newPeriod) => {
          assignPeriod({ yearGroupId: yearGroup.id, periodId: newPeriod.id })
          setNewLabel('')
          setNewStart('')
          setNewEnd('')
        },
      },
    )
  }

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalCard}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalEyebrow}>Manage Periods</div>
            <h3 className={styles.modalTitle}>{yearGroup.name}</h3>
            <p className={styles.modalCopy}>
              Define the specific teaching blocks for this year group. Each year
              group can have a custom count of periods.
            </p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.periodList}>
          <div className={styles.periodListHeader}>
            <span>Label</span>
            <span>Time Block</span>
            <span>Actions</span>
          </div>
          {currentPeriods.map((p) => (
            <div key={p.id} className={styles.periodItem}>
              <span className={styles.periodLabel}>{p.label}</span>
              <span className={styles.periodTime}>
                {p.startTime} - {p.endTime}
              </span>
              <div className={styles.periodActions}>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => deletePeriod(p.id)}
                  disabled={isDeleting}
                  title="Delete period"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.addPeriodForm}>
          <div className={styles.modalEyebrow}>Add new period</div>
          <div className={styles.modalGrid}>
            <label className={styles.field}>
              <span>Label</span>
              <input
                type="text"
                placeholder="e.g. Period 6"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Start Time</span>
              <input
                type="text"
                placeholder="e.g. 14:00"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>End Time</span>
              <input
                type="text"
                placeholder="e.g. 15:00"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '1rem', width: '100%' }}
            onClick={handleAdd}
            disabled={
              isCreating || isAssigning || !newLabel || !newStart || !newEnd
            }
          >
            <Plus size={16} />
            {isCreating || isAssigning
              ? 'Adding...'
              : 'Add Period to Year Group'}
          </button>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminTimetable() {
  const { data: yearGroups, isLoading } = useGetSchoolStructure()
  const [editState, setEditState] = useState<EditState | null>(null)
  const [managePeriodsYearGroup, setManagePeriodsYearGroup] =
    useState<AdminYearGroupStructure | null>(null)
  const [selectedYearGroupId, setSelectedYearGroupId] = useState<number | null>(
    null,
  )

  useEffect(() => {
    if (!yearGroups || yearGroups.length === 0) {
      setSelectedYearGroupId(null)
      return
    }

    setSelectedYearGroupId((current) => {
      if (current === null) return yearGroups[0].id
      const stillExists = yearGroups.some((yearGroup) => yearGroup.id === current)
      return stillExists ? current : yearGroups[0].id
    })
  }, [yearGroups])

  if (isLoading || !yearGroups) {
    return (
      <div className={styles.view}>Loading school schedule registry...</div>
    )
  }

  const selectedYearGroup =
    yearGroups.find((yearGroup) => yearGroup.id === selectedYearGroupId) ||
    yearGroups[0] ||
    null

  const periods = selectedYearGroup ? getPeriods(selectedYearGroup) : []

  const totalScheduledLessons = selectedYearGroup
    ? selectedYearGroup.timetables.filter((slot) => slot.subject?.name).length
    : 0

  const scheduledSubjects = selectedYearGroup
    ? new Set(
        selectedYearGroup.timetables
          .map((slot) => slot.subject?.name)
          .filter((subject): subject is string => Boolean(subject)),
      )
    : new Set<string>()

  const activeDays = selectedYearGroup
    ? new Set(
      selectedYearGroup.timetables
        .filter((slot) => slot.subject?.name)
        .map((slot) => slot.day),
      )
    : new Set<string>()

  const timetableSlotsByDayAndPeriod = selectedYearGroup
    ? DAYS.reduce(
        (acc, day) => {
          acc[day] = {}
          return acc
        },
        {} as Record<
          string,
          Record<number, (typeof selectedYearGroup.timetables)[number]>
        >,
      )
    : {}

  if (selectedYearGroup) {
    selectedYearGroup.timetables.forEach((slot) => {
      timetableSlotsByDayAndPeriod[slot.day][slot.periodId] = slot
    })
  }

  if (!selectedYearGroup) {
    return <div className={styles.view}>No year groups available.</div>
  }

  return (
    <section className={styles.view}>
      <header className={styles.pageHero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <Sparkles size={14} />
            Institutional oversight
          </div>
          <h2 className={styles.title}>Year group timetable</h2>
          <p className={styles.copy}>
            Select a class, review its weekly schedule, and click any slot to
            assign or change the lesson details.
          </p>
        </div>

        <div className={styles.heroBadge}>
          <Layers3 size={18} />
          <span>{yearGroups.length} classes</span>
        </div>
      </header>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <CalendarRange size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Selected class</div>
            <div className={styles.summaryValue}>{selectedYearGroup.name}</div>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Blocks size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Scheduled lessons</div>
            <div className={styles.summaryValue}>{totalScheduledLessons}</div>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Layers3 size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Subjects in use</div>
            <div className={styles.summaryValue}>{scheduledSubjects.size}</div>
          </div>
        </article>
      </section>

      <section className={styles.selectorRow}>
        <div className={styles.selectorInfo}>
          <div className={styles.selectorLabel}>Choose class</div>
          <div className={styles.selectorCopy}>
            Switch between year groups to edit one timetable at a time.
          </div>
        </div>

        <div className={styles.selectorActions}>
          <select
            className={styles.classSelect}
            value={String(selectedYearGroup.id)}
            onChange={(event) => setSelectedYearGroupId(Number(event.target.value))}
          >
            {yearGroups.map((yearGroup) => (
              <option key={yearGroup.id} value={yearGroup.id}>
                {yearGroup.name} {yearGroup.roomNumber ? `- Room ${yearGroup.roomNumber}` : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles.manageButton}
            onClick={() => setManagePeriodsYearGroup(selectedYearGroup)}
          >
            <MoreHorizontal size={16} />
            Manage periods
          </button>
        </div>
      </section>

      <div className={styles.tableShell}>
        <div className={styles.tableHeader}>
          <div>
            <h2>{selectedYearGroup.name} timetable</h2>
            <p>
              Click any cell to assign a subject or teacher. Highlighted days
              show where this class is already scheduled.
            </p>
          </div>
          <div className={styles.tableLegend}>
            <span>
              <i className={styles.legendActive} />
              Scheduled
            </span>
            <span>
              <i className={styles.legendIdle} />
              Free
            </span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.timetableTable}>
            <thead>
              <tr>
                <th className={styles.timeHeader}>Period</th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`${styles.dayHeader} ${
                      activeDays.has(day) ? styles.dayHeaderActive : ''
                    }`}
                  >
                    <span className={styles.dayLabel}>{day}</span>
                    <span className={styles.dayMeta}>
                      {activeDays.has(day) ? 'Has lessons' : 'No lessons'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {periods.map((period) => (
                <tr key={period.id}>
                  <td className={styles.periodCell}>
                    <div className={styles.periodLabel}>{period.label}</div>
                    <div className={styles.periodTime}>
                      {period.startTime} - {period.endTime}
                    </div>
                  </td>

                  {DAYS.map((day) => {
                    const slot = timetableSlotsByDayAndPeriod[day]?.[period.id]
                    const isScheduled = Boolean(slot?.subject?.name)

                    return (
                      <td
                        key={`${day}-${period.id}`}
                        className={`${styles.slotCell} ${
                          isScheduled ? styles.slotCellActive : styles.slotCellIdle
                        }`}
                        onClick={() =>
                          setEditState({
                            yearGroup: selectedYearGroup,
                            day,
                            periodId: period.id,
                          })
                        }
                      >
                        {slot ? (
                          <div className={styles.slotContent}>
                            <div className={styles.slotSubject}>
                              {slot.subject?.name || 'Free'}
                            </div>
                            <div className={styles.slotMeta}>
                              <span>{slot.teacher?.name || 'Teacher unassigned'}</span>
                              <span className={styles.dot}>•</span>
                              <span>{selectedYearGroup.roomNumber || 'Room TBA'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className={styles.emptyMark}>Click to assign</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editState ? (
        <TimetableEditModal
          editState={editState}
          onClose={() => setEditState(null)}
        />
      ) : null}

      {managePeriodsYearGroup ? (
        <ManagePeriodsModal
          yearGroup={managePeriodsYearGroup}
          onClose={() => setManagePeriodsYearGroup(null)}
        />
      ) : null}
    </section>
  )
}
