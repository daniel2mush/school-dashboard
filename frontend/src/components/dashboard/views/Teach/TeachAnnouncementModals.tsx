import { useState } from 'react'
import styles from '../Admin/AdminAnnouncements.module.scss'
import { Send, X, Target, FileText, AlertCircle } from 'lucide-react'
import {
  useGetTeacherClasses,
  useCreateTeacherAnnouncement,
} from '#/components/query/TeacherQuery'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

interface TeachAnnouncementModalProps {
  onClose: () => void
}

export function TeachAnnouncementModal({ onClose }: TeachAnnouncementModalProps) {
  const { t } = useDashboardTranslation()
  const { data: teacherClasses } = useGetTeacherClasses()
  const { mutate: createAnnouncement, isPending } = useCreateTeacherAnnouncement()

  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetYearGroupId, setTargetYearGroupId] = useState('')
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Normal')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content || !targetYearGroupId) return

    createAnnouncement(
      {
        title,
        content,
        targetYearGroupId: Number(targetYearGroupId),
        targetType: 'YEAR_GROUP',
        priority: priority as any,
      },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div className={styles.modalTitleArea}>
            <h2 className={styles.modalTitle}>{t('teacher.announcements.newClassAnnouncement')}</h2>
            <p className={styles.modalSubtitle}>{t('teacher.announcements.modalCopy')}</p>
          </div>
          <button className={styles.closeModal} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <form className={styles.createForm} onSubmit={handleSubmit}>
          <div className={styles.formFieldGroup}>
            <div className={styles.formSection}>
              <label className={styles.label}>
                <FileText size={14} style={{ marginRight: 6 }} />
                {t('teacher.announcements.announcementTitle')}
              </label>
              <input
                className={styles.input}
                placeholder={t('teacher.announcements.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formSection}>
                <label className={styles.label}>
                  <AlertCircle size={14} style={{ marginRight: 6 }} />
                  {t('teacher.announcements.priorityLevel')}
                </label>
                <select
                  className={styles.select}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="Normal">{t('teacher.announcements.normal')}</option>
                  <option value="Important">{t('teacher.announcements.important')}</option>
                  <option value="Urgent">{t('teacher.announcements.urgent')}</option>
                </select>
              </div>

              <div className={styles.formSection}>
                <label className={styles.label}>
                  <Target size={14} style={{ marginRight: 6 }} />
                  {t('teacher.announcements.targetClass')}
                </label>
                <select
                  className={styles.select}
                  value={targetYearGroupId}
                  onChange={(e) => setTargetYearGroupId(e.target.value)}
                  required
                >
                  <option value="">{t('teacher.announcements.selectClass')}</option>
                  {teacherClasses?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.label}>{t('teacher.announcements.details')}</label>
              <textarea
                className={styles.textarea}
                placeholder={t('teacher.announcements.detailsPlaceholder')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              {t('teacher.announcements.cancel')}
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isPending || !title || !content || !targetYearGroupId}
            >
              {isPending ? (
                t('teacher.announcements.broadcasting')
              ) : (
                <>
                  <Send size={16} />
                  {t('teacher.announcements.broadcastAnnouncement')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
