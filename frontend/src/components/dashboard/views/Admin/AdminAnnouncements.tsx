import { useState, useMemo } from 'react'
import styles from './AdminAnnouncements.module.scss'
import { Badge, Button } from '@/components/ui'
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
} from 'lucide-react'
import { useGetAnnouncements } from '#/components/query/AuthQuery'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import { CreateAnnouncementModal } from './AdminAnnouncementModals'

type TabType = 'ALL' | 'TEACHERS' | 'STUDENTS'
type PriorityFilter = 'ALL' | 'Urgent' | 'Important' | 'Normal'

export function AdminAnnouncements() {
  const { t, language } = useDashboardTranslation()
  const { data: announcements, isLoading } = useGetAnnouncements()

  const [activeTab, setActiveTab] = useState<TabType>('ALL')
  const [activePriority, setActivePriority] = useState<PriorityFilter>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return []
    let filtered = announcements

    // Audience Filter
    if (activeTab === 'TEACHERS') {
      filtered = filtered.filter((a) => a.targetType === 'TEACHERS_ONLY')
    } else if (activeTab === 'STUDENTS') {
      filtered = filtered.filter(
        (a) => a.targetType === 'ALL' || a.targetType === 'YEAR_GROUP',
      )
    }

    // Priority Filter
    if (activePriority !== 'ALL') {
      filtered = filtered.filter((a) => a.priority === activePriority)
    }

    return filtered
  }, [announcements, activeTab, activePriority])

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
      <header className={styles.heroSection}></header>

      {isModalOpen && (
        <CreateAnnouncementModal onClose={() => setIsModalOpen(false)} />
      )}

      <div className={styles.filterContainer}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>
            {t('admin.announcements.targetAudience')}
          </span>
          <div className={styles.tabsList}>
            <Button
              variant={activeTab === 'ALL' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('ALL')}
            >
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Users size={16} />
                {t('admin.announcements.allBroadcasts')}
              </span>
            </Button>
            <Button
              variant={activeTab === 'TEACHERS' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('TEACHERS')}
            >
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <UserRound size={16} />
                {t('admin.announcements.teachersOnly')}
              </span>
            </Button>
            <Button
              variant={activeTab === 'STUDENTS' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('STUDENTS')}
            >
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Filter size={16} />
                {t('admin.announcements.studentUpdates')}
              </span>
            </Button>
          </div>
          <div className={styles.btnContainer}>
            <Button
              className={styles.createTrigger}
              onClick={() => setIsModalOpen(true)}
            >
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={18} />
                {t('admin.announcements.createAnnouncement')}
              </span>
            </Button>
          </div>
        </div>

        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>
            {t('admin.announcements.priorityLevel')}
          </span>
          <div className={styles.tabsList}>
            <Button
              variant={activePriority === 'ALL' ? 'primary' : 'ghost'}
              onClick={() => setActivePriority('ALL')}
            >
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {t('admin.announcements.allBroadcasts')}
              </span>
            </Button>
            <Button
              variant={activePriority === 'Urgent' ? 'primary' : 'ghost'}
              onClick={() => setActivePriority('Urgent')}
            >
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <AlertCircle size={14} style={{ color: '#ef4444' }} />
                {t('admin.announcements.urgent')}
              </span>
            </Button>
            <Button
              variant={activePriority === 'Important' ? 'primary' : 'ghost'}
              onClick={() => setActivePriority('Important')}
            >
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Bell size={14} style={{ color: '#f59e0b' }} />
                {t('admin.announcements.important')}
              </span>
            </Button>
            <Button
              variant={activePriority === 'Normal' ? 'primary' : 'ghost'}
              onClick={() => setActivePriority('Normal')}
            >
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Info size={14} style={{ color: 'var(--cyan)' }} />
                {t('admin.announcements.normal')}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.statsCount}>
        {t('admin.announcements.messagesFound').replace(
          '{count}',
          String(filteredAnnouncements.length),
        )}
      </div>

      <div className={styles.announcementGrid}>
        {filteredAnnouncements.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          filteredAnnouncements.map((ann) => (
            <AnnouncementCard
              key={ann.id}
              ann={ann}
              t={t}
              language={language}
            />
          ))
        )}
      </div>
    </section>
  )
}

// function Button({ active, onClick, icon, label }: any) {
//   return (
//     <button
//       className={`${styles.tabTrigger} ${active ? styles.active : ''}`}
//       onClick={onClick}
//     >
//       {icon}
//       {label}
//     </button>
//   )
// }

function AnnouncementCard({ ann, t, language }: any) {
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

  const priorityLabel =
    ann.priority === 'Urgent'
      ? t('admin.announcements.urgent')
      : ann.priority === 'Important'
        ? t('admin.announcements.important')
        : t('admin.announcements.normal')

  const targetLabel =
    ann.targetType === 'YEAR_GROUP'
      ? t('admin.announcements.cohorts')
      : ann.targetType === 'TEACHERS_ONLY'
        ? t('admin.announcements.teachersOnly')
        : t('admin.announcements.everyone')

  const badgeVariant =
    ann.targetType === 'ALL'
      ? 'blue'
      : ann.targetType === 'TEACHERS_ONLY'
        ? 'purple'
        : 'green'

  return (
    <article
      className={`${styles.noticeCard} ${styles[ann.priority.toLowerCase()]}`}
    >
      <div className={styles.noticeHeader}>
        <div className={styles.noticeTitleGroup}>
          <div className={styles.priorityBadge}>
            {getPriorityIcon(ann.priority)}
            {priorityLabel}
          </div>
          <h3 className={styles.noticeTitle}>{ann.title}</h3>
        </div>
        <Badge variant={badgeVariant} className={styles.targetBadge}>
          {targetLabel}
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
            <span className={styles.authorName}>{ann.author?.name}</span>
            <span className={styles.authorRole}>{ann.author?.role}</span>
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
  )
}

function EmptyState({ t }: any) {
  return (
    <div className={styles.emptyState}>
      <Bell size={48} />
      <h3>{t('admin.announcements.noAnnouncements')}</h3>
      <p>{t('admin.announcements.noAnnouncementsCopy')}</p>
    </div>
  )
}
