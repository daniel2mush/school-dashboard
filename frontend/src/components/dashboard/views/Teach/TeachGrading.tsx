import { useState } from 'react'
import styles from './TeachGrading.module.scss'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import {
  useGetTeacherClasses,
  useSubmitGrade,
} from '#/components/query/TeacherQuery.ts'
import { Plus, X, Search } from 'lucide-react'
import { Avatar, Badge, Button, Input } from '#/components/ui'
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
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYearGroup, setSelectedYearGroup] = useState('All')
  const [summaryDrafts, setSummaryDrafts] = useState<
    Record<string, StudentSummaryDraft>
  >({})

  if (isLoading || !classes) {
    return <div className={styles.view}>{t('teacher.grading.loading')}</div>
  }

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

  const selectedStudent = studentsWithGrades.find(
    (s) => String(s.id) === selectedStudentId,
  )
  const selectedClass = classes.find(
    (c) => c.name === selectedStudent?.className,
  )
  const classSubjects = selectedClass?.subjects || []

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

  const getStudentSummaryDraft = (
    student: TeacherStudent,
  ): StudentSummaryDraft => {
    const existingDraft = summaryDrafts[String(student.id)]
    if (existingDraft) return existingDraft

    const averageScore = getAverageScore(student)
    const summarySource = getSummarySourceGrade(student)

    return {
      overallGrade:
        summarySource?.overallGrade || calculateGradeLetter(averageScore),
      performance: summarySource?.performance || '',
      teacherReport: summarySource?.teacherReport || '',
    }
  }

  const updateStudentSummaryDraft = (
    studentId: number,
    patch: Partial<StudentSummaryDraft>,
  ) => {
    const student = studentsWithGrades.find((s) => s.id === studentId)
    if (!student) return

    setSummaryDrafts((prev) => ({
      ...prev,
      [String(studentId)]: {
        ...getStudentSummaryDraft(student),
        ...prev[String(studentId)],
        ...patch,
      },
    }))
  }

  const handleOpenGrading = (studentId: number) => {
    setSelectedStudentId(String(studentId))
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStudentId(null)
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
              <th>{t('teacher.grading.class')}</th>
              <th>{t('teacher.grading.averagePerformance')}</th>
              <th>{t('teacher.grading.status')}</th>
              <th style={{ textAlign: 'right' }}>
                {t('teacher.grading.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const averageScore = getAverageScore(student)
                const isGraded = student.grades.length > 0
                return (
                  <tr
                    key={student.id}
                    onClick={() => handleOpenGrading(student.id)}
                    className={styles.clickableRow}
                  >
                    <td>
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
                            {t('teacher.grading.id')}: #{student.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant="ghost" className={styles.classBadge}>
                        {student.className}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.avgProgressCell}>
                        <ScoreProgressBar score={averageScore} />
                      </div>
                    </td>
                    <td>
                      {isGraded ? (
                        <Badge variant="green">
                          {t('teacher.grading.graded')}
                        </Badge>
                      ) : (
                        <Badge variant="amber">
                          {t('teacher.grading.pending')}
                        </Badge>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenGrading(student.id)
                        }}
                      >
                        {t('teacher.grading.gradeStudent')}
                      </Button>
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

      {isModalOpen && selectedStudent ? (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.studentHero}>
                <Avatar
                  initials={selectedStudent.initials}
                  size={64}
                  fontSize={20}
                />
                <div>
                  <h2>{selectedStudent.name}</h2>
                  <div className={styles.studentMeta}>
                    <Badge variant="ghost">{selectedStudent.className}</Badge>
                    <span>
                      {t('teacher.grading.studentId')}: #{selectedStudent.id}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" onClick={handleCloseModal}>
                <X size={24} />
              </Button>
            </div>

            <div className={styles.gradingWorkspace}>
              <div className={styles.workspaceSection}>
                <h3 className={styles.sectionTitle}>
                  {t('teacher.grading.academicPerformance')}
                </h3>
                <div className={styles.scoresTableWrapper}>
                  <table className={styles.scoresTable}>
                    <thead>
                      <tr>
                        <th>{t('teacher.grading.subject')}</th>
                        <th>{t('teacher.grading.midterm')}</th>
                        <th>{t('teacher.grading.assignments')}</th>
                        <th>{t('teacher.grading.project')}</th>
                        <th>{t('teacher.grading.overall')}</th>
                        <th>{t('teacher.grading.grade')}</th>
                        <th style={{ textAlign: 'right' }}>
                          {t('teacher.grading.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {classSubjects.map((subject) => {
                        const grade = selectedStudent.grades.find(
                          (g) => g.subjectId === subject.id,
                        )
                        const score = grade?.score ?? 0
                        const colors = getGradeColor(
                          grade?.grade || calculateGradeLetter(score),
                        )

                        return (
                          <tr key={subject.id}>
                            <td className={styles.subjectNameCell}>
                              {subject.name}
                            </td>
                            <td>
                              <Input
                                type="tel"
                                className={styles.tableInput}
                                placeholder="--"
                                defaultValue={grade?.midterm}
                                onBlur={(e) => {
                                  const val = e.target.value
                                  if (val !== String(grade?.midterm)) {
                                    submitGrade({
                                      studentId: selectedStudent.id,
                                      subjectId: subject.id,
                                      midterm: val ? Number(val) : undefined,
                                    })
                                  }
                                }}
                              />
                            </td>
                            <td>
                              <Input
                                type="tel"
                                className={styles.tableInput}
                                placeholder="--"
                                defaultValue={grade?.assignmentAvg}
                                onBlur={(e) => {
                                  const val = e.target.value
                                  if (val !== String(grade?.assignmentAvg)) {
                                    submitGrade({
                                      studentId: selectedStudent.id,
                                      subjectId: subject.id,
                                      assignmentAvg: val
                                        ? Number(val)
                                        : undefined,
                                    })
                                  }
                                }}
                              />
                            </td>
                            <td>
                              <Input
                                type="tel"
                                className={styles.tableInput}
                                placeholder="--"
                                defaultValue={grade?.projectFinal}
                                onBlur={(e) => {
                                  const val = e.target.value
                                  if (val !== String(grade?.projectFinal)) {
                                    submitGrade({
                                      studentId: selectedStudent.id,
                                      subjectId: subject.id,
                                      projectFinal: val
                                        ? Number(val)
                                        : undefined,
                                    })
                                  }
                                }}
                              />
                            </td>
                            <td>
                              <Input
                                type="tel"
                                className={styles.tableInput}
                                style={{
                                  fontWeight: 700,
                                  color: 'var(--amber)',
                                }}
                                placeholder="--"
                                defaultValue={grade?.score}
                                onBlur={(e) => {
                                  const val = e.target.value
                                  if (val !== String(grade?.score)) {
                                    const scoreNum = val ? Number(val) : 0
                                    submitGrade({
                                      studentId: selectedStudent.id,
                                      subjectId: subject.id,
                                      score: scoreNum,
                                      grade: calculateGradeLetter(scoreNum),
                                    })
                                  }
                                }}
                              />
                            </td>
                            <td>
                              <span
                                className={styles.miniGradeBadge}
                                style={{
                                  backgroundColor: colors.bg,
                                  color: colors.color,
                                }}
                              >
                                {grade?.grade || calculateGradeLetter(score)}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Badge
                                variant={grade ? 'green' : 'ghost'}
                                size="sm"
                              >
                                {grade
                                  ? t('teacher.grading.saved')
                                  : t('teacher.grading.unsaved')}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.workspaceSection}>
                <h3 className={styles.sectionTitle}>
                  {t('teacher.grading.finalEvaluation')}
                </h3>
                <div className={styles.evaluationGrid}>
                  <div className={styles.evalField}>
                    <label>{t('teacher.grading.performanceSummary')}</label>
                    <textarea
                      rows={3}
                      placeholder={t('teacher.grading.enterPerformanceNotes')}
                      value={
                        getStudentSummaryDraft(selectedStudent).performance
                      }
                      onChange={(e) =>
                        updateStudentSummaryDraft(selectedStudent.id, {
                          performance: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className={styles.evalField}>
                    <label>{t('teacher.grading.teacherReport')}</label>
                    <textarea
                      rows={3}
                      placeholder={t('teacher.grading.enterReportDetails')}
                      value={
                        getStudentSummaryDraft(selectedStudent).teacherReport
                      }
                      onChange={(e) =>
                        updateStudentSummaryDraft(selectedStudent.id, {
                          teacherReport: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className={styles.evalFooter}>
                    <div className={styles.overgradeBox}>
                      <label>{t('teacher.grading.overallGrade')}</label>
                      <select
                        value={
                          getStudentSummaryDraft(selectedStudent).overallGrade
                        }
                        onChange={(e) =>
                          updateStudentSummaryDraft(selectedStudent.id, {
                            overallGrade: e.target.value,
                          })
                        }
                        className={styles.summarySelect}
                      >
                        {STANDARD_GRADE_SCALE.map((option) => (
                          <option key={option.key} value={option.label}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      variant="secondary"
                      disabled={isPending}
                      onClick={() => handleSaveStudentSummary(selectedStudent)}
                    >
                      {isPending
                        ? t('teacher.grading.saving')
                        : t('teacher.grading.saveOverallEvaluation')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button onClick={handleCloseModal}>
                {t('teacher.grading.doneMarking')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
