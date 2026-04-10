import styles from "./Loading.module.scss";

export default function Loading() {
  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.orbit} aria-hidden="true">
          <div className={styles.ring}></div>
          <div className={styles.core}></div>
        </div>
        <div className={styles.eyebrow}>School Dashboard</div>
        <div className={styles.title}>
          Bringing your dashboard online
        </div>
        <div className={styles.copy}>
          Checking your session and matching you to the right dashboard.
        </div>
      </div>
    </div>
  );
}
