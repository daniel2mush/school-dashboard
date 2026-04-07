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

  if (isLoading || !yearGroups) {
    return (
      <div className={styles.view}>Loading school schedule registry...</div>
    )
  }

  const totalScheduledLessons = yearGroups.reduce(
    (count, yearGroup) =>
      count + yearGroup.timetables.filter((slot) => slot.subject?.name).length,
    0,
  )

  const scheduledSubjects = new Set(
    yearGroups.flatMap((yearGroup) =>
      yearGroup.timetables
        .map((slot) => slot.subject?.name)
        .filter((subject): subject is string => Boolean(subject)),
    ),
  )

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>Institutional Oversight</div>
          <h2 className={styles.title}>
            A clearer view of the master timetable
          </h2>
          <p className={styles.copy}>
            Review every year group in one polished scheduling board with
            stronger hierarchy, cleaner density, and faster subject scanning.
          </p>
        </div>

        <div className={styles.heroBadge}>
          <Sparkles size={18} />
          <span>Admin schedule board</span>
        </div>
      </header>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Layers3 size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Year groups</div>
            <div className={styles.summaryValue}>{yearGroups.length}</div>
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
            <CalendarRange size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Subjects in rotation</div>
            <div className={styles.summaryValue}>{scheduledSubjects.size}</div>
          </div>
        </article>
      </section>

      <div className={styles.timetableGrid}>
        {yearGroups.map((yearGroup) => {
          const populatedSlots = yearGroup.timetables.filter(
            (slot) => slot.subject?.name,
          ).length
          const periods = getPeriods(yearGroup)

          return (
            <article key={yearGroup.id} className={styles.timetableCard}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.cardEyebrow}>{yearGroup.level}</p>
                  <h3 className={styles.cardTitle}>{yearGroup.name}</h3>
                </div>
                <div className={styles.cardActions}>
                  <span className={styles.cardBadge}>
                    {populatedSlots}/{DAYS.length * periods.length} filled
                  </span>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => setManagePeriodsYearGroup(yearGroup)}
                    title="Manage Periods"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.metaPill}>
                  Room {yearGroup.roomNumber || 'TBA'}
                </span>
                <span className={styles.metaPill}>
                  {yearGroup.subjects.length} subjects
                </span>
                <span className={styles.metaPill}>
                  {yearGroup.teachers.length} teachers
                </span>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.timetableTable}>
                  <thead>
                    <tr>
                      <th className={styles.timeHeader}>Day / Period</th>
                      {periods.map((period) => (
                        <th key={period.id} className={styles.periodHeader}>
                          <div className={styles.periodLabel}>
                            {period.label}
                          </div>
                          <div className={styles.periodTime}>
                            {period.startTime} - {period.endTime}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => (
                      <tr key={day}>
                        <td className={styles.dayCell}>
                          <span className={styles.dayLabel}>{day}</span>
                        </td>
                        {periods.map((period) => {
                          const slot = yearGroup.timetables.find(
                            (item) =>
                              item.day === day && item.periodId === period.id,
                          )
                          const subjectName = slot?.subject?.name
                          const teacherName = slot?.teacher?.name

                          return (
                            <td
                              key={`${day}-${period.id}`}
                              className={`${styles.slotCell} ${
                                subjectName ? styles.populated : styles.empty
                              }`}
                              onClick={() =>
                                setEditState({
                                  yearGroup,
                                  day,
                                  periodId: period.id,
                                })
                              }
                            >
                              <div className={styles.slotContent}>
                                <strong className={styles.subjectName}>
                                  {subjectName || 'Free'}
                                </strong>
                                <span className={styles.teacherName}>
                                  {subjectName
                                    ? teacherName || 'Teacher unassigned'
                                    : 'No teacher'}
                                </span>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          )
        })}
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
