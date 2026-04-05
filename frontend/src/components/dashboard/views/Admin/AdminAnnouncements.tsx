import styles from "./AdminAnnouncements.module.scss";

export default function AdminAnnouncements() {
  return (
    <section className={styles.view}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Communication</div>
        <h2 className={styles.title}>Whole-school announcements</h2>
      </div>
      <article className={styles.notice}>
        <strong>Assembly update</strong>
        <p>Monday assembly starts at 8:00 AM in the main hall.</p>
      </article>
    </section>
  );
}
