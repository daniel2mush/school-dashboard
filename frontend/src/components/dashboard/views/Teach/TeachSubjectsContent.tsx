import { useState } from 'react'
import styles from './TeachSubjectsContent.module.scss'
import {
  useGetTeacherClasses,
  useGetTeacherMaterials,
  useUploadMaterial,
  useToggleMaterialStatus,
  useDeleteMaterial,
} from '#/components/query/TeacherQuery.ts'
import {
  Upload,
  FileText,
  Download,
  X,
  FilePlus,
  Info,
  Search,
  Filter,
  Video,
  Music,
  File as FileIcon,
  Trash2,
} from 'lucide-react'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import { Button } from '#/components/ui'

export function TeachSubjectsContent() {
  const { t, language } = useDashboardTranslation()
  const { data: classes, isLoading: classesLoading } = useGetTeacherClasses()
  const { data: materials, isLoading: materialsLoading } =
    useGetTeacherMaterials()
  const uploadMutation = useUploadMaterial()
  const toggleStatusMutation = useToggleMaterialStatus()
  const deleteMutation = useDeleteMaterial()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    yearGroupId: '',
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
    if (!formData.title || !formData.subjectId || !selectedFile) return

    const formDataToSend = new FormData()
    formDataToSend.append('title', formData.title)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('subjectId', formData.subjectId)
    if (formData.yearGroupId) {
      formDataToSend.append('yearGroupId', formData.yearGroupId)
    }
    formDataToSend.append('isPublished', formData.isPublished.toString())
    formDataToSend.append('document', selectedFile)

    await uploadMutation.mutateAsync(formDataToSend)

    setIsModalOpen(false)
    setSelectedFile(null)
    setFormData({
      title: '',
      description: '',
      subjectId: '',
      yearGroupId: '',
      isPublished: true,
    })
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    await toggleStatusMutation.mutateAsync({
      id,
      isPublished: !currentStatus,
    })
  }

  const handleDeleteMaterial = async (id: number) => {
    setMaterialToDelete(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (materialToDelete) {
      await deleteMutation.mutateAsync(materialToDelete)
      setDeleteModalOpen(false)
      setMaterialToDelete(null)
    }
  }

  const handleDownload = async (materialId: number) => {
    try {
      setDownloadingId(materialId)

      const response = await fetch(
        `/api/teacher/materials/${materialId}/download`,
      )
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()
      const disposition = response.headers.get('content-disposition') || ''
      const fileNameMatch = disposition.match(/filename="?(.*?)"?$/i)
      const fileName = fileNameMatch?.[1] || `material-${materialId}`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloadingId(null)
    }
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

          <p className={styles.copy}>{t('teacher.content.copy')}</p>
        </div>
        <div className={styles.heroActions}>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Upload size={18} />
            {t('teacher.content.upload')}
          </Button>
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
          <Button variant="secondary" className={styles.filterBtn}>
            <Filter size={18} />
            <span>{t('teacher.content.filter')}</span>
          </Button>
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
                        <span className={styles.fileName}>
                          {material.title}
                        </span>
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
                      {material.yearGroup?.name ||
                        t('teacher.content.allClasses')}
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
                            handleToggleStatus(
                              material.id,
                              material.isPublished,
                            )
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
                      <button
                        type="button"
                        className={styles.iconBtn}
                        title={t('teacher.content.download')}
                        onClick={() => handleDownload(material.id)}
                        disabled={downloadingId === material.id}
                      >
                        <Download size={18} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDeleteMaterial(material.id)}
                        title="Delete material"
                      >
                        <Trash2 size={18} />
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
              <h3 className={styles.modalTitle}>
                {t('teacher.content.upload')}
              </h3>
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

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {t('teacher.content.selectFile')}
                    </label>
                    <input
                      type="file"
                      id="file-upload"
                      className={styles.fileInput}
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setSelectedFile(file)
                        }
                      }}
                    />
                    <div
                      className={styles.uploadArea}
                      onClick={() =>
                        document.getElementById('file-upload')?.click()
                      }
                    >
                      <div className={styles.uploadPlaceholder}>
                        <Upload size={24} />
                        {selectedFile ? (
                          <div className={styles.fileSelected}>
                            <p>{selectedFile.name}</p>
                            <span>
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ) : (
                          <>
                            <p>{t('teacher.content.uploadPlaceholder')}</p>
                            <span>{t('teacher.content.uploadSupport')}</span>
                          </>
                        )}
                      </div>
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

      {deleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {t('teacher.content.deleteConfirmTitle')}
              </h3>
            </div>
            <div className={styles.modalBody}>
              <p>{t('teacher.content.deleteConfirmMessage')}</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeleteModalOpen(false)}
              >
                {t('teacher.content.cancel')}
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending
                  ? t('teacher.content.processing')
                  : t('teacher.content.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
