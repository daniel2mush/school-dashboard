import { useState } from 'react'
import styles from './TeachGrading.module.scss'
import {
  useGetTeacherClasses,
  useSubmitGrade,
} from '#/components/query/TeacherQuery.ts'
import { Plus, X, Search } from 'lucide-react'
import { Avatar, Badge } from '#/components/ui'

const calculateGradeLetter = (score: number) => {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return { bg: '#ecfdf5', color: '#059669' }
  if (grade.startsWith('B')) return { bg: '#eff6ff', color: '#2563eb' }
  if (grade.startsWith('C')) return { bg: '#fffbeb', color: '#d97706' }
  if (grade.startsWith('D')) return { bg: '#fef2f2', color: '#dc2626' }
  return { bg: '#f9fafb', color: '#4b5563' }
}

const getScoreColor = (score: number) => {
  if (score >= 70) return '#10b981' // Good (Green)
  if (score >= 40) return '#f59e0b' // Average (Yellow)
  return '#ef4444' // Poor (Red)
}

const ScoreProgressBar = ({ score }: { score: number }) => {
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

export function TeachGrading() {
  const { data: classes, isLoading } = useGetTeacherClasses()
  const { mutate: submitGrade, isPending } = useSubmitGrade()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [scores, setScores] = useState({
    midterm: '',
    assignmentAvg: '',
    projectFinal: '',
    overall: '',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null)

  if (isLoading || !classes) {
    return <div className={styles.view}>Loading grading portal...</div>
  }

  const selectedClass = classes.find((c) => c.id.toString() === selectedClassId)
  const students = selectedClass?.students || []
  const subjects = selectedClass?.subjects || []
  const studentsWithGrades = classes.flatMap((c) =>
    c.students.map((student) => ({
      ...student,
      className: c.name,
      initials: student.name
        .split(' ')
        .map((n) => n[0])
        .join(''),
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

  // Function to get current grade for a student and subject
  const getExistingGrade = (studentId: string, subjectId: string) => {
    const student = classes
      .flatMap((c) => c.students)
      .find((s) => s.id.toString() === studentId)
    return student?.grades.find((g) => g.subjectId.toString() === subjectId)
  }

  const filteredStudents = studentsWithGrades.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const hasGrades = s.grades.length > 0
    // If searching, show all that match. If not searching, only show those with grades to keep it professional
    return searchQuery ? matchesSearch : hasGrades && matchesSearch
  })

  const handleScoreChange = (field: keyof typeof scores, value: string) => {
    const val = Number(value)
    if (value === '' || (!isNaN(val) && val >= 0 && val <= 100)) {
      setScores((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubjectSelect = (subjectId: string) => {
    setActiveSubjectId(subjectId)
    const existing = getExistingGrade(selectedStudentId, subjectId)
    if (existing) {
      setScores({
        midterm: existing.midterm?.toString() || '',
        assignmentAvg: existing.assignmentAvg?.toString() || '',
        projectFinal: existing.projectFinal?.toString() || '',
        overall: existing.score?.toString() || '',
      })
    } else {
      setScores({
        midterm: '',
        assignmentAvg: '',
        projectFinal: '',
        overall: '',
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId || !activeSubjectId) {
      toast.error('Please select both a student and a subject')
      return
    }

    const overallScore = scores.overall ? Number(scores.overall) : undefined

    console.log('Submitting grade:', {
      studentId: selectedStudentId,
      subjectId: activeSubjectId,
      score: overallScore,
    })

    submitGrade(
      {
        studentId: parseInt(selectedStudentId, 10),
        subjectId: parseInt(activeSubjectId, 10),
        score: overallScore,
        grade:
          overallScore !== undefined
            ? calculateGradeLetter(overallScore)
            : undefined,
        midterm: scores.midterm ? Number(scores.midterm) : undefined,
        assignmentAvg: scores.assignmentAvg
          ? Number(scores.assignmentAvg)
          : undefined,
        projectFinal: scores.projectFinal
          ? Number(scores.projectFinal)
          : undefined,
      },
      {
        onSuccess: () => {
          // Keep the modal open but maybe clear or show success?
          // The user said: "click save, it would be added to save. if the teach finishes marking the student. he can click on save. and and all data updated."
          // For now, I'll keep it simple and just show a toast (handled in useSubmitGrade)
        },
      },
    )
  }

  return (
    <div className={styles.view}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>Academic Records</div>
          <h2 className={styles.title}>Student Grading</h2>
          <p className={styles.copy}>
            Track marks by student, compare subject performance, and update one
            subject at a time without losing the bigger picture.
          </p>
        </div>
        <div className={styles.heroActions}>
          <div className={styles.heroNote}>
            <span className={styles.heroNoteLabel}>Live scope</span>
            <span className={styles.heroNoteValue}>
              {classCount} classes, {totalStudents} students
            </span>
          </div>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Add Grades
          </button>
        </div>
      </div>

      <div className={styles.metricGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Classes in scope</span>
          <strong className={styles.metricValue}>{classCount}</strong>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Students tracked</span>
          <strong className={styles.metricValue}>{totalStudents}</strong>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Subject links</span>
          <strong className={styles.metricValue}>{totalSubjects}</strong>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Grade records</span>
          <strong className={styles.metricValue}>{totalGradeRecords}</strong>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderCopy}>
            <span className={styles.tableHeaderLabel}>Records</span>
            <span className={styles.tableHeaderValue}>
              {filteredStudents.length} student
              {filteredStudents.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className={styles.searchWrap}>
            <Search
              size={18}
              className={styles.searchIcon}
            />
            <input
              type="text"
              placeholder="Search students or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Academic Record (Subjects & Marks)</th>
              <th>Overall Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                // Calculate an average overall score for the progress bar if needed,
                // or just show individual subject progress.
                // The user said: "present a student with all their marks on each subject"
                const avgScore =
                  student.grades.length > 0
                    ? Math.round(
                        student.grades.reduce(
                          (acc, g) => acc + (g.score || 0),
                          0,
                        ) / student.grades.length,
                      )
                    : 0

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
                        {student.grades.map((g) => {
                          const colors = getGradeColor(g.grade || '')
                          return (
                            <div key={g.id} className={styles.gradeCard}>
                              <div className={styles.gradeCardTitle}>
                                {g.subject.name}
                              </div>
                              <div className={styles.gradeCardRow}>
                                <span className={styles.gradeScore}>
                                  {g.score}%
                                </span>
                                <span
                                  className={styles.gradeBadge}
                                  style={{
                                    backgroundColor: colors.bg,
                                    color: colors.color,
                                  }}
                                >
                                  {g.grade}
                                </span>
                              </div>
                              <div className={styles.gradeCardBar}>
                                <ScoreProgressBar score={g.score || 0} />
                              </div>
                            </div>
                          )
                        })}
                        {student.grades.length === 0 && (
                          <span
                            style={{
                              color: 'var(--text-secondary)',
                              fontSize: '0.9rem',
                            }}
                          >
                            No grades recorded
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {student.grades.length > 0 ? (
                        <div className={styles.avgBlock}>
                          <div className={styles.avgLabel}>
                            Average Performance
                          </div>
                          <ScoreProgressBar score={avgScore} />
                          <div className={styles.avgBadgeWrap}>
                            <Badge variant={avgScore >= 70 ? 'green' : 'amber'}>
                              {avgScore >= 85
                                ? 'Excellent'
                                : avgScore >= 70
                                  ? 'Strong'
                                  : avgScore >= 50
                                    ? 'Steady'
                                    : 'Needs support'}
                            </Badge>
                          </div>
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
                No students found.
              </td>
            </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Academic Assessment</h2>
                <p className={styles.copy}>
                  Select a class and student, then record marks for each
                  subject.
                </p>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedClassId('')
                  setSelectedStudentId('')
                  setActiveSubjectId(null)
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px',
              }}
            >
              <div>
                <div
                  className={styles.formGroup}
                >
                  <label>Class / Year Group</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value)
                      setSelectedStudentId('')
                      setActiveSubjectId(null)
                    }}
                    required
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className={styles.formGroup}
                  style={{ marginBottom: '16px' }}
                >
                  <label>Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value)
                      setActiveSubjectId(null)
                    }}
                    disabled={!selectedClassId}
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStudentId && (
                  <>
                    <label
                      className={styles.eyebrow}
                      style={{ display: 'block', marginBottom: '12px' }}
                    >
                      Student Subjects
                    </label>
                    <div className={styles.subjectGrid}>
                      {subjects.map((sub) => {
                        const grade = getExistingGrade(
                          selectedStudentId,
                          sub.id.toString(),
                        )
                        return (
                          <div
                            key={sub.id}
                            className={`${styles.subjectItem} ${activeSubjectId === sub.id.toString() ? styles.active : ''}`}
                            onClick={() =>
                              handleSubjectSelect(sub.id.toString())
                            }
                          >
                            <div className={styles.subjectName}>{sub.name}</div>
                            {grade ? (
                              <div className={styles.subjectMeta}>
                                Current: {grade.score}% ({grade.grade})
                              </div>
                            ) : (
                              <div className={styles.subjectMeta}>
                                Not Graded Yet
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

              <div>
                {activeSubjectId ? (
                  <form onSubmit={handleSubmit} className={styles.gradeForm}>
                    <div className={styles.gradeFormTitle}>
                      <Badge variant="amber">Marking</Badge>
                      {
                        subjects.find(
                          (s) => s.id.toString() === activeSubjectId,
                        )?.name
                      }
                    </div>

                    <div
                      className={styles.formGrid}
                      style={{ gridTemplateColumns: '1fr' }}
                    >
                      <div className={styles.formGroup}>
                        <label>Midterm Score (%)</label>
                        <input
                          type="number"
                          placeholder="0-100"
                          value={scores.midterm}
                          onChange={(e) =>
                            handleScoreChange('midterm', e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Assignment Avg (%)</label>
                        <input
                          type="number"
                          placeholder="0-100"
                          value={scores.assignmentAvg}
                          onChange={(e) =>
                            handleScoreChange('assignmentAvg', e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Project Final (%)</label>
                        <input
                          type="number"
                          placeholder="0-100"
                          value={scores.projectFinal}
                          onChange={(e) =>
                            handleScoreChange('projectFinal', e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Overall Score (%)</label>
                        <input
                          type="number"
                          placeholder="0-100"
                          value={scores.overall}
                          onChange={(e) =>
                            handleScoreChange('overall', e.target.value)
                          }
                          required
                        />
                      </div>

                      {scores.overall && (
                        <div className={styles.progressPreview}>
                          <div className={styles.progressPreviewLabel}>
                            Visual Progress
                          </div>
                          <ScoreProgressBar score={Number(scores.overall)} />
                        </div>
                      )}
                    </div>

                    <div
                      className={styles.modalActions}
                      style={{ marginTop: '24px' }}
                    >
                      <button
                        type="submit"
                        className={styles.submitBtn}
                        style={{ width: '100%' }}
                        disabled={isPending}
                      >
                        {isPending ? 'Saving...' : 'Save Subject Grade'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-secondary)',
                      borderRadius: '16px',
                      border: '1px dashed var(--border-light)',
                      color: 'var(--text-secondary)',
                      textAlign: 'center',
                      padding: '32px',
                    }}
                  >
                    Select a subject from the list to start marking.
                  </div>
                )}
              </div>
            </div>

            <div
              className={styles.modalActions}
              style={{
                marginTop: '32px',
                borderTop: '1px solid var(--border-light)',
              }}
            >
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedClassId('')
                  setSelectedStudentId('')
                  setActiveSubjectId(null)
                }}
              >
                Done Marking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
