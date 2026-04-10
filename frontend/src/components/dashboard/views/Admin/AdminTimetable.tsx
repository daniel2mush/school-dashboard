import {
  Blocks,
  CalendarRange,
  Layers3,
  MoreHorizontal,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import useUserStore from '#/components/store/UserStore'
import styles from './AdminTimetable.module.scss'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import {
  useUpsertTimetableSlot,
  useCreatePeriod,
  useDeletePeriod,
  useAssignPeriodToYearGroup,
  useGetSchoolStructure,
} from '#/components/query/AdminQuery'
import type { AdminYearGroupStructure } from '#/components/query/AdminQuery'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

function getDayTranslationKey(day: string) {
  return `admin.timetable.days.${day.toLowerCase()}` as const
}

type EditState = {
  yearGroup: AdminYearGroupStructure
  day: string
  periodId: number
}

function getPeriods(yearGroup: AdminYearGroupStructure) {
  const periods = Array.from(
    new Map(
      yearGroup.timetables
        .filter((slot) => !slot.period.isBreak)
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
  const { t } = useDashboardTranslation()
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
            <div className={styles.modalEyebrow}>
              {t('admin.timetable.editSlot')}
            </div>
            <h3 className={styles.modalTitle}>{editState.yearGroup.name}</h3>
            <p className={styles.modalCopy}>
              {t('admin.timetable.editSlotCopy')}
            </p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label={t('admin.timetable.closeEditDialog')}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalGrid}>
          <label className={styles.field}>
            <span>{t('admin.timetable.fieldDay')}</span>
            <select
              value={day}
              onChange={(event) => setDay(event.target.value)}
            >
              {DAYS.map((dayOption) => (
                <option key={dayOption} value={dayOption}>
                  {t(getDayTranslationKey(dayOption))}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>{t('admin.timetable.fieldPeriod')}</span>
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
            <span>{t('admin.timetable.fieldSubject')}</span>
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
              <option value="">{t('admin.timetable.freeSlot')}</option>
              {editState.yearGroup.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>{t('admin.timetable.fieldTeacher')}</span>
            <select
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
              disabled={!subjectId}
            >
              <option value="">
                {subjectId
                  ? t('admin.timetable.teacherUnassigned')
                  : t('admin.timetable.selectSubjectFirst')}
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
          <div className={styles.slotPreviewLabel}>
            {t('admin.timetable.slotPreview')}
          </div>
          <strong className={styles.slotPreviewValue}>
            {subjectId
              ? editState.yearGroup.subjects.find(
                  (subject) => subject.id === Number(subjectId),
                )?.name
              : t('admin.timetable.freeSlot')}
          </strong>
          <span className={styles.slotPreviewMeta}>
            {currentPeriod
              ? `${currentPeriod.startTime} - ${currentPeriod.endTime}`
              : t('admin.timetable.timeUnavailable')}
            {subjectId
              ? ` · ${
                  editState.yearGroup.teachers.find(
                    (teacher) => teacher.id === Number(teacherId),
                  )?.name || t('admin.timetable.teacherUnassigned')
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
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={save}
            disabled={isPending}
          >
            {isPending ? t('common.saving') : t('admin.timetable.saveSlot')}
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
  const { t } = useDashboardTranslation()
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
            <div className={styles.modalEyebrow}>
              {t('admin.timetable.managePeriodsTitle')}
            </div>
            <h3 className={styles.modalTitle}>{yearGroup.name}</h3>
            <p className={styles.modalCopy}>
              {t('admin.timetable.managePeriodsCopy')}
            </p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label={t('admin.timetable.closeDialog')}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.periodList}>
          <div className={styles.periodListHeader}>
            <span>{t('admin.timetable.fieldLabel')}</span>
            <span>{t('admin.timetable.fieldTimeBlock')}</span>
            <span>{t('admin.timetable.fieldActions')}</span>
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
                  title={t('admin.timetable.deletePeriod')}
                  aria-label={t('admin.timetable.deletePeriod')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.addPeriodForm}>
          <div className={styles.modalEyebrow}>
            {t('admin.timetable.addPeriodTitle')}
          </div>
          <div className={styles.modalGrid}>
            <label className={styles.field}>
              <span>{t('admin.timetable.fieldLabel')}</span>
              <input
                type="text"
                placeholder={t('admin.timetable.placeholderPeriodLabel')}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>{t('admin.timetable.fieldStartTime')}</span>
              <input
                type="text"
                placeholder={t('admin.timetable.placeholderStartTime')}
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>{t('admin.timetable.fieldEndTime')}</span>
              <input
                type="text"
                placeholder={t('admin.timetable.placeholderEndTime')}
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
              ? t('admin.timetable.adding')
              : t('admin.timetable.addPeriodToYearGroup')}
          </button>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className="btn" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminTimetable() {
  const { t } = useDashboardTranslation()
  const user = useUserStore((state) => state.user)
  const { data: yearGroups, isLoading } = useGetSchoolStructure()
  const [editState, setEditState] = useState<EditState | null>(null)
  const [managePeriodsYearGroup, setManagePeriodsYearGroup] =
    useState<AdminYearGroupStructure | null>(null)
  const [selectedYearGroupId, setSelectedYearGroupId] = useState<number | null>(
    null,
  )

  // const names = yearGroups?.map((data) => data.subjects)

  // console.log(names, 'Subjects')
  useEffect(() => {
    if (!yearGroups || yearGroups.length === 0) {
      setSelectedYearGroupId(null)
      return
    }

    setSelectedYearGroupId((current) => {
      if (current === null) return yearGroups[0].id
      const stillExists = yearGroups.some(
        (yearGroup) => yearGroup.id === current,
      )
      return stillExists ? current : yearGroups[0].id
    })
  }, [yearGroups])

  if (isLoading || !yearGroups) {
    return <div className={styles.view}>{t('admin.timetable.loading')}</div>
  }

  if (yearGroups.length === 0) {
    return (
      <div className={styles.view}>{t('admin.timetable.noYearGroups')}</div>
    )
  }

  const selectedYearGroup =
    yearGroups.find((yearGroup) => yearGroup.id === selectedYearGroupId) ||
    yearGroups[0]

  const periods = getPeriods(selectedYearGroup)

  const totalScheduledLessons = selectedYearGroup.timetables.filter((slot) =>
    Boolean(slot.subject?.name),
  ).length

  const scheduledSubjects = new Set(
    selectedYearGroup.timetables
      .map((slot) => slot.subject?.name)
      .filter((subject): subject is string => Boolean(subject)),
  )

  const activeDays = new Set(
    selectedYearGroup.timetables
      .filter((slot) => Boolean(slot.subject?.name))
      .map((slot) => slot.day),
  )

  const timetableSlotsByDayAndPeriod = DAYS.reduce(
    (acc, day) => {
      acc[day] = {}
      return acc
    },
    {} as Record<
      string,
      Partial<Record<number, (typeof selectedYearGroup.timetables)[number]>>
    >,
  )

  selectedYearGroup.timetables.forEach((slot) => {
    timetableSlotsByDayAndPeriod[slot.day][slot.periodId] = slot
  })

  console.log(activeDays, 'Active days')
  console.log(scheduledSubjects, 'Schedule Subjects')
  console.log(totalScheduledLessons, 'Total Scheduled lesson')

  return (
    <section className={styles.view}>
      <header className={styles.pageHero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <Sparkles size={14} />
            {t('admin.timetable.eyebrow')}
          </div>
          <h2 className={styles.title}>{t('admin.timetable.title')}</h2>
          <p className={styles.copy}>{t('admin.timetable.copy')}</p>
        </div>

        <div className={styles.heroBadge}>
          <Layers3 size={18} />
          <span>
            {t('admin.timetable.classesCount').replace(
              '{count}',
              String(yearGroups.length),
            )}
          </span>
        </div>
      </header>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <CalendarRange size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>
              {t('admin.timetable.selectedClass')}
            </div>
            <div className={styles.summaryValue}>{selectedYearGroup.name}</div>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Blocks size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>
              {t('admin.timetable.scheduledLessons')}
            </div>
            <div className={styles.summaryValue}>{totalScheduledLessons}</div>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Layers3 size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>
              {t('admin.timetable.subjectsInUse')}
            </div>
            <div className={styles.summaryValue}>{scheduledSubjects.size}</div>
          </div>
        </article>
      </section>

      <section className={styles.selectorRow}>
        <div className={styles.selectorInfo}>
          <div className={styles.selectorLabel}>
            {t('admin.timetable.chooseClass')}
          </div>
          <div className={styles.selectorCopy}>
            {t('admin.timetable.chooseClassCopy')}
          </div>
        </div>

        <div className={styles.selectorActions}>
          <select
            className={styles.classSelect}
            value={String(selectedYearGroup.id)}
            onChange={(event) =>
              setSelectedYearGroupId(Number(event.target.value))
            }
          >
            {yearGroups.map((yearGroup) => (
              <option key={yearGroup.id} value={yearGroup.id}>
                {yearGroup.name}{' '}
                {yearGroup.roomNumber
                  ? t('admin.timetable.roomLabel').replace(
                      '{room}',
                      String(yearGroup.roomNumber),
                    )
                  : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles.manageButton}
            onClick={() => setManagePeriodsYearGroup(selectedYearGroup)}
          >
            <MoreHorizontal size={16} />
            {t('admin.timetable.managePeriods')}
          </button>
        </div>
      </section>

      <div className={styles.tableShell}>
        <div className={styles.tableHeader}>
          <div>
            <h2>
              {t('admin.timetable.yearGroupTimetable').replace(
                '{name}',
                selectedYearGroup.name,
              )}
            </h2>
            <p>{t('admin.timetable.tableCopy')}</p>
          </div>
          <div className={styles.tableLegend}>
            {user?.role === 'TEACHER' && (
              <span>
                <i
                  className={styles.legendHighlight}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    display: 'inline-block',
                    background:
                      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: '1px solid #047857',
                  }}
                />
                {t('admin.timetable.mySchedule')}
              </span>
            )}
            <span>
              <i className={styles.legendActive} />
              {t('admin.timetable.scheduled')}
            </span>
            <span>
              <i className={styles.legendIdle} />
              {t('admin.timetable.free')}
            </span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.timetableTable}>
            <thead>
              <tr>
                <th className={styles.timeHeader}>
                  {t('admin.timetable.period')}
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`${styles.dayHeader} ${
                      activeDays.has(day) ? styles.dayHeaderActive : ''
                    }`}
                  >
                    <span className={styles.dayLabel}>
                      {t(getDayTranslationKey(day))}
                    </span>
                    <span className={styles.dayMeta}>
                      {activeDays.has(day)
                        ? t('admin.timetable.hasLessons')
                        : t('admin.timetable.noLessons')}
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
                    const slot = timetableSlotsByDayAndPeriod[day][period.id]
                    const isScheduled = Boolean(slot?.subject?.name)
                    const isMySchedule =
                      user?.role === 'TEACHER' && slot?.teacherId === user.id

                    return (
                      <td
                        key={`${day}-${period.id}`}
                        className={`${styles.slotCell} ${
                          isMySchedule
                            ? styles.slotCellHighlight
                            : isScheduled
                              ? styles.slotCellActive
                              : styles.slotCellIdle
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
                              {slot.subject?.name || t('admin.timetable.free')}
                            </div>
                            <div className={styles.slotMeta}>
                              <span>
                                {slot.teacher?.name ||
                                  t('admin.timetable.teacherUnassigned')}
                              </span>
                              <span className={styles.dot}>•</span>
                              <span>
                                {selectedYearGroup.roomNumber
                                  ? t('admin.timetable.roomLabel').replace(
                                      '{room}',
                                      String(selectedYearGroup.roomNumber),
                                    )
                                  : t('admin.timetable.roomTBA')}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className={styles.emptyMark}>
                            {t('admin.timetable.clickToAssign')}
                          </span>
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
