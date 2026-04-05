import styles from "./AdminUsers.module.scss";

export default function AdminUsers() {
  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>People Directory</div>
        <h2 className={styles.title}>Staff and student management</h2>
        <p className={styles.copy}>
          Review account status, onboarding needs, and active school population.
        </p>
      </div>
      <div className={styles.stats}>
        <article className={styles.card}><span>Teachers</span><strong>84</strong></article>
        <article className={styles.card}><span>Students</span><strong>1,248</strong></article>
        <article className={styles.card}><span>Support Staff</span><strong>26</strong></article>
      </div>
    </section>
  );
}
