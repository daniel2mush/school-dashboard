import styles from "./AdminOverview.module.scss";

export default function AdminOverview() {
  return (
    <section className={styles.view}>
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Administration</div>
        <h2 className={styles.title}>School performance at a glance</h2>
        <p className={styles.copy}>
          Track enrolment, attendance health, fee collection, and operational
          priorities from one place.
        </p>
      </div>
      <div className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.label}>Enrollment</span>
          <strong className={styles.value}>1,248 Students</strong>
          <p className={styles.meta}>Balanced across all active year groups.</p>
        </article>
        <article className={styles.card}>
          <span className={styles.label}>Attendance Today</span>
          <strong className={styles.value}>94.2%</strong>
          <p className={styles.meta}>Strong turnout across morning sessions.</p>
        </article>
      </div>
    </section>
  );
}
