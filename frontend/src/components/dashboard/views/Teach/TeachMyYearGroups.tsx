import styles from "./TeachMyYearGroups.module.scss";

export default function TeachMyYearGroups() {
  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>My Year Groups</div>
        <h2 className={styles.title}>Classes under your care</h2>
        <p className={styles.copy}>
          Review attendance trends, class notices, and learner support needs.
        </p>
      </div>
    </section>
  );
}
