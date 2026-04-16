import { useState, useMemo } from 'react'
import styles from '../Admin/AdminAnnouncements.module.scss'
import { Badge } from '@/components/ui'
import {
  Megaphone,
  Users,
  AlertCircle,
  Info,
  Bell,
  Clock,
} from 'lucide-react'
import { useGetAnnouncements } from '#/components/query/AuthQuery'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import useCurrentStudent from '#/components/hooks/useCurrentStudent'

type PriorityFilter = 'ALL' | 'Urgent' | 'Important' | 'Normal'

export function StudentAnnouncements() {
  const { t, language } = useDashboardTranslation()
  const { data: announcements, isLoading } = useGetAnnouncements()
  const currentData = useCurrentStudent()

  const [activePriority, setActivePriority] = useState<PriorityFilter>('ALL')

  const filteredAnnouncements = useMemo(() => {
    if (!announcements || !currentData) return []
    const studentYearGroupId = currentData.student.yearGroupId

    // First filter by eligibility
    let filtered = announcements.filter((a) => {
      if (a.targetType === 'ALL') return true
      if (a.targetType === 'YEAR_GROUP' && a.targetYearGroupId === studentYearGroupId) return true
      return false
    })

    // Then filter by priority selection
    if (activePriority !== 'ALL') {
      filtered = filtered.filter((a) => a.priority === activePriority)
    }

    return filtered
  }, [announcements, activePriority, currentData])

  if (isLoading || !announcements || !currentData) {
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
            {t('admin.announcements.communications')}
          </div>
          <h1 className={styles.title}>{t('admin.announcements.schoolNotices')}</h1>
          <p className={styles.subtitle}>
            {t('student.dashboard.heroLead')
              .replace('{count}', String(filteredAnnouncements.filter(a => a.priority === 'Urgent').length))
              .replace('{attendance}', String(currentData.student.att))}
          </p>
        </div>
      </header>

      <div className={styles.filterContainer}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>{t('admin.announcements.priorityLevel')}</span>
          <div className={styles.tabsList}>
            <TabButton
              active={activePriority === 'ALL'}
              onClick={() => setActivePriority('ALL')}
              label={t('admin.announcements.allBroadcasts')}
            />
            <TabButton
              active={activePriority === 'Urgent'}
              onClick={() => setActivePriority('Urgent')}
              icon={<AlertCircle size={14} style={{ color: '#ef4444' }} />}
              label={t('admin.announcements.urgent')}
            />
            <TabButton
              active={activePriority === 'Important'}
              onClick={() => setActivePriority('Important')}
              icon={<Bell size={14} style={{ color: '#f59e0b' }} />}
              label={t('admin.announcements.important')}
            />
            <TabButton
              active={activePriority === 'Normal'}
              onClick={() => setActivePriority('Normal')}
              icon={<Info size={14} style={{ color: 'var(--cyan)' }} />}
              label={t('admin.announcements.normal')}
            />
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

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      className={`${styles.tabTrigger} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  )
}

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
      : t('admin.announcements.everyone')

  const badgeVariant = ann.targetType === 'ALL' ? 'blue' : 'green'

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
