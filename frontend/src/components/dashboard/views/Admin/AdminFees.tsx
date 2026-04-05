import styles from "./AdminFees.module.scss";

export default function AdminFees() {
  return (
    <section className={styles.view}>
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Finance</div>
        <h2 className={styles.title}>Fee collection and balance tracking</h2>
      </div>
      <div className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.label}>Collected</span>
          <strong className={styles.value}>GHS 418,000</strong>
        </article>
        <article className={styles.card}>
          <span className={styles.label}>Outstanding</span>
          <strong className={styles.value}>GHS 62,000</strong>
        </article>
      </div>
    </section>
  );
}
