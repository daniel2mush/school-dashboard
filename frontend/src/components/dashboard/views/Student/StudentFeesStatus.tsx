import styles from "./StudentFeesStatus.module.scss";
import useCurrentStudent from "@/hooks/useCurrentStudent";

export default function StudentFeesStatus() {
  const currentData = useCurrentStudent();

  if (!currentData) return null;

  const { student, yearGroup } = currentData;
  const { total, paid } = student.fees;

  const balance = total - paid;
  const percentagePaid = total > 0 ? Math.round((paid / total) * 100) : 100;
  
  // Format currency
  const formatGHS = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Finances</div>
        <h2 className={styles.title}>Fee Status & Bills</h2>
        <p className={styles.copy}>
          Keep track of your outstanding balances for {yearGroup.name}.
        </p>
      </div>

      <div className={styles.feeCards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total Billed</div>
          <div className={styles.cardValue}>{formatGHS(total)}</div>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressLabel}>
              <span>Amount Paid: {formatGHS(paid)}</span>
              <span>{percentagePaid}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${percentagePaid}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.card} style={{ borderColor: balance > 0 ? "var(--red)" : "var(--border-light)" }}>
          <div className={styles.cardLabel}>Outstanding Balance</div>
          <div className={styles.cardValue} style={{ color: balance > 0 ? "var(--red)" : "var(--green)" }}>
            {formatGHS(balance)}
          </div>
          
          {balance > 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Please settle the outstanding balance before end of term to avoid disruptions.
            </p>
          ) : (
            <p style={{ color: "var(--green)", fontSize: "0.85rem", fontWeight: 500 }}>
              Your account is fully settled. Thank you!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
