import { Input } from '@/components/ui'
import type { Subject } from '@/types/Types'
import { useEffect, useId, useState  } from 'react'
import type {ReactNode} from 'react';
import styles from './AdminCurriculumModals.module.scss'
import {
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  useGetSchoolStructure,
  useAssignSubjectToYearGroup,
  useUnassignSubjectFromYearGroup,
} from '#/components/query/AdminQuery'

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
            aria-label="Close dialog"
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

export function CreateSubjectModal({ onClose }: { onClose: () => void }) {
  const { mutate, isPending } = useCreateSubject()
  const [name, setName] = useState('')
  const [description] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    mutate(
      {
        name: name.trim(),
        description: description.trim() || null,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <BaseModal
      title="New subject"
      subtitle="Define a subject that can be linked to cohorts and timetables."
      onClose={onClose}
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-subject-form"
            className="btn btn-primary"
            disabled={isPending || !name.trim()}
          >
            {isPending ? 'Creating…' : 'Create subject'}
          </button>
        </div>
      }
    >
      <form
        id="create-subject-form"
        className={styles.modalForm}
        onSubmit={submit}
      >
        <Input
          label="Subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mathematics"
          autoFocus
          required
          fullWidth
        />
      </form>
    </BaseModal>
  )
}

export function EditSubjectModal({
  subject,
  onClose,
}: {
  subject: Subject
  onClose: () => void
}) {
  const { mutate, isPending } = useUpdateSubject()
  const [name, setName] = useState(subject.name)
  const [description, setDescription] = useState(subject.description || '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    mutate(
      {
        id: subject.id,
        name: name.trim(),
        description: description.trim() || null,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <BaseModal
      title="Edit subject"
      subtitle="Update subject details."
      onClose={onClose}
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-subject-form"
            className="btn btn-primary"
            disabled={isPending || !name.trim()}
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      }
    >
      <form
        id="edit-subject-form"
        className={styles.modalForm}
        onSubmit={submit}
      >
        <Input
          label="Subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        <label className={styles.field}>
          <span>Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>
      </form>
    </BaseModal>
  )
}

export function DeleteSubjectModal({
  subject,
  onClose,
  onConfirm,
}: {
  subject: Subject
  onClose: () => void
  onConfirm: () => void
}) {
  const { mutate, isPending } = useDeleteSubject()

  const handleConfirm = () => {
    mutate(subject.id, {
      onSuccess: () => {
        onConfirm()
        onClose()
      },
    })
  }

  return (
    <BaseModal
      title="Delete subject?"
      subtitle="This action cannot be undone if there are no linked records."
      onClose={onClose}
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${styles.dangerBtn}`}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting…' : 'Delete subject'}
          </button>
        </div>
      }
    >
      <div className={styles.modalBody}>
        <p className={styles.modalLead}>
          Are you sure you want to remove <strong>{subject.name}</strong>?
        </p>
        <p className={styles.muted}>
          You will only be able to delete this subject if it is not currently
          linked to any year groups, grades, or timetable slots.
        </p>
      </div>
    </BaseModal>
  )
}

export function AssignYearGroupModal({
  subject,
  onClose,
}: {
  subject: Subject
  onClose: () => void
}) {
  const { data: structure = [], isLoading } = useGetSchoolStructure()
  const assignMutation = useAssignSubjectToYearGroup()
  const unassignMutation = useUnassignSubjectFromYearGroup()
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>(
    subject.yearGroups?.map((yearGroup) => yearGroup.id) || [],
  )
  const [isSaving, setIsSaving] = useState(false)

  const availableYearGroups = structure.map((yearGroup) => ({
    id: yearGroup.id,
    name: yearGroup.name,
    level: yearGroup.level,
  }))

  const toggleYearGroup = (yearGroupId: number) => {
    setSelectedGroupIds((prev) =>
      prev.includes(yearGroupId)
        ? prev.filter((id) => id !== yearGroupId)
        : [...prev, yearGroupId],
    )
  }

  const handleSave = async () => {
    const currentIds = new Set(subject.yearGroups?.map((yg) => yg.id) || [])
    const nextIds = new Set(selectedGroupIds)
    const toAssign = selectedGroupIds.filter((id) => !currentIds.has(id))
    const toUnassign = [...currentIds].filter((id) => !nextIds.has(id))

    setIsSaving(true)

    try {
      for (const yearGroupId of toAssign) {
        await assignMutation.mutateAsync({
          subjectId: subject.id,
          yearGroupId,
        })
      }

      for (const yearGroupId of toUnassign) {
        await unassignMutation.mutateAsync({
          subjectId: subject.id,
          yearGroupId,
        })
      }

      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <BaseModal
      title="Assign Year Groups"
      subtitle={`Select which year groups will offer ${subject.name}.`}
      onClose={onClose}
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Saving…' : 'Save Assignments'}
          </button>
        </div>
      }
    >
      <div className={styles.checkboxGrid}>
        {availableYearGroups.map((yearGroup) => {
          const isSelected = selectedGroupIds.includes(yearGroup.id)
          return (
            <label
              key={yearGroup.id}
              className={`${styles.checkboxLabel} ${isSelected ? styles.selected : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleYearGroup(yearGroup.id)}
                className={styles.hiddenCheckbox}
              />
              <span className={styles.customCheckbox} aria-hidden="true">
                {isSelected && <div className={styles.checkMark} />}
              </span>
              <span className={styles.checkboxText}>{yearGroup.name}</span>
            </label>
          )
        })}
        {!isLoading && availableYearGroups.length === 0 ? (
          <p className={styles.mutedText}>
            No year groups available yet. Create a year group first.
          </p>
        ) : null}
      </div>
    </BaseModal>
  )
}
