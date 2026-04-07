import styles from './AdminYearGroups.module.scss'
import { Badge } from '@/components/ui'
import {
  CreateYearGroupModal,
  EditYearGroupModal,
  TeacherRosterModal,
  MoveStudentModal,
  YearGroupSubjectsModal,
} from './AdminYearGroupsModals'
import {
  BookOpen,
  DoorOpen,
  Edit,
  GraduationCap,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Users,
  UserRoundPlus,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import {
  useGetSchoolStructure,
  useGetAllUsers,
} from '#/components/query/AdminQuery'

function formatLevel(level: string) {
  return level.replace(/([a-z])([A-Z])/g, '$1 $2')
}

const CARD_ACCENTS = [
  {
    top: 'linear-gradient(90deg, #0f766e, #14b8a6)',
    surface: 'rgba(20, 184, 166, 0.12)',
    text: '#0f766e',
  },
  {
    top: 'linear-gradient(90deg, #b45309, #f59e0b)',
    surface: 'rgba(245, 158, 11, 0.14)',
    text: '#b45309',
  },
  {
    top: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
    surface: 'rgba(167, 139, 250, 0.16)',
    text: '#6d28d9',
  },
  {
    top: 'linear-gradient(90deg, #be123c, #fb7185)',
    surface: 'rgba(251, 113, 133, 0.14)',
    text: '#be123c',
  },
  {
    top: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
    surface: 'rgba(96, 165, 250, 0.16)',
    text: '#1d4ed8',
  },
  {
    top: 'linear-gradient(90deg, #166534, #4ade80)',
    surface: 'rgba(74, 222, 128, 0.14)',
    text: '#166534',
  },
]

export function AdminYearGroups() {
  const { data: yearGroups, isLoading } = useGetSchoolStructure()
  const { data: allUsers, isLoading: usersLoading } = useGetAllUsers()

  const [createOpen, setCreateOpen] = useState(false)
  const [editForId, setEditForId] = useState<number | null>(null)
  const [rosterForId, setRosterForId] = useState<number | null>(null)
  const [moveForId, setMoveForId] = useState<number | null>(null)
  const [subjectsForId, setSubjectsForId] = useState<number | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)

  useEffect(() => {
    if (menuOpenId === null) return
    const close = () => setMenuOpenId(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [menuOpenId])

  const rosterYearGroup =
    rosterForId != null && yearGroups
      ? yearGroups.find((y) => y.id === rosterForId)
      : undefined
  const moveYearGroup =
    moveForId != null && yearGroups
      ? yearGroups.find((y) => y.id === moveForId)
      : undefined
  const subjectYearGroup =
    subjectsForId != null && yearGroups
      ? yearGroups.find((y) => y.id === subjectsForId)
      : undefined
  const editingYearGroup =
    editForId != null && yearGroups
      ? yearGroups.find((y) => y.id === editForId)
      : undefined

  if (isLoading || usersLoading || !yearGroups || !allUsers) {
    return <div className={styles.view}>Loading cohort structure…</div>
  }

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>Structure</div>
            <h1 className={styles.title}>Year groups</h1>
            <p className={styles.copy}>
              Cohorts anchor enrolment, staffing, fees, and timetables. Create a
              group, then assign teachers and move students as your school
              evolves.
            </p>
            <div className={styles.heroStats}>
              <span className={styles.heroStat}>
                <LayoutGrid size={14} strokeWidth={2} aria-hidden />
                {yearGroups.length} cohort
                {yearGroups.length === 1 ? '' : 's'}
              </span>
              <span className={styles.heroStat}>
                <Users size={14} strokeWidth={2} aria-hidden />
                {yearGroups.reduce((n, y) => n + y._count.students, 0)} students
                enrolled
              </span>
            </div>
          </div>
          <button
            type="button"
            className={`btn btn-primary ${styles.heroCta}`}
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={18} strokeWidth={2} />
            New year group
          </button>
        </div>
      </header>

      {yearGroups.length === 0 ? (
        <div className={styles.emptyBoard}>
          <div className={styles.emptyIcon}>
            <LayoutGrid size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyTitle}>No cohorts yet</h2>
          <p className={styles.emptyText}>
            Start by creating your first year group. You can refine subjects and
            fees from other admin sections.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCreateOpen(true)}
          >
            Create year group
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {yearGroups.map((yg, index) => {
            const accent = CARD_ACCENTS[(yg.id + index) % CARD_ACCENTS.length]

            return (
              <article
                key={yg.id}
                className={styles.card}
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
                      <h2 className={styles.name}>{yg.name}</h2>
                      <div className={styles.levelRow}>
                        <span className={styles.level}>
                          {formatLevel(yg.level)}
                        </span>
                        <Badge variant="green">Active</Badge>
                      </div>
                      {yg.roomNumber ? (
                        <div className={styles.room}>
                          <DoorOpen size={12} strokeWidth={2} aria-hidden />
                          {yg.roomNumber}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className={styles.menuWrap}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={styles.menuTrigger}
                      aria-label="Cohort actions"
                      aria-expanded={menuOpenId === yg.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpenId((v) => (v === yg.id ? null : yg.id))
                      }}
                    >
                      <MoreHorizontal size={18} strokeWidth={2} />
                    </button>
                    {menuOpenId === yg.id ? (
                      <div
                        className={styles.dropdown}
                        role="menu"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.dropdownItem}
                          onClick={() => {
                            setEditForId(yg.id)
                            setMenuOpenId(null)
                          }}
                        >
                          <Edit size={15} strokeWidth={2} />
                          Edit details
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.dropdownItem}
                          onClick={() => {
                            setRosterForId(yg.id)
                            setMenuOpenId(null)
                          }}
                        >
                          <UserRoundPlus size={15} strokeWidth={2} />
                          Assign teachers
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.dropdownItem}
                          onClick={() => {
                            setSubjectsForId(yg.id)
                            setMenuOpenId(null)
                          }}
                        >
                          <BookOpen size={15} strokeWidth={2} />
                          Manage subjects
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.dropdownItem}
                          onClick={() => {
                            setMoveForId(yg.id)
                            setMenuOpenId(null)
                          }}
                        >
                          <Users size={15} strokeWidth={2} />
                          Move student
                        </button>
                      </div>
                    ) : null}
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
                        {yg._count.students}
                      </div>
                      <div className={styles.statLabel}>Students</div>
                    </div>
                  </div>
                  <div className={styles.statBlock}>
                    <GraduationCap
                      className={styles.statIconSvg}
                      size={16}
                      strokeWidth={2}
                    />
                    <div>
                      <div className={styles.statValue}>
                        {yg._count.teachers}
                      </div>
                      <div className={styles.statLabel}>Teachers</div>
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
                        {yg.subjects.length}
                      </div>
                      <div className={styles.statLabel}>Subjects</div>
                    </div>
                  </div>
                </div>

                <div className={styles.teachersBlock}>
                  <div className={styles.blockLabel}>Teaching team</div>
                  {yg.teachers.length === 0 ? (
                    <p className={styles.muted}>No teachers assigned.</p>
                  ) : (
                    <div className={styles.teacherChips}>
                      {yg.teachers.map((t) => {
                        const initials = t.name
                          .split(/\s+/)
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                        return (
                          <span key={t.id} className={styles.teacherChip}>
                            <span className={styles.teacherChipAvatar}>
                              {initials}
                            </span>
                            <span className={styles.teacherChipName}>
                              {t.name}
                            </span>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className={styles.subjectsBlock}>
                  <div className={styles.blockLabel}>Curriculum</div>
                  {yg.subjects.length > 0 ? (
                    <div className={styles.subjectsList}>
                      {yg.subjects.map((sub) => (
                        <span key={sub.id} className={styles.subjectPill}>
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.muted}>
                      No subjects linked — attach from subject management when
                      ready.
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {createOpen ? (
        <CreateYearGroupModal onClose={() => setCreateOpen(false)} />
      ) : null}
      {editingYearGroup ? (
        <EditYearGroupModal
          key={editingYearGroup.id}
          yearGroup={editingYearGroup}
          onClose={() => setEditForId(null)}
        />
      ) : null}
      {rosterYearGroup ? (
        <TeacherRosterModal
          key={rosterYearGroup.id}
          yearGroup={rosterYearGroup}
          allUsers={allUsers}
          onClose={() => setRosterForId(null)}
        />
      ) : null}
      {moveYearGroup ? (
        <MoveStudentModal
          key={moveYearGroup.id}
          sourceYearGroup={moveYearGroup}
          allYearGroups={yearGroups}
          allUsers={allUsers}
          onClose={() => setMoveForId(null)}
        />
      ) : null}
      {subjectYearGroup ? (
        <YearGroupSubjectsModal
          key={subjectYearGroup.id}
          yearGroup={subjectYearGroup}
          onClose={() => setSubjectsForId(null)}
        />
      ) : null}
    </section>
  )
}
