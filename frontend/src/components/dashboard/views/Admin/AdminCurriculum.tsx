import { useGetSubjects } from '#/components/query/AdminQuery'
import { BookText, Users, Plus, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import styles from './AdminCurriculum.module.scss'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import {
  CreateSubjectModal,
  EditSubjectModal,
  DeleteSubjectModal,
  AssignYearGroupModal,
} from './AdminCurriculumModals'

export function AdminCurriculum() {
  const { t } = useDashboardTranslation()
  const { data: subjects = [], isLoading } = useGetSubjects()
  const [createOpen, setCreateOpen] = useState(false)
  const [editSubjectId, setEditSubjectId] = useState<number | null>(null)
  const [deleteSubjectId, setDeleteSubjectId] = useState<number | null>(null)
  const [assignSubjectId, setAssignSubjectId] = useState<number | null>(null)

  if (isLoading) {
    return <div className={styles.view}>{t('admin.curriculum.loading')}</div>
  }

  const editingSubject = subjects.find((s) => s.id === editSubjectId)
  const deletingSubject = subjects.find((s) => s.id === deleteSubjectId)
  const assigningSubject = subjects.find((s) => s.id === assignSubjectId)

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.heroStats}>
              <span className={styles.heroStat}>
                <BookText size={14} strokeWidth={2} aria-hidden />
                {t('admin.curriculum.subjectsCount').replace(
                  '{count}',
                  String(subjects.length),
                )}
              </span>
              <span className={styles.heroStat}>
                <Users size={14} strokeWidth={2} aria-hidden />
                {t('admin.curriculum.yearGroupLinksCount').replace(
                  '{count}',
                  String(
                    subjects.reduce(
                      (sum, subject) => sum + subject._count.yearGroups,
                      0,
                    ),
                  ),
                )}
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
              {t('admin.curriculum.createSubject')}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>{t('admin.curriculum.subjectName')}</th>
              <th>{t('admin.curriculum.assignedYearGroups')}</th>
              <th>{t('admin.curriculum.usage')}</th>
              <th className={styles.actionsColumn}>
                {t('admin.curriculum.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>
                  <BookText size={24} className={styles.mutedIcon} />
                  <p>{t('admin.curriculum.noSubjects')}</p>
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>
                    <div className={styles.subjectName}>{subject.name}</div>
                    <div className={styles.subjectDesc}>
                      {subject.description ||
                        t('admin.curriculum.noDescription')}
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
                      <span className={styles.mutedText}>
                        {t('admin.curriculum.notAssigned')}
                      </span>
                    )}
                  </td>

                  <td>
                    <div className={styles.subjectDesc}>
                      {t('admin.curriculum.usageSummary')
                        .replace(
                          '{yearGroups}',
                          String(subject._count.yearGroups),
                        )
                        .replace('{slots}', String(subject._count.timetable))}
                    </div>
                  </td>

                  <td className={styles.actionsCell}>
                    <div className={styles.actionButtons}>
                      <button
                        title={t('admin.curriculum.assignToYearGroup')}
                        className={styles.iconBtn}
                        onClick={() => setAssignSubjectId(subject.id)}
                      >
                        <Users size={18} />
                      </button>
                      <button
                        title={t('admin.curriculum.editSubject')}
                        className={styles.iconBtn}
                        onClick={() => setEditSubjectId(subject.id)}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        title={t('admin.curriculum.deleteSubject')}
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
