import styles from "./AdminAnalytics.module.scss";
import { useGetAdminAnalytics } from "@/query/AdminQuery";

export default function AdminAnalytics() {
  const { data: stats, isLoading } = useGetAdminAnalytics();

  if (isLoading || !stats) {
    return <div className={styles.view}>Processing school-wide data...</div>;
  }

  // Calculate some derived metrics
  const collectionRate = stats.totalExpectedRevenue > 0 ? (stats.totalCollectedRevenue / stats.totalExpectedRevenue) * 100 : 0;
  const teacherStudentRatio = stats.teachers > 0 ? (stats.students / stats.teachers).toFixed(1) : "N/A";

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.eyebrow}>Deep Insights</div>
        <h2 className={styles.title}>Comparative Analytics</h2>
        <p style={{ marginTop: 8, color: "var(--text-secondary)" }}>
          Performance ratios and institutional health metrics.
        </p>
      </header>
      
      <div className={styles.bands}>
        <article className={styles.band}>
          <span>Financial Health</span>
          <strong>{collectionRate.toFixed(1)}% Collection Rate</strong>
          <div style={{ marginTop: 12, height: 4, background: "var(--bg-secondary)", borderRadius: 2 }}>
             <div style={{ width: `${collectionRate}%`, height: "100%", background: "var(--amber)", borderRadius: 2 }} />
          </div>
        </article>

        <article className={styles.band}>
          <span>Operational Ratio</span>
          <strong>{teacherStudentRatio} Students per Teacher</strong>
        </article>

        <article className={styles.band}>
          <span>Course Coverage</span>
          <strong>{stats.subjects} Unique Subjects</strong>
        </article>
      </div>
    </section>
  );
}
