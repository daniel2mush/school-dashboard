import { useState } from 'react'
import styles from './AdminAnnouncements.module.scss'
import { Send, X } from 'lucide-react'
import {
  useGetSchoolStructure,
  useCreateAnnouncement,
} from '#/components/query/AdminQuery'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

interface CreateAnnouncementModalProps {
  onClose: () => void
}

export function CreateAnnouncementModal({ onClose }: CreateAnnouncementModalProps) {
  const { t } = useDashboardTranslation()
  const { data: structure } = useGetSchoolStructure()
  const { mutate: createAnnouncement, isPending } = useCreateAnnouncement()

  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetType, setTargetType] = useState('ALL')
  const [priority, setPriority] = useState('Normal')
  const [targetYearGroupId, setTargetYearGroupId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return

    createAnnouncement(
      {
        title,
        content,
        targetType: targetType as any,
        priority: priority as any,
        targetYearGroupId: targetYearGroupId ? Number(targetYearGroupId) : null,
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
            <h2 className={styles.modalTitle}>{t('admin.announcements.broadcastNewMessage')}</h2>
            <p className={styles.modalSubtitle}>{t('admin.announcements.broadcastCopy')}</p>
          </div>
          <button className={styles.closeModal} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <form className={styles.createForm} onSubmit={handleSubmit}>
          <div className={styles.formFieldGroup}>
            <div className={styles.formSection}>
              <label className={styles.label}>{t('admin.announcements.announcementTitle')}</label>
              <input
                className={styles.input}
                placeholder={t('admin.announcements.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formSection}>
                <label className={styles.label}>{t('admin.announcements.priorityLevel')}</label>
                <select
                  className={styles.select}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Normal">{t('admin.announcements.normal')}</option>
                  <option value="Important">{t('admin.announcements.important')}</option>
                  <option value="Urgent">{t('admin.announcements.urgent')}</option>
                </select>
              </div>

              <div className={styles.formSection}>
                <label className={styles.label}>{t('admin.announcements.targetAudience')}</label>
                <select
                  className={styles.select}
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value)
                    if (e.target.value !== 'YEAR_GROUP') setTargetYearGroupId('')
                  }}
                >
                  <option value="ALL">{t('admin.announcements.everyonePublic')}</option>
                  <option value="TEACHERS_ONLY">{t('admin.announcements.teachersOnly')}</option>
                  <option value="YEAR_GROUP">{t('admin.announcements.specificYearGroup')}</option>
                </select>
              </div>

              {targetType === 'YEAR_GROUP' && (
                <div className={styles.formSection}>
                  <label className={styles.label}>{t('admin.announcements.selectYearGroup')}</label>
                  <select
                    className={styles.select}
                    value={targetYearGroupId}
                    onChange={(e) => setTargetYearGroupId(e.target.value)}
                    required
                  >
                    <option value="">{t('admin.announcements.chooseCohort')}</option>
                    {structure?.map((yg) => (
                      <option key={yg.id} value={yg.id}>
                        {yg.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <label className={styles.label}>{t('admin.announcements.messageContent')}</label>
              <textarea
                className={styles.textarea}
                rows={6}
                placeholder={t('admin.announcements.messagePlaceholder')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              {t('admin.announcements.cancel')}
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isPending || !title || !content}
            >
              {isPending ? (
                t('admin.announcements.broadcasting')
              ) : (
                <>
                  <Send size={16} />
                  {t('admin.announcements.sendBroadcast')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
