import {
  Badge,
  Card,
  CardHeader,
  ProgressBar,
  GradeRing,
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
  ArrowRight,
  Zap,
  Award,
  Star,
  Target,
} from 'lucide-react'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useGetAnnouncements } from '#/components/query/AuthQuery.ts'
import { useCurrency } from '#/context/CurrencyContext.tsx'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import { useSchoolData } from '#/components/store/SchoolDataStore'
import { formatLocalizedFullDate } from '#/components/lib/formatLocalizedDate'
import { useMemo } from 'react'

const PERIODS = [
  { label: 'Period 1', time: '7:30 – 8:30', start: '07:30', end: '08:30' },
  { label: 'Period 2', time: '8:30 – 9:30', start: '08:30', end: '09:30' },
  { label: 'Period 3', time: '9:30 – 10:30', start: '09:30', end: '10:30' },
  { label: 'Break', time: '10:30 – 11:00', start: '10:30', end: '11:00', isBreak: true },
  { label: 'Period 4', time: '11:00 – 12:00', start: '11:00', end: '12:00' },
  { label: 'Period 5', time: '12:00 – 13:00', start: '12:00', end: '13:00' },
]

interface StudentDashboardProps {
  onNavigate?: (page: string) => void
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const currentData = useCurrentStudent()
  const { data: announcements } = useGetAnnouncements()
  const { formatCurrency } = useCurrency()
  const { t, language } = useDashboardTranslation()
  const { school } = useSchoolData()

  if (!currentData) return null

  const { student, yearGroup, studentGrades, studentTimetable } = currentData

  const feePct = Math.round((student.fees.paid / student.fees.total) * 100)
  const todayLessons = Object.values(studentTimetable)[0] || []
  const today = formatLocalizedFullDate(new Date(), language)

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

  // Sort grades for the "Recent Performance" section
  const recentGrades = useMemo(() => {
    return [...studentGrades].slice(0, 4)
  }, [studentGrades])

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>{yearGroup.name}</div>
            <h1 className={styles.heroTitle}>
              {t('student.dashboard.welcomeBack')}, {student.name.split(' ')[0]}
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
                <CalendarDays size={14} className="text-accent" />
                {today}
              </span>
              <span className={styles.metaChip}>
                <School size={14} className="text-accent" />
                {school.term} · {school.year}
              </span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <button
              className="btn btn-primary lg"
              onClick={() => onNavigate?.('stimetable')}
            >
              <Clock size={18} /> {t('student.dashboard.myTimetable')}
            </button>
            <button
              className="btn btn-secondary lg"
              onClick={() => onNavigate?.('sreport')}
            >
              <TrendingUp size={18} /> {t('student.dashboard.reportCard')}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.metricsGrid}>
        <div className={`${styles.coloredStat} ${styles.indigo}`}>
          <div className={styles.statIcon}><GraduationCap size={24} /></div>
          <div className={styles.statValue}>{yearGroup.name}</div>
          <div className={styles.statLabel}>{yearGroup.level}</div>
        </div>
        <div className={`${styles.coloredStat} ${styles.teal}`}>
          <div className={styles.statIcon}><UserCheck size={24} /></div>
          <div className={styles.statValue}>{student.att}%</div>
          <div className={styles.statLabel}>{t('student.dashboard.attendance')}</div>
        </div>
        <div className={`${styles.coloredStat} ${styles.amber}`}>
          <div className={styles.statIcon}><Banknote size={24} /></div>
          <div className={styles.statValue}>{feePct}%</div>
          <div className={styles.statLabel}>{t('student.dashboard.feesStatus')}</div>
        </div>
        <div className={`${styles.coloredStat} ${styles.purple}`}>
          <div className={styles.statIcon}><BookOpen size={24} /></div>
          <div className={styles.statValue}>{todayLessons.filter(s => s !== '-').length}</div>
          <div className={styles.statLabel}>{t('student.dashboard.classesToday')}</div>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.mainContent}>
          <Card>
            <CardHeader
              title="Academic Performance"
              action={t('student.dashboard.details')}
              onAction={() => onNavigate?.('sreport')}
            >
              <Target size={18} className="text-accent" />
            </CardHeader>
            <div className={styles.performanceList}>
              {recentGrades.map((g, idx) => (
                <div key={`${g.subject}-${idx}`} className={styles.performanceRow}>
                  <GradeRing 
                    letter={g.grade} 
                    bg="var(--accent-bg)" 
                    textColor="var(--accent)" 
                    size={44} 
                  />
                  <div className={styles.perfInfo}>
                    <div className={styles.perfSubject}>{g.subject}</div>
                    <div className={styles.perfTeacher}>{g.teacher}</div>
                  </div>
                  <div className={styles.perfScore}>
                    <div className={styles.scoreValue}>{g.score}%</div>
                    <Badge variant={g.score >= 70 ? 'green' : 'amber'}>
                      {g.performance || 'Good Progress'}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentGrades.length === 0 && (
                <div className={styles.emptyState}>
                  No recent grades available. Keep pushing!
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title={t('student.dashboard.feeOverview')}
              action={t('student.dashboard.payFees')}
              onAction={() => onNavigate?.('sfees')}
            >
              <Zap size={18} className="text-amber" />
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
                  <div className={styles.progressLabel} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t('student.dashboard.paymentProgress')}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{feePct}%</span>
                  </div>
                  <ProgressBar pct={feePct} color="var(--accent)" height={10} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.sidebar}>
          <Card>
            <CardHeader title={t('student.dashboard.todaysSchedule')}>
              <CalendarDays size={18} className="text-accent" />
            </CardHeader>
            <div className={styles.timeline}>
              {PERIODS.map((p, index) => {
                // todayLessons covers periods 1,2,3,4,5. Index 3 is Break.
                let lesson = null
                if (!p.isBreak) {
                  const lessonIdx = index > 3 ? index - 1 : index
                  lesson = todayLessons[lessonIdx]
                }

                if (lesson === '-' && !p.isBreak) return null

                return (
                  <div 
                    key={p.label} 
                    className={`${styles.timelineItem} ${nextClass?.period.label === p.label ? styles.active : ''}`}
                  >
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
            <CardHeader title={t('student.dashboard.schoolAnnouncements')}>
              <Award size={18} className="text-accent" />
            </CardHeader>
            <div className={styles.annList}>
              {announcements?.slice(0, 3).map((ann) => (
                <div key={ann.id} className={styles.annAnnouncementRow}>
                  <div
                    className={`${styles.annDot} ${
                      ann.priority === 'Urgent' ? styles.urgent : styles.normal
                    }`}
                  />
                  <div className={styles.announcementInfo}>
                    <div className={styles.annTitle}>{ann.title}</div>
                    <div className={styles.annMeta}>
                      {new Date(ann.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })} · {ann.author?.name || 'School Admin'}
                    </div>
                  </div>
                </div>
              ))}
              {(!announcements || announcements.length === 0) && (
                <div className={styles.emptyState}>
                  {t('student.dashboard.noActiveAnnouncements')}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Quick Actions">
              <Star size={18} className="text-accent" />
            </CardHeader>
            <div className={styles.actions}>
              {[
                ['sreport', t('student.dashboard.viewReport')],
                ['stimetable', t('student.dashboard.weeklyTimetable')],
                ['sfees', t('student.dashboard.feesAndFinances')],
              ].map(([page, label]) => (
                <button
                  key={page}
                  className={styles.actionBtn}
                  onClick={() => onNavigate?.(page)}
                >
                  {label} <ArrowRight size={16} />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
