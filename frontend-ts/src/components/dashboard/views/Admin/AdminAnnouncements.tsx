import { useState, useMemo } from 'react'
import styles from './AdminAnnouncements.module.scss'
import { Badge } from '@/components/ui'
import {
  Megaphone,
  Users,
  UserRound,
  AlertCircle,
  Info,
  Bell,
  Plus,
  Filter,
  Clock,
  Send,
} from 'lucide-react'
import {
  useGetSchoolStructure,
  useCreateAnnouncement,
} from '#/components/query/AdminQuery'
import { useGetAnnouncements } from '#/components/query/AuthQuery'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

type TabType = 'ALL' | 'TEACHERS' | 'STUDENTS'

export function AdminAnnouncements() {
  const { t, language } = useDashboardTranslation()
  const { data: announcements, isLoading } = useGetAnnouncements()
  const { data: structure } = useGetSchoolStructure()
  const { mutate: createAnnouncement, isPending } = useCreateAnnouncement()

  const [activeTab, setActiveTab] = useState<TabType>('ALL')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetType, setTargetType] = useState('ALL')
  const [priority, setPriority] = useState('Normal')
  const [targetYearGroupId, setTargetYearGroupId] = useState('')

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return []
    if (activeTab === 'ALL') return announcements
    if (activeTab === 'TEACHERS')
      return announcements.filter((a) => a.targetType === 'TEACHERS_ONLY')
    return announcements.filter(
      (a) => a.targetType === 'ALL' || a.targetType === 'YEAR_GROUP',
    )
  }, [announcements, activeTab])

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
          setTitle('')
          setContent('')
          setTargetType('ALL')
          setPriority('Normal')
          setTargetYearGroupId('')
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
        <p>{t('admin.announcements.loading')}</p>
      </div>
    )
  }

  return (
    <section className={styles.view}>
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <Megaphone size={14} />
            {t('admin.announcements.eyebrow')}
          </div>
          <h1 className={styles.title}>{t('admin.announcements.title')}</h1>
          <p className={styles.subtitle}>{t('admin.announcements.copy')}</p>
        </div>
        <button
          className={styles.createTrigger}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? (
            t('admin.announcements.discardMessage')
          ) : (
            <>
              <Plus size={18} />
              {t('admin.announcements.createAnnouncement')}
            </>
          )}
        </button>
      </header>

      {showCreateForm && (
        <div className={styles.formOverlay}>
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <h3>{t('admin.announcements.broadcastNewMessage')}</h3>
              <p>{t('admin.announcements.broadcastCopy')}</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>{t('admin.announcements.announcementTitle')}</label>
                <div className={styles.inputWrapper}>
                  <input
                    placeholder={t('admin.announcements.titlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>{t('admin.announcements.priorityLevel')}</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Normal">
                      {t('admin.announcements.normal')}
                    </option>
                    <option value="Important">
                      {t('admin.announcements.important')}
                    </option>
                    <option value="Urgent">
                      {t('admin.announcements.urgent')}
                    </option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t('admin.announcements.targetAudience')}</label>
                  <select
                    value={targetType}
                    onChange={(e) => {
                      setTargetType(e.target.value)
                      if (e.target.value !== 'YEAR_GROUP')
                        setTargetYearGroupId('')
                    }}
                  >
                    <option value="ALL">
                      {t('admin.announcements.everyonePublic')}
                    </option>
                    <option value="TEACHERS_ONLY">
                      {t('admin.announcements.teachersOnly')}
                    </option>
                    <option value="YEAR_GROUP">
                      {t('admin.announcements.specificYearGroup')}
                    </option>
                  </select>
                </div>

                {targetType === 'YEAR_GROUP' && (
                  <div className={styles.inputGroup}>
                    <label>{t('admin.announcements.selectYearGroup')}</label>
                    <select
                      value={targetYearGroupId}
                      onChange={(e) => setTargetYearGroupId(e.target.value)}
                      required
                    >
                      <option value="">
                        {t('admin.announcements.chooseCohort')}
                      </option>
                      {structure?.map((yg) => (
                        <option key={yg.id} value={yg.id}>
                          {yg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>{t('admin.announcements.messageContent')}</label>
                <textarea
                  rows={4}
                  placeholder={t('admin.announcements.messagePlaceholder')}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowCreateForm(false)}
              >
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
      )}

      <nav className={styles.tabsNav}>
        <div className={styles.tabsList}>
          <button
            className={`${styles.tabTrigger} ${activeTab === 'ALL' ? styles.active : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            <Users size={16} />
            {t('admin.announcements.allBroadcasts')}
          </button>
          <button
            className={`${styles.tabTrigger} ${activeTab === 'TEACHERS' ? styles.active : ''}`}
            onClick={() => setActiveTab('TEACHERS')}
          >
            <UserRound size={16} />
            {t('admin.announcements.teachersOnly')}
          </button>
          <button
            className={`${styles.tabTrigger} ${activeTab === 'STUDENTS' ? styles.active : ''}`}
            onClick={() => setActiveTab('STUDENTS')}
          >
            <Filter size={16} />
            {t('admin.announcements.studentUpdates')}
          </button>
        </div>
        <div className={styles.statsCount}>
          {t('admin.announcements.messagesFound').replace(
            '{count}',
            String(filteredAnnouncements.length),
          )}
        </div>
      </nav>

      <div className={styles.announcementGrid}>
        {filteredAnnouncements.length === 0 ? (
          <div className={styles.emptyState}>
            <Bell size={48} />
            <h3>{t('admin.announcements.noAnnouncements')}</h3>
            <p>{t('admin.announcements.noAnnouncementsCopy')}</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <article
              key={ann.id}
              className={`${styles.noticeCard} ${styles[ann.priority.toLowerCase()]}`}
            >
              <div className={styles.noticeHeader}>
                <div className={styles.noticeTitleGroup}>
                  <div className={styles.priorityBadge}>
                    {getPriorityIcon(ann.priority)}
                    {ann.priority === 'Urgent'
                      ? t('admin.announcements.urgent')
                      : ann.priority === 'Important'
                        ? t('admin.announcements.important')
                        : t('admin.announcements.normal')}
                  </div>
                  <h3 className={styles.noticeTitle}>{ann.title}</h3>
                </div>
                <Badge
                  variant={
                    ann.targetType === 'ALL'
                      ? 'blue'
                      : ann.targetType === 'TEACHERS_ONLY'
                        ? 'purple'
                        : 'green'
                  }
                  className={styles.targetBadge}
                >
                  {ann.targetType === 'YEAR_GROUP'
                    ? t('admin.announcements.cohorts')
                    : ann.targetType === 'TEACHERS_ONLY'
                      ? t('admin.announcements.teachersOnly')
                      : t('admin.announcements.everyone')}
                </Badge>
              </div>

              <div className={styles.noticeBody}>
                <p className={styles.noticeContent}>{ann.content}</p>
              </div>

              <footer className={styles.noticeFooter}>
                <div className={styles.authorInfo}>
                  <div className={styles.avatar}>
                    {ann.author?.name.charAt(0) || 'A'}
                  </div>
                  <div className={styles.metaText}>
                    <span className={styles.authorName}>
                      {ann.author?.name}
                    </span>
                    <span className={styles.authorRole}>
                      {ann.author?.role}
                    </span>
                  </div>
                </div>
                <div className={styles.timestamp}>
                  <Clock size={12} />
                  {new Date(ann.createdAt).toLocaleDateString(
                    language === 'fr' ? 'fr-FR' : undefined,
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    },
                  )}
                </div>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
