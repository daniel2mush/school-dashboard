import styles from "./TeachSubjectsContent.module.scss";
import { useGetTeacherClasses } from "@/query/TeacherQuery";

export default function TeachSubjectsContent() {
  const { data: classes, isLoading } = useGetTeacherClasses();

  if (isLoading || !classes) {
    return <div className={styles.view}>Loading your specialized curricula...</div>;
  }

  // Flatten all unique subjects the teacher handles across year groups
  const allSubjects = Array.from(
    new Map(
      classes.flatMap((yg) => yg.subjects.map((sub) => [sub.id, sub]))
    ).values()
  );

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.eyebrow}>Curriculum Management</div>
        <h2 className={styles.title}>Subjects & Resources</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
          Access lesson plans, materials, and student performance metrics for your assigned departments.
        </p>
      </header>

      <div className={styles.grid}>
        {allSubjects.map((subject) => (
          <article key={subject.id} className={styles.subjectCard}>
             <h3 className={styles.subjectTitle}>{subject.name}</h3>
             <p className={styles.subjectMeta}>{subject.description || "No description provided."}</p>
             <div className={styles.action}>
               Manage Content <span>→</span>
             </div>
          </article>
        ))}
        {allSubjects.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)" }}>
            No subjects assigned yet.
          </div>
        )}
      </div>
    </section>
  );
}
