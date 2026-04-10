import { useState } from 'react'
import styles from './TeachSubjectsContent.module.scss'
import {
  useGetTeacherClasses,
  useGetTeacherMaterials,
  useUploadMaterial,
  useToggleMaterialStatus,
} from '#/components/query/TeacherQuery.ts'
import {
  Upload,
  FileText,
  Download,
  X,
  FilePlus,
  Info,
  MoreVertical,
  Eye,
  EyeOff,
  Search,
  Filter,
  Video,
  Music,
  File as FileIcon,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

export function TeachSubjectsContent() {
  const { t, language } = useDashboardTranslation()
  const { data: classes, isLoading: classesLoading } = useGetTeacherClasses()
  const { data: materials, isLoading: materialsLoading } =
    useGetTeacherMaterials()
  const uploadMutation = useUploadMaterial()
  const toggleStatusMutation = useToggleMaterialStatus()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    yearGroupId: '',
    fileUrl: 'https://example.com/mock-file.pdf',
    isPublished: true,
  })

  const classList = classes ?? []
  const materialList = materials ?? []

  const subjectMap = new Map()
  classList.forEach((yg) => {
    yg.subjects.forEach((sub) => {
      if (!subjectMap.has(sub.id)) {
        subjectMap.set(sub.id, { ...sub })
      }
    })
  })

  const subjects = Array.from(subjectMap.values())

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.subjectId) return

    await uploadMutation.mutateAsync({
      title: formData.title,
      description: formData.description,
      subjectId: Number(formData.subjectId),
      yearGroupId: formData.yearGroupId
        ? Number(formData.yearGroupId)
        : undefined,
      fileUrl: formData.fileUrl,
      fileType: formData.fileUrl.split('.').pop() || 'pdf',
    })

    setIsModalOpen(false)
    setFormData({
      title: '',
      description: '',
      subjectId: '',
      yearGroupId: '',
      fileUrl: 'https://example.com/mock-file.pdf',
      isPublished: true,
    })
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    await toggleStatusMutation.mutateAsync({
      id,
      isPublished: !currentStatus,
    })
  }

  const getFileIcon = (type?: string) => {
    const t = type?.toLowerCase()
    if (t?.includes('mp4') || t?.includes('video'))
      return <Video size={20} className="text-red-500" />
    if (t?.includes('mp3') || t?.includes('audio'))
      return <Music size={20} className="text-pink-500" />
    if (t?.includes('pdf'))
      return <FileText size={20} className="text-orange-500" />
    return <FileIcon size={20} className="text-blue-500" />
  }

  const filteredMaterials = materialList.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <section className={styles.view}>
      <header className={styles.panel}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>{t('teacher.content.eyebrow')}</div>
          <h2 className={styles.title}>{t('teacher.content.title')}</h2>
          <p className={styles.copy}>
            {t('teacher.content.copy')}
          </p>
        </div>
        <div className={styles.heroActions}>
          <button
            className={styles.uploadBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <Upload size={18} />
            <span>{t('teacher.content.upload')}</span>
          </button>
        </div>
      </header>

      <div className={styles.contentActions}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t('teacher.content.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <button className={styles.filterBtn}>
            <Filter size={18} />
            <span>{t('teacher.content.filter')}</span>
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {materialsLoading && (
          <div className={styles.loadingBanner}>
            {t('teacher.content.loading')}
          </div>
        )}
        {materialsLoading ||
        (filteredMaterials && filteredMaterials.length > 0) ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('teacher.content.table.content')}</th>
                <th>{t('teacher.content.table.subject')}</th>
                <th>{t('teacher.content.table.class')}</th>
                <th>{t('teacher.content.table.dateUploaded')}</th>
                <th>{t('teacher.content.table.status')}</th>
                <th className={styles.actionsCell}>
                  {t('teacher.content.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials?.map((material) => (
                <tr key={material.id}>
                  <td>
                    <div className={styles.fileNameCell}>
                      <div className={styles.fileIconWrapper}>
                        {getFileIcon(material.fileType || undefined)}
                      </div>
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>{material.title}</span>
                        <span className={styles.fileDesc}>
                          {material.description ||
                            t('teacher.content.noDescription')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.subjectBadge}>
                      {material.subject.name}
                    </span>
                  </td>
                  <td>
                    <span className={styles.classText}>
                      {material.yearGroup?.name || t('teacher.content.allClasses')}
                    </span>
                  </td>
                  <td>
                    <span className={styles.dateText}>
                      {new Date(material.createdAt).toLocaleDateString(
                        language === 'fr' ? 'fr-FR' : undefined,
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </span>
                  </td>
                  <td>
                    <div className={styles.statusToggleCell}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={material.isPublished}
                          onChange={() =>
                            handleToggleStatus(material.id, material.isPublished)
                          }
                        />
                        <span
                          className={`${styles.slider} ${styles.round}`}
                        ></span>
                      </label>
                      <span
                        className={
                          material.isPublished
                            ? styles.statusActive
                            : styles.statusDraft
                        }
                      >
                        {material.isPublished
                          ? t('teacher.content.live')
                          : t('teacher.content.draft')}
                      </span>
                    </div>
                  </td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actionButtons}>
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.iconBtn}
                        title={t('teacher.content.download')}
                      >
                        <Download size={18} />
                      </a>
                      <button
                        className={styles.iconBtn}
                        title={t('teacher.content.moreOptions')}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {materialsLoading && (
                <tr>
                  <td colSpan={6} className={styles.loadingState}>
                    {t('teacher.content.preparing')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyTableState}>
            <div className={styles.emptyIcon}>
              <FilePlus size={32} />
            </div>
            <p>
              {searchQuery
                ? t('teacher.content.noSearchResults')
                : t('teacher.content.noMaterials')}
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t('teacher.content.upload')}</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {t('teacher.content.contentTitle')}
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder={t('teacher.content.contentTitlePlaceholder')}
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {t('teacher.content.table.subject')}
                      </label>
                      <select
                        className={styles.select}
                        value={formData.subjectId}
                        disabled={classesLoading}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subjectId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">
                          {classesLoading
                            ? t('teacher.content.loadingSubjects')
                            : t('teacher.content.selectSubject')}
                        </option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {t('teacher.content.assignToClass')}
                      </label>
                      <select
                        className={styles.select}
                        value={formData.yearGroupId}
                        disabled={classesLoading}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            yearGroupId: e.target.value,
                          })
                        }
                      >
                        <option value="">
                          {classesLoading
                            ? t('teacher.content.loadingClasses')
                            : t('teacher.content.allAssignedClasses')}
                        </option>
                        {classList.map((yg) => (
                          <option key={yg.id} value={yg.id}>
                            {yg.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                      <label className={styles.label}>
                      {t('teacher.content.description')}
                    </label>
                    <textarea
                      className={styles.textarea}
                      placeholder={t('teacher.content.descriptionPlaceholder')}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className={styles.uploadArea}>
                    <div className={styles.uploadPlaceholder}>
                      <Upload size={24} />
                      <p>{t('teacher.content.uploadPlaceholder')}</p>
                      <span>{t('teacher.content.uploadSupport')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  {t('teacher.content.cancel')}
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending
                    ? t('teacher.content.processing')
                    : t('teacher.content.savePublish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
