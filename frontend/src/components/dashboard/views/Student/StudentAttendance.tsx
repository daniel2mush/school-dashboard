import styles from "./StudentAttendance.module.scss";

export default function StudentAttendance() {
  return (
    <section className={styles.view}>
      <div className={styles.card}>
        <div className={styles.eyebrow}>Attendance</div>
        <h2 className={styles.title}>Presence, punctuality, and habits</h2>
        <p className={styles.copy}>
          Follow your attendance pattern and stay informed about school targets.
        </p>
      </div>
    </section>
  );
}
