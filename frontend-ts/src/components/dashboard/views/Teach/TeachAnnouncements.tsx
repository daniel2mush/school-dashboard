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

type TabType = 'ALL' | 'FACULTY' | 'MY_CLASSES'

export function TeachAnnouncements() {
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
    if (announcement.targetType === 'TEACHERS_ONLY') return 'Teachers Only'
    if (announcement.targetType === 'ALL') return 'Everyone'
    return `Class: ${announcement.targetYearGroup?.name || 'Selected class'}`
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
        <p>Syncing broadcast systems...</p>
      </div>
    )
  }

  return (
    <section className={styles.view}>
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <Megaphone size={14} />
            Faculty & Class Communication
          </div>
          <h1 className={styles.title}>Teacher Briefings</h1>
          <p className={styles.subtitle}>
            Read school-wide and staff notices, then post updates to the classes
            you actually teach.
          </p>
        </div>
        <button
          type="button"
          className={styles.createTrigger}
          onClick={() => setShowCreateForm(true)}
          disabled={teacherClasses.length === 0}
        >
          <Plus size={18} />
          <span>New Class Announcement</span>
        </button>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.contentCol}>
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${activeTab === 'ALL' ? styles.active : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              All Notices
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'FACULTY' ? styles.active : ''}`}
              onClick={() => setActiveTab('FACULTY')}
            >
              Faculty Only
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'MY_CLASSES' ? styles.active : ''}`}
              onClick={() => setActiveTab('MY_CLASSES')}
            >
              Class Updates
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
                    By {ann.author?.name} • {ann.author?.role}
                  </span>
                  <span className={styles.date}>
                    {new Date(ann.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </article>
            ))}

            {filteredAnnouncements.length === 0 && (
              <div className={styles.emptyState}>
                <Megaphone size={48} />
                <p>No announcements found in this category.</p>
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
                <h2 className={styles.modalTitle}>New Class Announcement</h2>
                <p className={styles.modalSubtitle}>
                  This will be visible only to students in the class you
                  select.
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
                  Announcement Title
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Upcoming Project Deadline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formSection}>
                  <label className={styles.label}>
                    <Target size={16} />
                    Target Class
                  </label>
                  <select
                    className={styles.select}
                    value={targetYearGroupId}
                    onChange={(e) => setTargetYearGroupId(e.target.value)}
                    required
                  >
                    <option value="">Select a class</option>
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
                    Priority Level
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
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className={styles.formSection}>
                <label className={styles.label}>Announcement Details</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Provide detailed instructions or information..."
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isPending || teacherClasses.length === 0}
                >
                  {isPending ? (
                    'Broadcasting...'
                  ) : (
                    <>
                      <Send size={18} />
                      Broadcast Announcement
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
