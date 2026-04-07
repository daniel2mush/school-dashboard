import { Badge } from "@/components/ui";
import styles from "./TeachMyYearGroups.module.scss";
import { useGetTeacherClasses } from "@/query/TeacherQuery";

export default function TeachMyYearGroups() {
  const { data: classes, isLoading, error } = useGetTeacherClasses();

  if (isLoading) {
    return (
      <section className={styles.view}>
        <div className={styles.panel}>Loading your classes...</div>
      </section>
    );
  }

  if (error || !classes) {
    return (
      <section className={styles.view}>
        <div className={styles.panel}>An error occurred fetching your classes.</div>
      </section>
    );
  }

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>My Year Groups</div>
        <h2 className={styles.title}>Classes under your care</h2>
        <p className={styles.copy}>
          Review class sizes and access rosters for all your assigned year groups.
        </p>
      </div>

      {classes.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
          You have not been assigned to any year groups yet.
        </div>
      ) : (
        <div className={styles.grid}>
          {classes.map((yg) => (
            <div key={yg.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.yearGroupName}>{yg.name}</h3>
                  <div className={styles.levelLabel}>{yg.level}</div>
                </div>
                <Badge variant="purple">Active</Badge>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.statBlock}>
                  <div className={styles.statValue}>{yg.students?.length || 0}</div>
                  <div className={styles.statLabel}>Students</div>
                </div>
                <div className={styles.statBlock}>
                  <div className={styles.statValue}>{yg.subjects?.length || 0}</div>
                  <div className={styles.statLabel}>Subjects</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
