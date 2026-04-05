import styles from "./AdminAnalytics.module.scss";

export default function AdminAnalytics() {
  return (
    <section className={styles.view}>
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Analytics</div>
        <h2 className={styles.title}>Decision support for leadership</h2>
      </div>
      <div className={styles.bands}>
        <article className={styles.band}><span>Performance</span><strong>Steady growth</strong></article>
        <article className={styles.band}><span>Attendance</span><strong>Above target</strong></article>
        <article className={styles.band}><span>Collections</span><strong>On schedule</strong></article>
      </div>
    </section>
  );
}
