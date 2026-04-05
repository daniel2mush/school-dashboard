import styles from "./StudentSubjects.module.scss";

export default function StudentSubjects() {
  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Subjects</div>
        <h2 className={styles.title}>Current classes and coursework</h2>
        <p className={styles.copy}>
          Keep up with subjects, assignments, and progress expectations.
        </p>
      </div>
    </section>
  );
}
