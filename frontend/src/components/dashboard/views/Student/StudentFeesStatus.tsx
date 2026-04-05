import styles from "./StudentFeesStatus.module.scss";

export default function StudentFeesStatus() {
  return (
    <section className={styles.view}>
      <div className={styles.card}>
        <div className={styles.eyebrow}>Fees</div>
        <h2 className={styles.title}>Payment status and balances</h2>
        <p className={styles.copy}>
          Stay up to date with term payments, receipts, and outstanding amounts.
        </p>
      </div>
    </section>
  );
}
