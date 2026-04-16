import styles from './AdminYearGroups.module.scss'
import { Badge } from '@/components/ui'
import {
  CreateYearGroupModal,
  EditYearGroupModal,
  TeacherRosterModal,
  MoveStudentModal,
  YearGroupSubjectsModal,
  YearGroupDetailsModal,
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
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  useGetSchoolStructure,
  useGetAllUsers,
} from '#/components/query/AdminQuery'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

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
  const { t } = useDashboardTranslation()

  const [createOpen, setCreateOpen] = useState(false)
  const [editForId, setEditForId] = useState<number | null>(null)
  const [rosterForId, setRosterForId] = useState<number | null>(null)
  const [moveForId, setMoveForId] = useState<number | null>(null)
  const [subjectsForId, setSubjectsForId] = useState<number | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const [detailForId, setDetailForId] = useState<number | null>(null)

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
  const detailYearGroup =
    detailForId != null && yearGroups
      ? yearGroups.find((y) => y.id === detailForId)
      : undefined

  if (isLoading || usersLoading || !yearGroups || !allUsers) {
    return <div className={styles.view}>{t('admin.yearGroups.loading')}</div>
  }

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.heroStats}>
              <span className={styles.heroStat}>
                <LayoutGrid size={14} strokeWidth={2} aria-hidden />
                {t('admin.yearGroups.cohortsCount').replace(
                  '{count}',
                  String(yearGroups.length),
                )}
              </span>
              <span className={styles.heroStat}>
                <Users size={14} strokeWidth={2} aria-hidden />
                {t('admin.yearGroups.studentsEnrolled').replace(
                  '{count}',
                  String(yearGroups.reduce((n, y) => n + y._count.students, 0)),
                )}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={`btn btn-primary ${styles.heroCta}`}
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={18} strokeWidth={2} />
            {t('admin.yearGroups.newYearGroup')}
          </button>
        </div>
      </header>

      {yearGroups.length === 0 ? (
        <div className={styles.emptyBoard}>
          <div className={styles.emptyIcon}>
            <LayoutGrid size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyTitle}>
            {t('admin.yearGroups.noCohorts')}
          </h2>
          <p className={styles.emptyText}>
            {t('admin.yearGroups.noCohortsCopy')}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCreateOpen(true)}
          >
            {t('admin.yearGroups.createYearGroup')}
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
                onClick={() => setDetailForId(yg.id)}
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
                        <Badge variant="green">
                          {t('admin.yearGroups.active')}
                        </Badge>
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
                      aria-label={t('admin.yearGroups.cohortActions')}
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
                          {t('admin.yearGroups.editDetails')}
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
                          {t('admin.yearGroups.assignTeachers')}
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
                          {t('admin.yearGroups.manageSubjects')}
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
                          {t('admin.yearGroups.moveStudent')}
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
                      <div className={styles.statLabel}>
                        {t('admin.yearGroups.students')}
                      </div>
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
                      <div className={styles.statLabel}>
                        {t('admin.yearGroups.teachers')}
                      </div>
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
                      <div className={styles.statLabel}>
                        {t('admin.yearGroups.subjects')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.subjectsBlock}>
                  <div className={styles.blockLabel}>
                    {t('admin.yearGroups.curriculum')}
                  </div>
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
                      {t('admin.yearGroups.noSubjectsLinked')}
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
      {detailYearGroup ? (
        <YearGroupDetailsModal
          key={detailYearGroup.id}
          yearGroup={detailYearGroup}
          allUsers={allUsers}
          onClose={() => setDetailForId(null)}
        />
      ) : null}
    </section>
  )
}
