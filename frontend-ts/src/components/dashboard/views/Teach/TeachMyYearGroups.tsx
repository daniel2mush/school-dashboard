import { Badge } from '#/components/ui'
import styles from './TeachMyYearGroups.module.scss'
import { useGetTeacherClasses } from '#/components/query/TeacherQuery.ts'
import {
  BookOpen,
  GraduationCap,
  Users,
  DoorOpen,
  LayoutGrid,
} from 'lucide-react'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { TeacherTimetableModal } from './TeacherTimetableModal'

const CARD_ACCENTS = [
  {
    top: 'linear-gradient(90deg, var(--accent), var(--accent-hover))',
    surface: 'var(--accent-bg)',
    text: 'var(--accent-text)',
  },
  {
    top: 'linear-gradient(90deg, var(--amber), color-mix(in srgb, var(--amber) 80%, white))',
    surface: 'var(--amber-bg)',
    text: 'var(--amber-text)',
  },
  {
    top: 'linear-gradient(90deg, var(--purple-text), color-mix(in srgb, var(--purple-text) 72%, white))',
    surface: 'color-mix(in srgb, var(--purple-text) 12%, transparent)',
    text: 'var(--purple-text)',
  },
  {
    top: 'linear-gradient(90deg, var(--accent-text), var(--accent))',
    surface: 'color-mix(in srgb, var(--accent-text) 10%, transparent)',
    text: 'var(--accent-text)',
  },
  {
    top: 'linear-gradient(90deg, var(--blue), color-mix(in srgb, var(--blue) 70%, white))',
    surface: 'color-mix(in srgb, var(--blue) 12%, transparent)',
    text: 'var(--blue-text)',
  },
  {
    top: 'linear-gradient(90deg, var(--green), color-mix(in srgb, var(--green) 70%, white))',
    surface: 'color-mix(in srgb, var(--green) 12%, transparent)',
    text: 'var(--green)',
  },
]

function formatLevel(level: string) {
  return level.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export function TeachMyYearGroups() {
  const { data: classes, isLoading, error } = useGetTeacherClasses()
  const [selectedYgId, setSelectedYgId] = useState<number | null>(null)

  if (isLoading) {
    return (
      <section className={styles.view}>
        <div className={styles.panel}>Loading your classes...</div>
      </section>
    )
  }

  if (error || !classes) {
    return (
      <section className={styles.view}>
        <div className={styles.panel}>
          An error occurred fetching your classes.
        </div>
      </section>
    )
  }

  const selectedYg = selectedYgId
    ? classes.find((c) => c.id === selectedYgId)
    : null
  const totalStudents = classes.reduce(
    (count, group) => count + (group.students?.length || 0),
    0,
  )
  const totalSubjects = new Set(
    classes.flatMap((group) => group.subjects.map((subject) => subject.id)),
  ).size

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.panelCopy}>
          <div className={styles.eyebrow}>Class Management</div>
          <h2 className={styles.title}>Your Assigned Year Groups</h2>
          <p className={styles.copy}>
            Professional overview of your cohorts. Review student counts, room
            assignments, and access class timetables.
          </p>
          <div className={styles.panelMeta}>
            <span>{classes.length} year groups</span>
            <span>{totalStudents} students</span>
            <span>{totalSubjects} subjects</span>
          </div>
        </div>
      </div>

      {classes.length === 0 ? (
        <div
          style={{
            padding: 80,
            textAlign: 'center',
            border: '1px dashed var(--border-mid)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <div
            style={{
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              width: 64,
              height: 64,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifySelf: 'center',
              marginBottom: 16,
              justifyContent: 'center',
            }}
          >
            <LayoutGrid size={32} />
          </div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>
            No classes assigned
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            You have not been assigned to any year groups yet. Please contact
            the administration.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {classes.map((yg, index) => {
            const accent = CARD_ACCENTS[(yg.id + index) % CARD_ACCENTS.length]
            return (
              <article
                key={yg.id}
                className={styles.card}
                onClick={() => setSelectedYgId(yg.id)}
                style={
                  {
                    '--card-accent-bar': accent.top,
                    '--card-accent-surface': accent.surface,
                    '--card-accent-text': accent.text,
                  } as CSSProperties
                }
              >
                <div className={styles.cardTopBar} aria-hidden />
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleBlock}>
                    <div className={styles.cardIcon}>
                      <GraduationCap size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className={styles.yearGroupName}>{yg.name}</h3>
                      <div className={styles.levelRow}>
                        <span className={styles.levelLabel}>
                          {formatLevel(yg.level)}
                        </span>
                        <Badge variant="purple">Active</Badge>
                      </div>
                      {yg.roomNumber && (
                        <div className={styles.room}>
                          <DoorOpen size={12} strokeWidth={2} aria-hidden />
                          Room: {yg.roomNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.statBlock}>
                    <Users
                      className={styles.statIconSvg}
                      size={16}
                      strokeWidth={2}
                    />
                    <div>
                      <div className={styles.statValue}>
                        {yg.students?.length || 0}
                      </div>
                      <div className={styles.statLabel}>Students</div>
                    </div>
                  </div>
                  <div className={styles.statBlock}>
                    <BookOpen
                      className={styles.statIconSvg}
                      size={16}
                      strokeWidth={2}
                    />
                    <div>
                      <div className={styles.statValue}>
                        {yg.subjects?.length || 0}
                      </div>
                      <div className={styles.statLabel}>Subjects</div>
                    </div>
                  </div>
                </div>

                <div className={styles.subjectsBlock}>
                  <div className={styles.blockLabel}>Curriculum</div>
                  {yg.subjects && yg.subjects.length > 0 ? (
                    <div className={styles.subjectsList}>
                      {yg.subjects.slice(0, 3).map((sub) => (
                        <span key={sub.id} className={styles.subjectPill}>
                          {sub.name}
                        </span>
                      ))}
                      {yg.subjects.length > 3 && (
                        <span className={styles.subjectPill}>
                          +{yg.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className={styles.muted}>No subjects linked.</p>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.cardHint}>
                    Tap to open timetable details
                  </span>
                  <span className={styles.cardAction}>View schedule</span>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {selectedYg && (
        <TeacherTimetableModal
          yearGroup={selectedYg}
          onClose={() => setSelectedYgId(null)}
        />
      )}
    </section>
  )
}
