import { useGetSubjects } from '#/components/query/AdminQuery'
import { BookText, Users, Plus, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import styles from './AdminCurriculum.module.scss'
import {
  CreateSubjectModal,
  EditSubjectModal,
  DeleteSubjectModal,
  AssignYearGroupModal,
} from './AdminCurriculumModals'

export function AdminCurriculum() {
  const { data: subjects = [], isLoading } = useGetSubjects()
  const [createOpen, setCreateOpen] = useState(false)
  const [editSubjectId, setEditSubjectId] = useState<number | null>(null)
  const [deleteSubjectId, setDeleteSubjectId] = useState<number | null>(null)
  const [assignSubjectId, setAssignSubjectId] = useState<number | null>(null)

  if (isLoading) {
    return <div className={styles.view}>Loading curriculum…</div>
  }

  const editingSubject = subjects.find((s) => s.id === editSubjectId)
  const deletingSubject = subjects.find((s) => s.id === deleteSubjectId)
  const assigningSubject = subjects.find((s) => s.id === assignSubjectId)

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>Curriculum</div>
            <h1 className={styles.title}>Subjects & Curriculum</h1>
            <p className={styles.copy}>
              Manage all school subjects, refine their details, and link them to
              year groups so each cohort has the right academic structure.
            </p>
            <div className={styles.heroStats}>
              <span className={styles.heroStat}>
                <BookText size={14} strokeWidth={2} aria-hidden />
                {subjects.length} subject{subjects.length === 1 ? '' : 's'}
              </span>
              <span className={styles.heroStat}>
                <Users size={14} strokeWidth={2} aria-hidden />
                {subjects.reduce(
                  (sum, subject) => sum + subject._count.yearGroups,
                  0,
                )}{' '}
                year-group link
                {subjects.reduce(
                  (sum, subject) => sum + subject._count.yearGroups,
                  0,
                ) === 1
                  ? ''
                  : 's'}
              </span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <button
              type="button"
              className={`btn btn-primary ${styles.heroCta}`}
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={16} strokeWidth={2} />
              Create Subject
            </button>
          </div>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Subject Name</th>
              <th>Assigned Year Groups</th>
              <th>Usage</th>
              <th className={styles.actionsColumn}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>
                  <BookText size={24} className={styles.mutedIcon} />
                  <p>No subjects found. Create one to get started.</p>
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>
                    <div className={styles.subjectName}>{subject.name}</div>
                    <div className={styles.subjectDesc}>
                      {subject.description || 'No description provided.'}
                    </div>
                  </td>

                  <td>
                    {subject.yearGroups.length > 0 ? (
                      <div className={styles.tagList}>
                        {subject.yearGroups.map((yearGroup) => (
                          <span key={yearGroup.id} className={styles.tag}>
                            {yearGroup.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className={styles.mutedText}>Not assigned</span>
                    )}
                  </td>

                  <td>
                    <div className={styles.subjectDesc}>
                      {subject._count.yearGroups} year group
                      {subject._count.yearGroups === 1 ? '' : 's'}
                      {' · '}
                      {subject._count.timetable} timetable slot
                      {subject._count.timetable === 1 ? '' : 's'}
                    </div>
                  </td>

                  <td className={styles.actionsCell}>
                    <div className={styles.actionButtons}>
                      <button
                        title="Assign to Year Group"
                        className={styles.iconBtn}
                        onClick={() => setAssignSubjectId(subject.id)}
                      >
                        <Users size={18} />
                      </button>
                      <button
                        title="Edit Subject"
                        className={styles.iconBtn}
                        onClick={() => setEditSubjectId(subject.id)}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        title="Delete Subject"
                        className={`${styles.iconBtn} ${styles.dangerText}`}
                        onClick={() => setDeleteSubjectId(subject.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {createOpen ? (
        <CreateSubjectModal onClose={() => setCreateOpen(false)} />
      ) : null}

      {editingSubject ? (
        <EditSubjectModal
          subject={editingSubject}
          onClose={() => setEditSubjectId(null)}
        />
      ) : null}

      {deletingSubject ? (
        <DeleteSubjectModal
          subject={deletingSubject}
          onClose={() => setDeleteSubjectId(null)}
          onConfirm={() => setDeleteSubjectId(null)}
        />
      ) : null}

      {assigningSubject ? (
        <AssignYearGroupModal
          subject={assigningSubject}
          onClose={() => setAssignSubjectId(null)}
        />
      ) : null}
    </section>
  )
}
