import { useState, useMemo, type FormEvent } from 'react'
import styles from '../Admin/AdminAnnouncements.module.scss'
import { Badge } from '@/components/ui'
import {
  Megaphone,
  Plus,
  Info,
  Bell,
  AlertCircle,
  Send,
  X,
  Target,
  FileText,
} from 'lucide-react'
import { useGetAnnouncements } from '#/components/query/AuthQuery'
import {
  useGetTeacherClasses,
  useCreateTeacherAnnouncement,
} from '#/components/query/TeacherQuery'
import type { Announcement } from '@/types/Types'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

type TabType = 'ALL' | 'FACULTY' | 'MY_CLASSES'

export function TeachAnnouncements() {
  const { t, language } = useDashboardTranslation()
  const { data: announcements, isLoading } = useGetAnnouncements()
  const { data: classes } = useGetTeacherClasses()
  const { mutate: createAnnouncement, isPending } =
    useCreateTeacherAnnouncement()
  const teacherClasses = classes ?? []
  const teacherClassIds = useMemo(
    () => new Set(teacherClasses.map((classItem) => classItem.id)),
    [teacherClasses],
  )

  const [activeTab, setActiveTab] = useState<TabType>('ALL')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetYearGroupId, setTargetYearGroupId] = useState('')
  const [priority, setPriority] = useState<
    'Normal' | 'Important' | 'Urgent'
  >('Normal')

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return []
    if (activeTab === 'ALL') return announcements
    if (activeTab === 'FACULTY')
      return announcements.filter((a) => a.targetType === 'TEACHERS_ONLY')
    if (activeTab === 'MY_CLASSES')
      return announcements.filter(
        (a) =>
          a.targetType === 'YEAR_GROUP' &&
          a.targetYearGroupId !== null &&
          teacherClassIds.has(a.targetYearGroupId),
      )
    return announcements
  }, [announcements, activeTab, teacherClassIds])

  const getAudienceLabel = (announcement: Announcement) => {
    if (announcement.targetType === 'TEACHERS_ONLY')
      return t('teacher.announcements.facultyOnly')
    if (announcement.targetType === 'ALL')
      return t('teacher.announcements.everyone')
    return t('teacher.announcements.classAudience').replace(
      '{name}',
      announcement.targetYearGroup?.name ||
        t('teacher.announcements.selectedClass'),
    )
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title || !content || !targetYearGroupId || teacherClasses.length === 0)
      return

    createAnnouncement(
      {
        title,
        content,
        targetYearGroupId: Number(targetYearGroupId),
        targetType: 'YEAR_GROUP',
        priority,
      },
      {
        onSuccess: () => {
          setTitle('')
          setContent('')
          setTargetYearGroupId('')
          setPriority('Normal')
          setShowCreateForm(false)
        },
      },
    )
  }

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case 'Urgent':
        return <AlertCircle size={16} className={styles.urgentIcon} />
      case 'Important':
        return <Bell size={16} className={styles.importantIcon} />
      default:
        return <Info size={16} className={styles.normalIcon} />
    }
  }

  if (isLoading || !announcements) {
    return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
        <p>{t('teacher.announcements.loading')}</p>
      </div>
    )
  }

  return (
    <section className={styles.view}>
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <Megaphone size={14} />
            {t('teacher.announcements.eyebrow')}
          </div>
          <h1 className={styles.title}>{t('teacher.announcements.title')}</h1>
          <p className={styles.subtitle}>
            {t('teacher.announcements.copy')}
          </p>
        </div>
        <button
          type="button"
          className={styles.createTrigger}
          onClick={() => setShowCreateForm(true)}
          disabled={teacherClasses.length === 0}
        >
          <Plus size={18} />
          <span>{t('teacher.announcements.newClassAnnouncement')}</span>
        </button>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.contentCol}>
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${activeTab === 'ALL' ? styles.active : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              {t('teacher.announcements.allNotices')}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'FACULTY' ? styles.active : ''}`}
              onClick={() => setActiveTab('FACULTY')}
            >
              {t('teacher.announcements.facultyOnly')}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'MY_CLASSES' ? styles.active : ''}`}
              onClick={() => setActiveTab('MY_CLASSES')}
            >
              {t('teacher.announcements.classUpdates')}
            </button>
          </div>

          <div className={styles.announcementList}>
            {filteredAnnouncements.map((ann) => (
              <article key={ann.id} className={styles.noticeCard}>
                <div className={styles.noticeHeader}>
                  <div className={styles.noticeMain}>
                    {getPriorityIcon(ann.priority)}
                    <h3 className={styles.noticeTitle}>{ann.title}</h3>
                  </div>
                  <Badge
                    variant={
                      ann.targetType === 'TEACHERS_ONLY' ? 'purple' : 'blue'
                    }
                  >
                    {getAudienceLabel(ann)}
                  </Badge>
                </div>
                <p className={styles.noticeContent}>{ann.content}</p>
                <div className={styles.noticeFooter}>
                  <span className={styles.author}>
                    {t('teacher.announcements.byline')
                      .replace('{name}', ann.author?.name || '')
                      .replace('{role}', ann.author?.role || '')}
                  </span>
                  <span className={styles.date}>
                    {new Date(ann.createdAt).toLocaleDateString(
                      language === 'fr' ? 'fr-FR' : undefined,
                      {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      },
                    )}
                  </span>
                </div>
              </article>
            ))}

            {filteredAnnouncements.length === 0 && (
              <div className={styles.emptyState}>
                <Megaphone size={48} />
                <p>{t('teacher.announcements.empty')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleArea}>
                <h2 className={styles.modalTitle}>
                  {t('teacher.announcements.newClassAnnouncement')}
                </h2>
                <p className={styles.modalSubtitle}>
                  {t('teacher.announcements.modalCopy')}
                </p>
              </div>
              <button
                className={styles.closeModal}
                onClick={() => setShowCreateForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.createForm}>
              <div className={styles.formSection}>
                <label className={styles.label}>
                  <FileText size={16} />
                  {t('teacher.announcements.announcementTitle')}
                </label>
                <input
                  type="text"
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
                    <Target size={16} />
                    {t('teacher.announcements.targetClass')}
                  </label>
                  <select
                    className={styles.select}
                    value={targetYearGroupId}
                    onChange={(e) => setTargetYearGroupId(e.target.value)}
                    required
                  >
                    <option value="">
                      {t('teacher.announcements.selectClass')}
                    </option>
                    {teacherClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formSection}>
                  <label className={styles.label}>
                    <AlertCircle size={16} />
                    {t('teacher.announcements.priorityLevel')}
                  </label>
                  <select
                    className={styles.select}
                    value={priority}
                    onChange={(e) =>
                      setPriority(
                        e.target.value as 'Normal' | 'Important' | 'Urgent',
                      )
                    }
                  >
                    <option value="Normal">
                      {t('teacher.announcements.normal')}
                    </option>
                    <option value="Important">
                      {t('teacher.announcements.important')}
                    </option>
                    <option value="Urgent">
                      {t('teacher.announcements.urgent')}
                    </option>
                  </select>
                </div>
              </div>

              <div className={styles.formSection}>
                <label className={styles.label}>
                  {t('teacher.announcements.details')}
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder={t('teacher.announcements.detailsPlaceholder')}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowCreateForm(false)}
                >
                  {t('teacher.announcements.cancel')}
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isPending || teacherClasses.length === 0}
                >
                  {isPending ? (
                    t('teacher.announcements.broadcasting')
                  ) : (
                    <>
                      <Send size={18} />
                      {t('teacher.announcements.broadcastAnnouncement')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
