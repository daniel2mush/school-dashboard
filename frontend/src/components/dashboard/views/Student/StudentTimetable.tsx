import styles from "./StudentTimetable.module.scss";

export default function StudentTimetable() {
  return (
    <section className={styles.view}>
      <div className={styles.card}>
        <div className={styles.eyebrow}>Timetable</div>
        <h2 className={styles.title}>Your lessons through the week</h2>
        <p className={styles.copy}>
          See what is coming up next and stay prepared for every class.
        </p>
      </div>
    </section>
  );
}
