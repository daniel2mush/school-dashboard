import type { User } from '@/types/Types'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { Input } from '@/components/ui'
import styles from './AdminYearGroups.module.scss'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import {
  useCreateYearGroup,
  useGetSubjects,
  useUpdateYearGroup,
  useAssignSubjectToYearGroup,
  useUnassignSubjectFromYearGroup,
  useAssignTeacherToYearGroup,
  useUnassignTeacherFromYearGroup,
  useMoveStudentYearGroup,
  type AdminYearGroupStructure,
} from '#/components/query/AdminQuery'
import { BookOpen, DoorOpen, GraduationCap, Users } from 'lucide-react'

export const YEAR_LEVEL_OPTIONS = [
  {
    value: 'Primary',
    labelKey: 'admin.yearGroups.modals.levelOptions.Primary',
  },
  {
    value: 'JuniorSecondary',
    labelKey: 'admin.yearGroups.modals.levelOptions.JuniorSecondary',
  },
  {
    value: 'SeniorSecondary',
    labelKey: 'admin.yearGroups.modals.levelOptions.SeniorSecondary',
  },
  {
    value: 'University',
    labelKey: 'admin.yearGroups.modals.levelOptions.University',
  },
] as const

function formatLevel(level: string) {
  return level.replace(/([a-z])([A-Z])/g, '$1 $2')
}

