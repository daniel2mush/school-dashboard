import styles from "./AdminYearGroups.module.scss";

export default function AdminYearGroups() {
  return (
    <section className={styles.view}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>Year Groups</div>
        <h2 className={styles.title}>Cohort structure and staffing</h2>
      </header>
      <div className={styles.list}>
        <article className={styles.row}>
          <strong>Year 1</strong>
          <span>198 learners</span>
          <span>4 class teachers assigned</span>
        </article>
        <article className={styles.row}>
          <strong>Year 6</strong>
          <span>176 learners</span>
          <span>Exam preparation in progress</span>
        </article>
      </div>
    </section>
  );
}
