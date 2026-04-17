import {
  Badge,
  Card,
  CardHeader,
  ProgressBar,
} from '@/components/ui'
import styles from './StudentDashboard.module.scss'

import {
  CalendarDays,
  School,
  BookOpen,
  GraduationCap,
  Banknote,
  UserCheck,
  TrendingUp,
  Clock,
  Zap,
  User,
  Calendar,
  CreditCard,
  ChevronRight,
  Sparkles,
  Search,
  FileText,
} from 'lucide-react'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useGetAnnouncements, useGetStudentMaterials } from '#/components/query/AuthQuery.ts'
import { useCurrency } from '#/context/CurrencyContext.tsx'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import { useSchoolData } from '#/components/store/SchoolDataStore'
import { formatLocalizedFullDate } from '#/components/lib/formatLocalizedDate'
import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getDashboardHref } from '#/components/constants/navigation'

const PERIODS = [
  { label: 'Period 1', time: '7:30 – 8:30', start: '07:30', end: '08:30' },
  { label: 'Period 2', time: '8:30 – 9:30', start: '08:30', end: '09:30' },
  { label: 'Period 3', time: '9:30 – 10:30', start: '09:30', end: '10:30' },
  { label: 'Break', time: '10:30 – 11:00', start: '10:30', end: '11:00', isBreak: true },
  { label: 'Period 4', time: '11:00 – 12:00', start: '11:00', end: '12:00' },
  { label: 'Period 5', time: '12:00 – 13:00', start: '12:00', end: '13:00' },
]

