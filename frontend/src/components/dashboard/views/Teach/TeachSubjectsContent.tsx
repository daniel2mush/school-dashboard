import styles from "./TeachSubjectsContent.module.scss";

export default function TeachSubjectsContent() {
  return (
    <section className={styles.view}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Subjects</div>
        <h2 className={styles.title}>Lessons, plans, and class resources</h2>
      </div>
      <div className={styles.stack}>
        <article className={styles.card}>English Language materials ready for Week 6.</article>
        <article className={styles.card}>Science assignments scheduled for submission.</article>
      </div>
    </section>
  );
}
