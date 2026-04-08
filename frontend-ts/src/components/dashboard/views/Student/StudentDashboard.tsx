import {
  Badge,
  Card,
  CardHeader,
  MetricCard,
  PageHeader,
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
  ArrowRight,
} from 'lucide-react'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useGetAnnouncements } from '#/components/query/AuthQuery.ts'
import { useCurrency } from '#/context/CurrencyContext.tsx'

const PERIODS = [
  { label: 'Period 1', time: '7:30 – 8:30' },
  { label: 'Period 2', time: '8:30 – 9:30' },
  { label: 'Period 3', time: '9:30 – 10:30' },
  { label: 'Break', time: '10:30 – 11:00', isBreak: true },
  { label: 'Period 4', time: '11:00 – 12:00' },
  { label: 'Period 5', time: '12:00 – 13:00' },
]

interface StudentDashboardProps {
  onNavigate?: (page: string) => void
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const currentData = useCurrentStudent()
  const { data: announcements } = useGetAnnouncements()
  const { formatCurrency } = useCurrency()

  if (!currentData) return null

  const { student, yearGroup, teachers, studentGrades, studentTimetable } =
    currentData

  const feePct = Math.round((student.fees.paid / student.fees.total) * 100)
  const todayLessons = (Object.values(studentTimetable)[0] as string[]) || []
  const strongestSubject = [...studentGrades].sort(
    (left, right) => right.score - left.score,
  )[0]

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>{yearGroup.name}</div>
            <h1 className={styles.heroTitle}>
              Welcome back, {student.name.split(' ')[0]}
            </h1>
            <p className={styles.heroLead}>
              You have <strong>{todayLessons.length}</strong> classes scheduled
              for today. Your current attendance is{' '}
              <strong>{student.att}%</strong>.
            </p>
            <div className={styles.heroMeta}>
              <span className={styles.metaChip}>
                <CalendarDays size={12} strokeWidth={2} />
                {today}
              </span>
              <span className={styles.metaChip}>
                <School size={12} strokeWidth={2} />
                Term 2 · 2026
              </span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate?.('stimetable')}
            >
              <Clock size={16} /> My Timetable
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate?.('sreport')}
            >
              <TrendingUp size={16} /> Report Card
            </button>
          </div>
        </div>
      </header>

      <div className={styles.metricsGrid}>
        <MetricCard
          label="Current Year"
          value={yearGroup.name}
          sub={yearGroup.level}
          icon={GraduationCap}
          valueColor="var(--accent)"
        />
        <MetricCard
          label="Attendance"
          value={`${student.att}%`}
          sub="Present rate"
          icon={UserCheck}
          valueColor="var(--green)"
        />
        <MetricCard
          label="Fees Status"
          value={`${feePct}%`}
          sub={`Paid: ${formatCurrency(student.fees.paid)}`}
          icon={Banknote}
          valueColor={feePct >= 80 ? 'var(--green)' : 'var(--amber)'}
        />
        <MetricCard
          label="Classes Today"
          value={todayLessons.length}
          sub="Scheduled periods"
          icon={BookOpen}
        />
      </div>

      <div className={styles.twoCol}>
        <div className={styles.mainContent}>
          <Card>
            <CardHeader
              title="My Subjects"
              action="Details"
              onAction={() => onNavigate?.('ssubjects')}
            />
            <div className={styles.subjectsList}>
              {yearGroup.subjects.map((subject) => {
                const teacher = teachers.find((candidate: any) =>
                  candidate.specialization?.includes(subject),
                )
                return (
                  <div key={subject} className={styles.subjectRow}>
                    <div className={styles.subjectInfo}>
                      <div className={styles.subjectName}>{subject}</div>
                      <div className={styles.subjectTeacher}>
                        {teacher ? teacher.name : 'Teacher to be assigned'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Fee overview"
              action="Pay fees"
              onAction={() => onNavigate?.('sfees')}
            />
            <div className={styles.feePreview}>
              <div className={styles.feeInfo}>
                <div className={styles.feeMain}>
                  <div className={styles.feeLabel}>Total Balance</div>
                  <div className={styles.feeValue}>
                    {formatCurrency(student.fees.total - student.fees.paid)}
                  </div>
                </div>
                <div className={styles.feeProgress}>
                  <div className={styles.progressLabel}>
                    <span>Payment progress</span>
                    <span>{feePct}%</span>
                  </div>
                  <ProgressBar pct={feePct} color="var(--accent)" height={8} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.sidebar}>
          <Card>
            <CardHeader title="School Announcements" />
            <div className={styles.annList}>
              {announcements?.slice(0, 3).map((ann) => (
                <div key={ann.id} className={styles.announcementRow}>
                  <div
                    className={`${styles.announcementDot} ${
                      ann.priority === 'Urgent' ? styles.urgent : styles.normal
                    }`}
                  />
                  <div className={styles.announcementInfo}>
                    <div className={styles.announcementTitle}>{ann.title}</div>
                    <div className={styles.announcementMeta}>
                      {new Date(ann.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {(!announcements || announcements.length === 0) && (
                <div className={styles.emptyState}>No active announcements</div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Today's Schedule" />
            <div className={styles.scheduleList}>
              {todayLessons.slice(0, 4).map((subject, index) => (
                <div key={`${subject}-${index}`} className={styles.classRow}>
                  <div className={styles.classInfo}>
                    <span className={styles.className}>{subject}</span>
                    <span className={styles.classPeriod}>
                      {PERIODS[index]?.label}
                    </span>
                  </div>
                  <span className={styles.classTime}>
                    {PERIODS[index]?.time}
                  </span>
                </div>
              ))}
              {todayLessons.length === 0 && (
                <div className={styles.emptyState}>No classes today</div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Quick Links" />
            <div className={styles.actionsList}>
              {[
                ['sreport', 'View my report card'],
                ['stimetable', 'Weekly timetable'],
                ['sfees', 'Fees & finances'],
              ].map(([page, label]) => (
                <button
                  key={page}
                  className={styles.actionButton}
                  onClick={() => onNavigate?.(page)}
                >
                  {label} <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
