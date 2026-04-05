import styles from "./TeachGrading.module.scss";

export default function TeachGrading() {
  return (
    <section className={styles.view}>
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Assessment</div>
        <h2 className={styles.title}>Gradebooks and marking workflow</h2>
      </div>
      <div className={styles.grid}>
        <article className={styles.card}><span>Pending scripts</span><strong>18</strong></article>
        <article className={styles.card}><span>Completed this week</span><strong>42</strong></article>
      </div>
    </section>
  );
}
