import { Badge } from "@/components/ui";
import styles from "./StudentSubjects.module.scss";
import useCurrentStudent from "@/hooks/useCurrentStudent";

// Simple user icon SVG
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default function StudentSubjects() {
  const currentData = useCurrentStudent();

  if (!currentData) return null;

  const { subjects, studentGrades, yearGroup } = currentData;

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Subjects</div>
        <h2 className={styles.title}>Current classes and coursework</h2>
        <p className={styles.copy}>
          Keep up with your {yearGroup.name} subjects, teachers, and current performance.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className={styles.emptyState}>
          No subjects have been assigned to your year group yet.
        </div>
      ) : (
        <div className={styles.grid}>
          {subjects.map((subjectName) => {
            // Find the grade/teacher for this subject if available
            const gradeInfo = studentGrades.find(
              (g) => g.subject === subjectName
            );

            return (
              <div key={subjectName} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.subjectName}>{subjectName}</h3>
                    <div className={styles.teacherName}>
                      <UserIcon />
                      {gradeInfo ? gradeInfo.teacher : "Teacher unassigned"}
                    </div>
                  </div>
                  {/* Decorative element or subject icon could go here */}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.gradeLabel}>Current Standing</span>
                  {gradeInfo ? (
                    <Badge variant="blue">{gradeInfo.grade}</Badge>
                  ) : (
                    <Badge variant="gray">No Data</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
