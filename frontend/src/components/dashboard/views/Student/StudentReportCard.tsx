import styles from "./StudentReportCard.module.scss";

export default function StudentReportCard() {
  return (
    <section className={styles.view}>
      <div className={styles.card}>
        <div className={styles.eyebrow}>Report Card</div>
        <h2 className={styles.title}>Academic results and teacher remarks</h2>
        <p className={styles.copy}>
          Review subject performance, strengths, and next steps for improvement.
        </p>
      </div>
    </section>
  );
}
