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

export function TeachSubjectsContent() {
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
            <div className={styles.eyebrow}>Resource Management</div>
          <h2 className={styles.title}>Class Content</h2>
          <p className={styles.copy}>
            Manage and distribute learning resources across your assigned
            classes. Track publication status and keep lesson content organized
            in one place.
          </p>
        </div>
        <div className={styles.heroActions}>
          <button
            className={styles.uploadBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <Upload size={18} />
            <span>Upload Class Content</span>
          </button>
        </div>
      </header>

      <div className={styles.contentActions}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search class content by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <button className={styles.filterBtn}>
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {materialsLoading && (
          <div className={styles.loadingBanner}>
            Loading class content...
          </div>
        )}
        {materialsLoading ||
        (filteredMaterials && filteredMaterials.length > 0) ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Class Content</th>
                <th>Subject</th>
                <th>Class / Year Group</th>
                <th>Date Uploaded</th>
                <th>Status</th>
                <th className={styles.actionsCell}>Actions</th>
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
                          {material.description || 'No description provided.'}
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
                      {material.yearGroup?.name || 'All Classes'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.dateText}>
                      {format(new Date(material.createdAt), 'MMM d, yyyy')}
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
                        {material.isPublished ? 'Live' : 'Draft'}
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
                        title="Download"
                      >
                        <Download size={18} />
                      </a>
                      <button className={styles.iconBtn} title="More Options">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {materialsLoading && (
                <tr>
                  <td colSpan={6} className={styles.loadingState}>
                    Preparing class content list...
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
                ? 'No materials found matching your search.'
                : 'No materials uploaded yet. Start by uploading your first resource.'}
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Upload Class Content</h3>
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
                    <label className={styles.label}>Class Content Title</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g., Year 1 Physics - Mechanics"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Subject</label>
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
                          {classesLoading ? 'Loading subjects...' : 'Select subject'}
                        </option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Assign to Class</label>
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
                            ? 'Loading classes...'
                            : 'All assigned classes'}
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
                      Description (Internal reference)
                    </label>
                    <textarea
                      className={styles.textarea}
                      placeholder="What is this content about?"
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
                      <p>Click or drag to upload file</p>
                      <span>Supports PDF, DOCX, MP4, MP3, etc.</span>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending
                    ? 'Processing...'
                    : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
