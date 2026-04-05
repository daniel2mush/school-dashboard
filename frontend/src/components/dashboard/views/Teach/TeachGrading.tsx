import { useState } from "react";
import styles from "./TeachGrading.module.scss";
import { useGetTeacherClasses, useSubmitGrade } from "@/query/TeacherQuery";

const calculateGradeLetter = (score: number) => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
};

export default function TeachGrading() {
  const { data: classes, isLoading } = useGetTeacherClasses();
  const { mutate: submitGrade, isPending } = useSubmitGrade();

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [score, setScore] = useState<string>("");

  if (isLoading || !classes) {
    return <div className={styles.view}>Loading grading portal...</div>;
  }

  const selectedClass = classes.find(
    (c) => c.id.toString() === selectedClassId,
  );
  const students = selectedClass?.students || [];
  const subjects = selectedClass?.subjects || [];

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setScore(e.target.value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedSubjectId || !score) return;

    submitGrade(
      {
        studentId: parseInt(selectedStudentId, 10),
        subjectId: parseInt(selectedSubjectId, 10),
        score: Number(score),
        grade: calculateGradeLetter(Number(score)),
      },
      {
        onSuccess: () => {
          setScore("");
          setSelectedStudentId("");
        },
      },
    );
  };

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Academic Records</div>
        <h2 className={styles.title}>Submit Grades</h2>
        <p className={styles.copy}>
          Log official assignment and examination scores for students in your
          assigned classes.
        </p>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Select Year Group / Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedStudentId("");
                setSelectedSubjectId("");
              }}
              required
            >
              <option value="">-- Choose Class --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={!selectedClass}
              required
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={!selectedClass}
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Score (%)</label>
            <input
              type="number"
              placeholder="e.g. 85"
              value={score}
              onChange={handleScoreChange}
              disabled={!selectedStudentId || !selectedSubjectId}
              min="0"
              max="100"
              required
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={
              isPending || !selectedStudentId || !selectedSubjectId || !score
            }
          >
            {isPending ? "Submitting..." : "Save Official Grade"}
          </button>
        </div>
      </form>
    </section>
  );
}