function BaseModal({
  title,
  subtitle,
  children,
  onClose,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}) {
  const { t } = useDashboardTranslation()
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <div>
            <h2 id={titleId} className={styles.modalTitle}>
              {title}
            </h2>
            {subtitle ? (
              <p className={styles.modalSubtitle}>{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label={t('admin.yearGroups.modals.closeDialog')}
          >
            ×
          </button>
        </header>
        <div className={styles.modalBody}>{children}</div>
        {footer ? (
          <footer className={styles.modalFooter}>{footer}</footer>
        ) : null}
      </div>
    </div>
  )
}

export function CreateYearGroupModal({ onClose }: { onClose: () => void }) {
  const { t } = useDashboardTranslation()
  const { mutate, isPending } = useCreateYearGroup()
  const { data: subjects = [], isLoading: subjectsLoading } = useGetSubjects()
  const [name, setName] = useState('')
  const [level, setLevel] = useState<string>(YEAR_LEVEL_OPTIONS[0].value)
  const [roomNumber, setRoomNumber] = useState('')
  const [capacity, setCapacity] = useState('')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([])

  const toggleSubject = (subjectId: number) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    mutate(
      {
        name: name.trim(),
        level,
        roomNumber: roomNumber.trim() || undefined,
        capacity: capacity.trim() ? Number(capacity) : null,
        subjectIds: selectedSubjectIds,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <BaseModal
      title={t('admin.yearGroups.modals.newYearGroup')}
      subtitle={t('admin.yearGroups.modals.newYearGroupSubtitle')}
      onClose={onClose}
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            {t('admin.yearGroups.modals.cancel')}
          </button>
          <button
            type="submit"
            form="create-yg-form"
            className="btn btn-primary"
            disabled={isPending || !name.trim()}
          >
            {isPending
              ? t('admin.yearGroups.modals.creating')
              : t('admin.yearGroups.modals.createCohort')}
          </button>
        </div>
      }
    >
      <form id="create-yg-form" className={styles.modalForm} onSubmit={submit}>
        <Input
          label={t('admin.yearGroups.modals.cohortName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Year 3 Gold"
          autoFocus
          required
          fullWidth
        />
        <label className={styles.field}>
          <span>{t('admin.yearGroups.modals.level')}</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {YEAR_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </label>
        <Input
          label={t('admin.yearGroups.modals.roomBase')}
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          placeholder="e.g. Block A · Room 12"
          fullWidth
        />
        <Input
          label={t('admin.yearGroups.modals.classCapacity')}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="e.g. 40"
          inputMode="numeric"
          fullWidth
        />
        <div className={styles.field}>
          <span>{t('admin.yearGroups.modals.subjects')}</span>
          <div className={styles.selectionPills}>
            {subjects.map((subject) => {
              const selected = selectedSubjectIds.includes(subject.id)
              return (
                <button
                  key={subject.id}
                  type="button"
                  className={`${styles.selectionPill} ${selected ? styles.selectionPillActive : ''}`}
                  onClick={() => toggleSubject(subject.id)}
                  disabled={subjectsLoading || isPending}
                >
                  {subject.name}
                </button>
              )
            })}
            {!subjectsLoading && subjects.length === 0 ? (
              <p className={styles.inlineHint}>
                {t('admin.yearGroups.modals.noSubjectsYet')}
              </p>
            ) : null}
          </div>
        </div>
      </form>
    </BaseModal>
  )
}

export function EditYearGroupModal({
  yearGroup,
  onClose,
}: {
  yearGroup: AdminYearGroupStructure
  onClose: () => void
}) {
  const { t } = useDashboardTranslation()
  const { mutate, isPending } = useUpdateYearGroup()
  const [name, setName] = useState(yearGroup.name)
  const [level, setLevel] = useState<string>(yearGroup.level)
  const [roomNumber, setRoomNumber] = useState(yearGroup.roomNumber || '')
  const [capacity, setCapacity] = useState(
    yearGroup.capacity ? String(yearGroup.capacity) : '',
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    mutate(
      {
        id: yearGroup.id,
        name: name.trim(),
        level,
        roomNumber: roomNumber.trim() || null,
        capacity: capacity.trim() ? Number(capacity) : null,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <BaseModal
      title={t('admin.yearGroups.modals.editYearGroup')}
      subtitle={t('admin.yearGroups.modals.editYearGroupSubtitle')}
      onClose={onClose}
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            {t('admin.yearGroups.modals.cancel')}
          </button>
          <button
            type="submit"
            form="edit-yg-form"
            className="btn btn-primary"
            disabled={isPending || !name.trim()}
          >
            {isPending
              ? t('admin.yearGroups.modals.saving')
              : t('admin.yearGroups.modals.saveChanges')}
          </button>
        </div>
      }
    >
      <form id="edit-yg-form" className={styles.modalForm} onSubmit={submit}>
        <Input
          label={t('admin.yearGroups.modals.cohortName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        <label className={styles.field}>
          <span>{t('admin.yearGroups.modals.level')}</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {YEAR_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </label>
        <Input
          label={t('admin.yearGroups.modals.roomBase')}
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          fullWidth
        />
        <Input
          label={t('admin.yearGroups.modals.classCapacity')}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          inputMode="numeric"
          fullWidth
        />
      </form>
    </BaseModal>
  )
}

export function YearGroupSubjectsModal({
  yearGroup,
  onClose,
}: {
  yearGroup: AdminYearGroupStructure
  onClose: () => void
}) {
  const { t } = useDashboardTranslation()
  const { data: subjects = [], isLoading } = useGetSubjects()
  const assignMutation = useAssignSubjectToYearGroup()
  const unassignMutation = useUnassignSubjectFromYearGroup()
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>(
    yearGroup.subjects.map((subject) => subject.id),
  )
  const [isSaving, setIsSaving] = useState(false)

  const toggleSubject = (subjectId: number) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    )
  }

  const handleSave = async () => {
    const currentIds = new Set(yearGroup.subjects.map((subject) => subject.id))
    const nextIds = new Set(selectedSubjectIds)
    const toAssign = selectedSubjectIds.filter((id) => !currentIds.has(id))
    const toUnassign = [...currentIds].filter((id) => !nextIds.has(id))

    setIsSaving(true)
    try {
      for (const subjectId of toAssign) {
        await assignMutation.mutateAsync({
          subjectId,
          yearGroupId: yearGroup.id,
        })
      }
      for (const subjectId of toUnassign) {
        await unassignMutation.mutateAsync({
          subjectId,
          yearGroupId: yearGroup.id,
        })
      }
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <BaseModal
      title={t('admin.yearGroups.modals.manageSubjects')}
      subtitle={t('admin.yearGroups.modals.manageSubjectsSubtitle').replace(
        '{name}',
        yearGroup.name,
      )}
      onClose={onClose}
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            {t('admin.yearGroups.modals.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving
              ? t('admin.yearGroups.modals.saving')
              : t('admin.yearGroups.modals.saveSubjects')}
          </button>
        </div>
      }
    >
      <div className={styles.selectionPills}>
        {subjects.map((subject) => {
          const selected = selectedSubjectIds.includes(subject.id)
          return (
            <button
              key={subject.id}
              type="button"
              className={`${styles.selectionPill} ${selected ? styles.selectionPillActive : ''}`}
              onClick={() => toggleSubject(subject.id)}
              disabled={isSaving}
            >
              {subject.name}
            </button>
          )
        })}
        {!isLoading && subjects.length === 0 ? (
          <p className={styles.inlineHint}>
            {t('admin.yearGroups.modals.noSubjectsAvailable')}
          </p>
        ) : null}
      </div>
    </BaseModal>
  )
}

export function TeacherRosterModal({
  yearGroup,
  allUsers,
  onClose,
}: {
  yearGroup: AdminYearGroupStructure
  allUsers: User[]
  onClose: () => void
}) {
  const { t } = useDashboardTranslation()
  const { mutate: assign, isPending: assigning } = useAssignTeacherToYearGroup()
  const { mutate: unassign, isPending: unassigning } =
    useUnassignTeacherFromYearGroup()
  const busy = assigning || unassigning

  const teachers = allUsers.filter(
    (u) => u.role === 'TEACHER' && u.status === 'Active',
  )
  const assignedIds = new Set(yearGroup.teachers.map((teacher) => teacher.id))
  const available = teachers.filter((teacher) => !assignedIds.has(teacher.id))
  const [pickId, setPickId] = useState<string>('')

  const addTeacher = () => {
    const id = Number(pickId)
    if (!Number.isFinite(id)) return
    assign(
      { yearGroupId: yearGroup.id, teacherId: id },
      { onSuccess: () => setPickId('') },
    )
  }

  return (
    <BaseModal
      title={t('admin.yearGroups.modals.teachingStaff')}
      subtitle={t('admin.yearGroups.modals.teachingStaffSubtitle')
        .replace('{name}', yearGroup.name)
        .replace('{level}', formatLevel(yearGroup.level))}
      onClose={onClose}
    >
      <div className={styles.rosterSection}>
        <div className={styles.rosterSectionTitle}>
          {t('admin.yearGroups.modals.assigned')}
        </div>
        {yearGroup.teachers.length === 0 ? (
          <p className={styles.rosterEmpty}>
            {t('admin.yearGroups.modals.noTeachersLinked')}
          </p>
        ) : (
          <ul className={styles.rosterList}>
            {yearGroup.teachers.map((teacher) => (
              <li key={teacher.id} className={styles.rosterRow}>
                <div>
                  <div className={styles.rosterName}>{teacher.name}</div>
                  <div className={styles.rosterMeta}>
                    {teacher.specialization || 'Teacher'}
                    {teacher.email ? ` · ${teacher.email}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.rosterRemove}
                  disabled={busy}
                  onClick={() =>
                    unassign({
                      yearGroupId: yearGroup.id,
                      teacherId: teacher.id,
                    })
                  }
                >
                  {t('admin.yearGroups.modals.remove')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.rosterSection}>
        <div className={styles.rosterSectionTitle}>
          {t('admin.yearGroups.modals.addTeacher')}
        </div>
        <div className={styles.addRow}>
          <select
            value={pickId}
            onChange={(e) => setPickId(e.target.value)}
            disabled={busy || available.length === 0}
          >
            <option value="">
              {available.length === 0
                ? t('admin.yearGroups.modals.allTeachersAssigned')
                : t('admin.yearGroups.modals.chooseTeacher')}
            </option>
            {available.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
                {teacher.specialization ? ` (${teacher.specialization})` : ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || !pickId}
            onClick={addTeacher}
          >
            {t('admin.yearGroups.modals.assign')}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

export function MoveStudentModal({
  sourceYearGroup,
  allYearGroups,
  allUsers,
  onClose,
}: {
  sourceYearGroup: AdminYearGroupStructure
  allYearGroups: AdminYearGroupStructure[]
  allUsers: User[]
  onClose: () => void
}) {
  const { t } = useDashboardTranslation()
  const { mutate, isPending } = useMoveStudentYearGroup()
  const studentsHere = allUsers.filter(
    (u) =>
      u.role === 'STUDENT' &&
      u.status === 'Active' &&
      u.enrolledYearGroupId === sourceYearGroup.id,
  )
  const destinations = allYearGroups.filter(
    (yg) => yg.id !== sourceYearGroup.id,
  )
  const [studentId, setStudentId] = useState('')
  const [targetYgId, setTargetYgId] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const s = Number(studentId)
    const y = Number(targetYgId)
    if (!Number.isFinite(s) || !Number.isFinite(y)) return
    mutate({ studentId: s, yearGroupId: y }, { onSuccess: onClose })
  }

  return (
    <BaseModal
      title={t('admin.yearGroups.modals.moveStudent')}
      subtitle={t('admin.yearGroups.modals.moveStudentSubtitle').replace(
        '{source}',
        sourceYearGroup.name,
      )}
      onClose={onClose}
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            {t('admin.yearGroups.modals.cancel')}
          </button>
          <button
            type="submit"
            form="move-student-form"
            className="btn btn-primary"
            disabled={
              isPending ||
              !studentId ||
              !targetYgId ||
              destinations.length === 0
            }
          >
            {isPending
              ? t('admin.yearGroups.modals.moving')
              : t('admin.yearGroups.modals.moveStudent')}
          </button>
        </div>
      }
    >
      <form
        id="move-student-form"
        className={styles.modalForm}
        onSubmit={submit}
      >
        <label className={styles.field}>
          <span>{t('admin.yearGroups.modals.studentInCohort')}</span>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          >
            <option value="">
              {studentsHere.length === 0
                ? t('admin.yearGroups.modals.noStudentsEnrolled')
                : t('admin.yearGroups.modals.selectStudent')}
            </option>
            {studentsHere.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.email}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>{t('admin.yearGroups.modals.destinationCohort')}</span>
          <select
            value={targetYgId}
            onChange={(e) => setTargetYgId(e.target.value)}
            required
          >
            <option value="">
              {destinations.length === 0
                ? t('admin.yearGroups.modals.createAnotherYearGroup')
                : t('admin.yearGroups.modals.selectCohort')}
            </option>
            {destinations.map((yg) => (
              <option key={yg.id} value={yg.id}>
                {yg.name} ({formatLevel(yg.level)})
              </option>
            ))}
          </select>
        </label>
      </form>
    </BaseModal>
  )
}
export function YearGroupDetailsModal({
  yearGroup,
  allUsers,
  onClose,
}: {
  yearGroup: AdminYearGroupStructure
  allUsers: User[]
  onClose: () => void
}) {
  const { t } = useDashboardTranslation()
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students')

  // Filter students belonging to this year group
  const students = allUsers.filter(
    (u) =>
      u.role === 'STUDENT' &&
      u.status === 'Active' &&
      u.enrolledYearGroupId === yearGroup.id,
  )

  return (
    <BaseModal
      title={yearGroup.name}
      subtitle={`${formatLevel(yearGroup.level)} ${yearGroup.roomNumber ? `· ${yearGroup.roomNumber}` : ''}`}
      onClose={onClose}
    >
      <div className={styles.detailsContent}>
        {/* Tabs */}
        <div className={styles.tabsRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'students' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={14} />
            {t('admin.yearGroups.students')}
            <span className={styles.tabBadge}>{students.length}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'teachers' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            <GraduationCap size={14} />
            {t('admin.yearGroups.teachers')}
            <span className={styles.tabBadge}>{yearGroup.teachers.length}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabScrollArea}>
          {activeTab === 'students' ? (
            <div className={styles.detailsSection}>
              {students.length === 0 ? (
                <p className={styles.detailsEmpty}>
                  {t('admin.yearGroups.modals.noStudentsEnrolled')}
                </p>
              ) : (
                <div className={styles.detailsList}>
                  {students.map((student) => (
                    <div key={student.id} className={styles.detailsRow}>
                      <div className={styles.detailsAvatar}>
                        {student.name[0].toUpperCase()}
                      </div>
                      <div className={styles.detailsRowInfo}>
                        <div className={styles.detailsRowName}>
                          {student.name}
                        </div>
                        <div className={styles.detailsRowMeta}>
                          {student.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.detailsSection}>
              {yearGroup.teachers.length === 0 ? (
                <p className={styles.detailsEmpty}>
                  {t('admin.yearGroups.modals.noTeachersLinked')}
                </p>
              ) : (
                <div className={styles.detailsList}>
                  {yearGroup.teachers.map((teacher) => (
                    <div key={teacher.id} className={styles.detailsRow}>
                      <div className={styles.detailsAvatar}>
                        {teacher.name[0].toUpperCase()}
                      </div>
                      <div className={styles.detailsRowInfo}>
                        <div className={styles.detailsRowName}>
                          {teacher.name}
                        </div>
                        <div className={styles.detailsRowMeta}>
                          {teacher.specialization || 'Assigned Staff'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subjects Section (Footer-like or constant) */}
        <div className={styles.detailsFooterSection}>
          <div className={styles.detailsSectionHead}>
            <BookOpen
              size={14}
              strokeWidth={2}
              className={styles.detailsIcon}
            />
            <h3 className={styles.detailsSectionTitle}>
              {t('admin.yearGroups.subjects')} ({yearGroup.subjects.length})
            </h3>
          </div>
          {yearGroup.subjects.length === 0 ? (
            <p className={styles.detailsEmpty}>
              {t('admin.yearGroups.noSubjectsLinked')}
            </p>
          ) : (
            <div className={styles.detailsChips}>
              {yearGroup.subjects.map((sub) => (
                <span key={sub.id} className={styles.detailsChip}>
                  {sub.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  )
}

