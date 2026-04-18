import { useState } from 'react'
import { useGetStudentMaterials } from '#/components/query/AuthQuery'
import useCurrentStudent from '#/components/hooks/useCurrentStudent'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import styles from './StudentClassContent.module.scss'
import { Download, FileText, FolderOpen, Layers3 } from 'lucide-react'

function formatMaterialDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function StudentClassContent() {
  const currentData = useCurrentStudent()
  const { t, language } = useDashboardTranslation()
  const { data: materials = [], isLoading } = useGetStudentMaterials()
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  if (!currentData) return null

  const { yearGroup } = currentData
  const hasClassAssigned = yearGroup.id !== 0
  const subjectCount = new Set(
    materials.map((material) => material.subject?.name || 'General'),
  ).size
  const latestUpload = materials[0]?.createdAt

  const handleDownload = async (materialId: number) => {
    try {
      setDownloadingId(materialId)

      const response = await fetch(`/api/user/materials/${materialId}/download`)
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

  return (
    <section className={styles.view}>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <FolderOpen size={18} />
          <div>
            <span>{t('student.content.totalFiles')}</span>
            <strong>{materials.length}</strong>
          </div>
        </div>
        <div className={styles.metric}>
          <Layers3 size={18} />
          <div>
            <span>{t('student.content.subjectsCovered')}</span>
            <strong>{subjectCount}</strong>
          </div>
        </div>
        <div className={styles.metric}>
          <FileText size={18} />
          <div>
            <span>{t('student.content.latestUpload')}</span>
            <strong>
              {latestUpload
                ? formatMaterialDate(latestUpload, language)
                : t('student.content.noUploadsYet')}
            </strong>
          </div>
        </div>
      </div>

      {!hasClassAssigned ? (
        <div className={styles.emptyState}>
          {t('student.content.missingClass')}
        </div>
      ) : isLoading ? (
        <div className={styles.emptyState}>Loading class content...</div>
      ) : materials.length === 0 ? (
        <div className={styles.emptyState}>
          {t('student.content.noMaterials')}
        </div>
      ) : (
        <div className={styles.grid}>
          {materials.map((material) => {
            const subjectName =
              material.subject?.name || t('student.content.unknownSubject')
            const teacherName =
              material.teacher?.name || t('student.content.unknownTeacher')

            return (
              <article key={material.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.subjectPill}>{subjectName}</div>
                  <button
                    type="button"
                    className={styles.downloadButton}
                    aria-label={`${t('student.content.download')} ${material.title}`}
                    onClick={() => handleDownload(material.id)}
                    disabled={downloadingId === material.id}
                  >
                    <Download size={16} />
                    <span>
                      {downloadingId === material.id
                        ? t('common.loading')
                        : t('student.content.download')}
                    </span>
                  </button>
                </div>

                <div className={styles.fileMeta}>
                  <FileText size={20} />
                  <div>
                    <h3 className={styles.fileTitle}>
                      {material.title || t('student.content.untitled')}
                    </h3>
                    <p className={styles.fileInfo}>
                      {t('student.content.uploadedBy').replace(
                        '{teacher}',
                        teacherName,
                      )}
                    </p>
                  </div>
                </div>

                <p className={styles.description}>
                  {material.description || t('student.content.noDescription')}
                </p>

                <div className={styles.cardFooter}>
                  <span>
                    {t('student.content.uploadedOn').replace(
                      '{date}',
                      formatMaterialDate(material.createdAt, language),
                    )}
                  </span>
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.openLink}
                  >
                    {t('student.content.openFile')}
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
