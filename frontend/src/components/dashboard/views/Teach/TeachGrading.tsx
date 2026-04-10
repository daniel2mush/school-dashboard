import { useState } from 'react'
import styles from './TeachGrading.module.scss'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import {
  useGetTeacherClasses,
  useSubmitGrade,
} from '#/components/query/TeacherQuery.ts'
import { Plus, X, Search } from 'lucide-react'
import { Avatar, Badge } from '#/components/ui'
import { toast } from 'sonner'

type GradeScaleOption = {
  key: string
  label: string
  minScore: number
}

type StudentSummaryDraft = {
  overallGrade: string
  performance: string
  teacherReport: string
}

type TeacherGradeRecord = {
  id: number
  score?: number
  grade?: string
  subjectId?: number
  subject?: { id: number; name: string }
  midterm?: number
  assignmentAvg?: number
  projectFinal?: number
  performance?: string
  teacherReport?: string
  overallGrade?: string
}

type TeacherStudent = {
  id: number
  name: string
  className: string
  initials: string
  grades: TeacherGradeRecord[]
}

const STANDARD_GRADE_SCALE: GradeScaleOption[] = [
  { key: 'APlus', label: 'A+', minScore: 90 },
  { key: 'A', label: 'A', minScore: 80 },
  { key: 'BPlus', label: 'B+', minScore: 75 },
  { key: 'B', label: 'B', minScore: 70 },
  { key: 'CPlus', label: 'C+', minScore: 65 },
  { key: 'C', label: 'C', minScore: 60 },
  { key: 'D', label: 'D', minScore: 50 },
  { key: 'F', label: 'F', minScore: 0 },
]

function calculateGradeLetter(score: number) {
  return (
    STANDARD_GRADE_SCALE.find((option) => score >= option.minScore)?.label ??
    'F'
  )
}

function getGradeColor(grade: string) {
  if (grade.startsWith('A')) return { bg: '#ecfdf5', color: '#059669' }
  if (grade.startsWith('B')) return { bg: '#eff6ff', color: '#2563eb' }
  if (grade.startsWith('C')) return { bg: '#fffbeb', color: '#d97706' }
  if (grade.startsWith('D')) return { bg: '#fef2f2', color: '#dc2626' }
  return { bg: '#f9fafb', color: '#4b5563' }
}