export function StudentDashboard() {
  const currentData = useCurrentStudent()
  const { data: announcements } = useGetAnnouncements()
  const { data: materials } = useGetStudentMaterials()
  const { formatCurrency } = useCurrency()
  const { t, language } = useDashboardTranslation()
  const { school } = useSchoolData()
  const navigate = useNavigate()

  if (!currentData) return null

  const { student, yearGroup, studentTimetable } = currentData

  const feePct = Math.round((student.fees.paid / student.fees.total) * 100)
  const todayLessons = Object.values(studentTimetable)[0] || []
  const today = formatLocalizedFullDate(new Date(), language)

  const handleNavigate = (page: string) => {
    navigate({ to: getDashboardHref('STUDENT', page) })
  }

  // Calculate Next Class logic
  const nextClass = useMemo(() => {
    const now = new Date()
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    for (let i = 0; i < PERIODS.length; i++) {
      if (PERIODS[i].start > currentTimeStr) {
        // If it's a break or empty slot, find the next actual subject
        let found = null
        for (let j = i; j < PERIODS.length; j++) {
          const subject = todayLessons[j > 3 ? j - 1 : j] // Adjust for break at index 3
          if (subject && subject !== '-') {
            found = { subject, period: PERIODS[j] }
            break
          }
        }
        return found
      }
    }
    return null
  }, [todayLessons])

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <Sparkles size={12} style={{ marginRight: 6 }} />
              {yearGroup.name}
            </div>
            <h1 className={styles.heroTitle}>
              {t('student.dashboard.welcomeBack')}, <br />
              {student.name.split(' ')[0]}!
            </h1>
            <p className={styles.heroLead}>
              {nextClass ? (
                <>
                  Your next class is <strong>{nextClass.subject}</strong> at {nextClass.period.start}.
                  You have {todayLessons.filter(s => s !== '-').length} classes scheduled for today.
                </>
              ) : (
                <>
                  Awesome work today! You've completed all your classes. 
                  Your current attendance is at <strong>{student.att}%</strong>.
                </>
              )}
            </p>
            <div className={styles.heroMeta}>
              <span className={styles.metaChip}>
                <CalendarDays size={16} className="text-accent" />
                {today}
              </span>
              <span className={styles.metaChip}>
                <School size={16} className="text-accent" />
                {school.term} · {school.year}
              </span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <button
              className="btn btn-primary lg"
              onClick={() => handleNavigate('stimetable')}
            >
              <Clock size={20} /> {t('student.dashboard.myTimetable')}
            </button>
            <button
              className="btn btn-secondary lg"
              onClick={() => handleNavigate('sreport')}
            >
              <TrendingUp size={20} /> {t('student.dashboard.reportCard')}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.metricsGrid}>
        <div 
          className={`${styles.coloredStat} ${styles.indigo}`}
          onClick={() => handleNavigate('ssubjects')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.statIcon}><GraduationCap /></div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{yearGroup.name}</div>
            <div className={styles.statLabel}>{yearGroup.level}</div>
          </div>
        </div>
        <div 
          className={`${styles.coloredStat} ${styles.teal}`}
          onClick={() => handleNavigate('satt')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.statIcon}><UserCheck /></div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{student.att}%</div>
            <div className={styles.statLabel}>{t('student.dashboard.attendance')}</div>
          </div>
        </div>
        <div 
          className={`${styles.coloredStat} ${styles.amber}`}
          onClick={() => handleNavigate('sfees')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.statIcon}><Banknote /></div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{feePct}%</div>
            <div className={styles.statLabel}>{t('student.dashboard.feesStatus')}</div>
          </div>
        </div>
        <div 
          className={`${styles.coloredStat} ${styles.purple}`}
          onClick={() => handleNavigate('stimetable')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.statIcon}><BookOpen /></div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{todayLessons.filter(s => s !== '-').length}</div>
            <div className={styles.statLabel}>{t('student.dashboard.classesToday')}</div>
          </div>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.mainContent}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <Card>
              <CardHeader title="Recent Materials" action="View all" onAction={() => handleNavigate('scontent')}>
                <FileText size={20} className="text-accent" />
              </CardHeader>
              <div className={styles.materialsList}>
                {materials?.slice(0, 3).map((mat) => (
                  <div key={mat.id} className={styles.materialItem} onClick={() => handleNavigate('scontent')}>
                    <div className={styles.matIcon}>
                      <FileText size={20} />
                    </div>
                    <div className={styles.matInfo}>
                      <div className={styles.matTitle}>{mat.title}</div>
                      <div className={styles.matMeta}>{mat.subject.name} • {mat.teacher?.name}</div>
                    </div>
                  </div>
                ))}
                {(!materials || materials.length === 0) && (
                  <div className={styles.emptyState} style={{ padding: '20px' }}>
                    <Search size={24} style={{ opacity: 0.1, marginBottom: 8 }} />
                    <p style={{ fontSize: '0.8rem' }}>No new materials</p>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader 
                title={t('student.dashboard.schoolAnnouncements')}
                action="View all"
                onAction={() => handleNavigate('sann')}
              >
                <Sparkles size={20} className="text-accent" />
              </CardHeader>
              <div className={styles.annList}>
                {announcements?.slice(0, 3).map((ann) => (
                  <div key={ann.id} className={styles.annAnnouncementRow} onClick={() => handleNavigate('sann')}>
                    <div className={`${styles.annDot} ${ann.priority === 'Urgent' ? styles.urgent : styles.normal}`} />
                    <div className={styles.announcementInfo}>
                      <div className={styles.annTitle}>{ann.title}</div>
                      <div className={styles.annMeta}>
                        <Calendar size={12} />
                        {new Date(ann.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        <span>•</span>
                        <User size={12} />
                        {ann.author?.name || 'School Admin'}
                      </div>
                    </div>
                  </div>
                ))}
                {(!announcements || announcements.length === 0) && (
                  <div className={styles.emptyState} style={{ padding: '20px' }}>
                    <Search size={24} style={{ opacity: 0.1, marginBottom: 8 }} />
                    <p style={{ fontSize: '0.8rem' }}>{t('student.dashboard.noActiveAnnouncements')}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title={t('student.dashboard.feeOverview')}
              action={t('student.dashboard.payFees')}
              onAction={() => handleNavigate('sfees')}
            >
              <CreditCard size={20} className="text-amber" />
            </CardHeader>
            <div className={styles.feePreview}>
              <div className={styles.feeInfo}>
                <div className={styles.feeMain}>
                  <div className={styles.feeLabel}>
                    {t('student.dashboard.totalBalance')}
                  </div>
                  <div className={styles.feeValue}>
                    {formatCurrency(student.fees.total - student.fees.paid)}
                  </div>
                </div>
                <div className={styles.feeProgress}>
                  <div className={styles.progressLabel} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {t('student.dashboard.paymentProgress')}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)' }}>
                      {feePct}%
                    </span>
                  </div>
                  <ProgressBar pct={feePct} color="var(--accent)" height={12} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.sidebar}>
          <Card>
            <CardHeader title={t('student.dashboard.todaysSchedule')}>
              <Calendar size={20} className="text-accent" />
            </CardHeader>
            <div className={styles.timeline}>
              {PERIODS.map((p, index) => {
                let lesson = null
                if (!p.isBreak) {
                  const lessonIdx = index > 3 ? index - 1 : index
                  lesson = todayLessons[lessonIdx]
                }
                if (lesson === '-' && !p.isBreak) return null
                const isActive = nextClass?.period.label === p.label
                return (
                  <div key={p.label} className={`${styles.timelineItem} ${isActive ? styles.active : ''}`} onClick={() => handleNavigate('stimetable')} style={{ cursor: 'pointer' }}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineInfo}>
                        <span className={styles.timelineTime}>{p.time}</span>
                        <span className={styles.timelineTitle}>{p.isBreak ? 'Morning Break' : lesson}</span>
                      </div>
                      <span className={styles.timelineLabel}>{p.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Quick Actions">
              <Zap size={20} className="text-accent" />
            </CardHeader>
            <div className={styles.actions}>
              {[
                { page: 'sreport', label: t('student.dashboard.viewReport'), icon: <TrendingUp size={18} /> },
                { page: 'stimetable', label: t('student.dashboard.weeklyTimetable'), icon: <Calendar size={18} /> },
                { page: 'sfees', label: t('student.dashboard.feesAndFinances'), icon: <CreditCard size={18} /> },
              ].map((action) => (
                <button key={action.page} className={styles.actionBtn} onClick={() => handleNavigate(action.page)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className={styles.actionIcon}>{action.icon}</div>
                    {action.label}
                  </div>
                  <ChevronRight size={18} style={{ opacity: 0.4 }} />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
