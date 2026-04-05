import styles from "./TeachAnnouncements.module.scss";

export default function TeachAnnouncements() {
  return (
    <section className={styles.view}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Communication</div>
        <h2 className={styles.title}>Teacher notices and classroom updates</h2>
      </div>
      <article className={styles.card}>
        Share reminders with students, parents, and other staff from one place.
      </article>
    </section>
  );
}
