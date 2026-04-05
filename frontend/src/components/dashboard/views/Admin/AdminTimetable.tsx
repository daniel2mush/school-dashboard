import styles from "./AdminTimetable.module.scss";

export default function AdminTimetable() {
  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>School Timetable</div>
        <h2 className={styles.title}>Daily rhythm across all year groups</h2>
        <p className={styles.copy}>
          Monitor lesson coverage, staff allocation, and scheduling bottlenecks.
        </p>
      </div>
    </section>
  );
}