function getScoreColor(score: number) {
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function ScoreProgressBar({ score }: { score: number }) {
  const color = getScoreColor(score)
  return (
    <div className={styles.scoreProgress}>
      <div className={styles.scoreBar}>
        <div
          className={styles.scoreFill}
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className={styles.scorePercent}>{score}%</span>
    </div>
  )
}

function getAverageScore(student: TeacherStudent) {
  if (student.grades.length === 0) return 0
  return Math.round(
    student.grades.reduce((acc, grade) => acc + Number(grade.score || 0), 0) /
      student.grades.length,
  )
}

function getSummarySourceGrade(student: TeacherStudent) {
  return (
    student.grades.find(
      (grade) => grade.teacherReport || grade.performance || grade.overallGrade,
    ) ?? student.grades[0]
  )
}

export function TeachGrading() {
  const { t } = useDashboardTranslation()
  const { data: classes, isLoading } = useGetTeacherClasses()
  const { mutate: submitGrade, isPending } = useSubmitGrade()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYearGroup, setSelectedYearGroup] = useState('All')
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null)
  const [subjectScores, setSubjectScores] = useState({
    midterm: '',
    assignmentAvg: '',
    projectFinal: '',
    overall: '',
  })
  const [summaryDrafts, setSummaryDrafts] = useState<
    Record<string, StudentSummaryDraft>
  >({})

  if (isLoading || !classes) {
    return <div className={styles.view}>{t('teacher.grading.loading')}</div>
  }

  const selectedClass = classes.find((c) => String(c.id) === selectedClassId)
  const students = selectedClass?.students || []
  const subjects = selectedClass?.subjects || []

  const studentsWithGrades: TeacherStudent[] = classes.flatMap((c) =>
    c.students.map((student) => ({
      ...student,
      className: c.name,
      initials: student.name
        .split(' ')
        .map((namePart) => namePart[0])
        .join(''),
      grades: (student.grades || []) as TeacherGradeRecord[],
    })),
  )

  const totalStudents = studentsWithGrades.length
  const totalGradeRecords = studentsWithGrades.reduce(
    (count, student) => count + student.grades.length,
    0,
  )
  const totalSubjects = new Set(
    classes.flatMap((c) => c.subjects.map((subject) => subject.id)),
  ).size
  const classCount = classes.length

  const yearGroups = Array.from(new Set(classes.map((c) => c.name))).sort()

  const filteredStudents = studentsWithGrades.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesYearGroup =
      selectedYearGroup === 'All' || student.className === selectedYearGroup
    return matchesSearch && matchesYearGroup
  })

  const getExistingGrade = (studentId: string, subjectId: string) => {
    const student = studentsWithGrades.find(
      (entry) => String(entry.id) === studentId,
    )
    return student?.grades.find((grade) => String(grade.subjectId) === subjectId)
  }

  const handleScoreChange = (
    field: keyof typeof subjectScores,
    value: string,
  ) => {
    const numericValue = Number(value)
    if (
      value === '' ||
      (!Number.isNaN(numericValue) && numericValue >= 0 && numericValue <= 100)
    ) {
      setSubjectScores((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubjectSelect = (subjectId: string) => {
    setActiveSubjectId(subjectId)
    const existing = getExistingGrade(selectedStudentId, subjectId)
    if (existing) {
      setSubjectScores({
        midterm: existing.midterm?.toString() || '',
        assignmentAvg: existing.assignmentAvg?.toString() || '',
        projectFinal: existing.projectFinal?.toString() || '',
        overall: existing.score?.toString() || '',
      })
      return
    }

    setSubjectScores({
      midterm: '',
      assignmentAvg: '',
      projectFinal: '',
      overall: '',
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClassId('')
    setSelectedStudentId('')
    setActiveSubjectId(null)
    setSubjectScores({
      midterm: '',
      assignmentAvg: '',
      projectFinal: '',
      overall: '',
    })
  }

  const handleSubmitSubjectGrade = (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedStudentId || !activeSubjectId) {
      toast.error(t('teacher.grading.selectStudentAndSubject'))
      return
    }

    const overallScore = subjectScores.overall
      ? Number(subjectScores.overall)
      : undefined

    submitGrade({
      studentId: Number(selectedStudentId),
      subjectId: Number(activeSubjectId),
      score: overallScore,
      grade:
        overallScore !== undefined
          ? calculateGradeLetter(overallScore)
          : undefined,
      midterm: subjectScores.midterm ? Number(subjectScores.midterm) : undefined,
      assignmentAvg: subjectScores.assignmentAvg
        ? Number(subjectScores.assignmentAvg)
        : undefined,
      projectFinal: subjectScores.projectFinal
        ? Number(subjectScores.projectFinal)
        : undefined,
    })
  }

  const getStudentSummaryDraft = (student: TeacherStudent): StudentSummaryDraft => {
    const existingDraft = summaryDrafts[String(student.id)]
    if (existingDraft) return existingDraft

    const averageScore = getAverageScore(student)
    const summarySource = getSummarySourceGrade(student)

    return {
      overallGrade:
        summarySource?.overallGrade ||
        calculateGradeLetter(averageScore),
      performance: summarySource?.performance || '',
      teacherReport: summarySource?.teacherReport || '',
    }
  }

  const updateStudentSummaryDraft = (
    student: TeacherStudent,
    patch: Partial<StudentSummaryDraft>,
  ) => {
    setSummaryDrafts((prev) => ({
      ...prev,
      [String(student.id)]: {
        ...getStudentSummaryDraft(student),
        ...prev[String(student.id)],
        ...patch,
      },
    }))
  }

  const handleSaveStudentSummary = (student: TeacherStudent) => {
    const summarySource = getSummarySourceGrade(student)
    if (!summarySource?.subjectId) {
      toast.error(t('teacher.grading.addSubjectGradeFirst'))
      return
    }

    const draft = getStudentSummaryDraft(student)

    submitGrade({
      studentId: student.id,
      subjectId: summarySource.subjectId,
      score: summarySource.score,
      grade: summarySource.grade,
      midterm: summarySource.midterm,
      assignmentAvg: summarySource.assignmentAvg,
      projectFinal: summarySource.projectFinal,
      performance: draft.performance || undefined,
      teacherReport: draft.teacherReport || undefined,
      overallGrade: draft.overallGrade || undefined,
    })
  }

  return (
    <div className={styles.view}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>{t('teacher.grading.eyebrow')}</div>
          <h2 className={styles.title}>{t('teacher.grading.title')}</h2>
          <p className={styles.copy}>{t('teacher.grading.copy')}</p>
        </div>
        <div className={styles.heroActions}>
          <div className={styles.heroNote}>
            <span className={styles.heroNoteLabel}>
              {t('teacher.grading.liveScope')}
            </span>
            <span className={styles.heroNoteValue}>
              {t('teacher.grading.classesCount')
                .replace('{count}', String(classCount))
                .replace('{students}', String(totalStudents))}
            </span>
          </div>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            {t('teacher.grading.addGrades')}
          </button>
        </div>
      </div>

      <div className={styles.metricGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>
            {t('teacher.grading.classesInScope')}
          </span>
          <strong className={styles.metricValue}>{classCount}</strong>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>
            {t('teacher.grading.studentsTracked')}
          </span>
          <strong className={styles.metricValue}>{totalStudents}</strong>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>
            {t('teacher.grading.subjectLinks')}
          </span>
          <strong className={styles.metricValue}>{totalSubjects}</strong>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>
            {t('teacher.grading.gradeRecords')}
          </span>
          <strong className={styles.metricValue}>{totalGradeRecords}</strong>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderCopy}>
            <span className={styles.tableHeaderLabel}>
              {t('teacher.grading.records')}
            </span>
            <span className={styles.tableHeaderValue}>
              {filteredStudents.length}{' '}
              {t('teacher.grading.students').replace(
                '{s}',
                filteredStudents.length === 1 ? '' : 's',
              )}
            </span>
          </div>
          <div className={styles.tableActions}>
            <div className={styles.filterWrap}>
              <select
                value={selectedYearGroup}
                onChange={(e) => setSelectedYearGroup(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">
                  {t('teacher.grading.allYearGroups')}
                </option>
                {yearGroups.map((yearGroup) => (
                  <option key={yearGroup} value={yearGroup}>
                    {yearGroup}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.searchWrap}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder={t('teacher.grading.searchStudents')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('teacher.grading.student')}</th>
              <th>{t('teacher.grading.academicRecord')}</th>
              <th>{t('teacher.grading.overallProgress')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const averageScore = getAverageScore(student)
                const summaryDraft = getStudentSummaryDraft(student)
                return (
                  <tr key={student.id}>
                    <td style={{ verticalAlign: 'top' }}>
                      <div className={styles.studentInfo}>
                        <Avatar
                          initials={student.initials}
                          size={40}
                          fontSize={14}
                        />
                        <div>
                          <div className={styles.studentName}>
                            {student.name}
                          </div>
                          <div className={styles.studentEmail}>
                            {student.className}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.gradeGrid}>
                        {student.grades.map((grade) => {
                          const colors = getGradeColor(grade.grade || '')
                          return (
                            <div key={grade.id} className={styles.gradeCard}>
                              <div className={styles.gradeCardTitle}>
                                {grade.subject?.name || t('teacher.grading.subject')}
                              </div>
                              <div className={styles.gradeCardRow}>
                                <span className={styles.gradeScore}>
                                  {grade.score ?? 0}%
                                </span>
                                <span
                                  className={styles.gradeBadge}
                                  style={{
                                    backgroundColor: colors.bg,
                                    color: colors.color,
                                  }}
                                >
                                  {grade.grade || calculateGradeLetter(grade.score || 0)}
                                </span>
                              </div>
                              <div className={styles.gradeCardBar}>
                                <ScoreProgressBar score={grade.score || 0} />
                              </div>
                            </div>
                          )
                        })}
                        {student.grades.length === 0 && (
                          <span className={styles.noGradesText}>
                            {t('teacher.grading.noGradesRecorded')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {student.grades.length > 0 ? (
                        <div className={styles.avgBlock}>
                          <div className={styles.avgLabel}>
                            {t('teacher.grading.averagePerformance')}
                          </div>
                          <ScoreProgressBar score={averageScore} />
                          <div className={styles.summaryMeta}>
                            <span className={styles.summaryMetaLabel}>
                              {t('teacher.grading.overallGrade')}
                            </span>
                            <select
                              className={styles.summarySelect}
                              value={summaryDraft.overallGrade}
                              onChange={(e) =>
                                updateStudentSummaryDraft(student, {
                                  overallGrade: e.target.value,
                                })
                              }
                            >
                              {STANDARD_GRADE_SCALE.map((option) => (
                                <option key={option.key} value={option.label}>
                                  {t(`teacher.grading.gradeLetters.${option.key}`)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className={styles.avgBadgeWrap}>
                            <Badge variant={averageScore >= 70 ? 'green' : 'amber'}>
                              {summaryDraft.overallGrade}
                            </Badge>
                          </div>
                          <div className={styles.summaryField}>
                            <label>{t('teacher.grading.performanceComment')}</label>
                            <input
                              type="text"
                              placeholder={t(
                                'teacher.grading.performancePlaceholder',
                              )}
                              value={summaryDraft.performance}
                              onChange={(e) =>
                                updateStudentSummaryDraft(student, {
                                  performance: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className={styles.summaryField}>
                            <label>{t('teacher.grading.teacherReport')}</label>
                            <textarea
                              rows={4}
                              placeholder={t(
                                'teacher.grading.teacherReportPlaceholder',
                              )}
                              value={summaryDraft.teacherReport}
                              onChange={(e) =>
                                updateStudentSummaryDraft(student, {
                                  teacherReport: e.target.value,
                                })
                              }
                            />
                          </div>
                          <button
                            type="button"
                            className={styles.summarySaveBtn}
                            disabled={isPending}
                            onClick={() => handleSaveStudentSummary(student)}
                          >
                            {isPending
                              ? t('teacher.grading.saving')
                              : t('teacher.grading.saveStudentSummary')}
                          </button>
                        </div>
                      ) : (
                        <span className={styles.emptyDash}>-</span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={3} className={styles.emptyState}>
                  {t('teacher.grading.noStudentsFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen ? (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <h2>{t('teacher.grading.modalTitle')}</h2>
                <p className={styles.copy}>
                  {t('teacher.grading.modalDescription')}
                </p>
              </div>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalGrid}>
              <div>
                <div className={styles.formGroup}>
                  <label>{t('teacher.grading.selectClass')}</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value)
                      setSelectedStudentId('')
                      setActiveSubjectId(null)
                    }}
                    required
                  >
                    <option value="">
                      {t('teacher.grading.selectClassOption')}
                    </option>
                    {classes.map((yearGroup) => (
                      <option key={yearGroup.id} value={yearGroup.id}>
                        {yearGroup.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>{t('teacher.grading.selectStudent')}</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value)
                      setActiveSubjectId(null)
                    }}
                    disabled={!selectedClassId}
                    required
                  >
                    <option value="">
                      {t('teacher.grading.selectStudentOption')}
                    </option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStudentId ? (
                  <>
                    <label className={styles.subjectLabel}>
                      {t('teacher.grading.studentSubjects')}
                    </label>
                    <div className={styles.subjectGrid}>
                      {subjects.map((subject) => {
                        const grade = getExistingGrade(
                          selectedStudentId,
                          String(subject.id),
                        )
                        return (
                          <div
                            key={subject.id}
                            className={`${styles.subjectItem} ${
                              activeSubjectId === String(subject.id)
                                ? styles.active
                                : ''
                            }`}
                            onClick={() => handleSubjectSelect(String(subject.id))}
                          >
                            <div className={styles.subjectName}>
                              {subject.name}
                            </div>
                            <div className={styles.subjectMeta}>
                              {grade
                                ? t('teacher.grading.currentGrade')
                                    .replace('{score}', String(grade.score ?? 0))
                                    .replace('{grade}', grade.grade || '')
                                : t('teacher.grading.notGradedYet')}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : null}
              </div>

              <div>
                {activeSubjectId ? (
                  <form
                    onSubmit={handleSubmitSubjectGrade}
                    className={styles.gradeForm}
                  >
                    <div className={styles.gradeFormTitle}>
                      <Badge variant="amber">
                        {t('teacher.grading.marking')}
                      </Badge>
                      {
                        subjects.find(
                          (subject) => String(subject.id) === activeSubjectId,
                        )?.name
                      }
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>{t('teacher.grading.midtermScore')}</label>
                        <input
                          type="number"
                          placeholder="0-100"
                          value={subjectScores.midterm}
                          onChange={(e) =>
                            handleScoreChange('midterm', e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>{t('teacher.grading.assignmentAvg')}</label>
                        <input
                          type="number"
                          placeholder="0-100"
                          value={subjectScores.assignmentAvg}
                          onChange={(e) =>
                            handleScoreChange('assignmentAvg', e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>{t('teacher.grading.projectFinal')}</label>
                        <input
                          type="number"
                          placeholder="0-100"
                          value={subjectScores.projectFinal}
                          onChange={(e) =>
                            handleScoreChange('projectFinal', e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>{t('teacher.grading.overallScore')}</label>
                        <input
                          type="number"
                          placeholder="0-100"
                          value={subjectScores.overall}
                          onChange={(e) =>
                            handleScoreChange('overall', e.target.value)
                          }
                          required
                        />
                      </div>

                      {subjectScores.overall ? (
                        <div className={styles.progressPreview}>
                          <div className={styles.progressPreviewLabel}>
                            {t('teacher.grading.visualProgress')}
                          </div>
                          <ScoreProgressBar score={Number(subjectScores.overall)} />
                          <div className={styles.autoGradePreview}>
                            {t('teacher.grading.autoGrade')}{' '}
                            <strong>
                              {calculateGradeLetter(Number(subjectScores.overall))}
                            </strong>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className={styles.modalActions} style={{ marginTop: 24 }}>
                      <button
                        type="submit"
                        className={styles.submitBtn}
                        style={{ width: '100%' }}
                        disabled={isPending}
                      >
                        {isPending
                          ? t('teacher.grading.saving')
                          : t('teacher.grading.saveSubjectGrade')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.subjectEmptyState}>
                    {t('teacher.grading.selectSubjectToMark')}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCloseModal}
              >
                {t('teacher.grading.doneMarking')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
