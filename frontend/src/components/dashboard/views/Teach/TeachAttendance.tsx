import styles from "./TeachAttendance.module.scss";

export default function TeachAttendance() {
  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Attendance</div>
        <h2 className={styles.title}>Daily register and follow-up</h2>
        <p className={styles.copy}>
          Mark presence, review patterns, and identify learners needing support.
        </p>
      </div>
    </section>
  );
}
