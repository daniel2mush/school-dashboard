import styles from "./StudentFeesStatus.module.scss";
import useCurrentStudent from "@/hooks/useCurrentStudent";

export default function StudentFeesStatus() {
  const currentData = useCurrentStudent();

  if (!currentData) return null;

  const { student, yearGroup } = currentData;
  const { total, paid } = student.fees;
  const feeItems = student.fees.items || [];

  const balance = total - paid;
  const percentagePaid = total > 0 ? Math.round((paid / total) * 100) : 100;
  
  // Format currency
  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount).replace("F CFA", "CFA").replace("FCFA", "CFA");
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
          <div className={styles.cardValue}>{formatCFA(total)}</div>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressLabel}>
              <span>Amount Paid: {formatCFA(paid)}</span>
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
            {formatCFA(balance)}
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

      <div className={styles.card}>
        <div className={styles.cardLabel}>Expense list</div>
        {feeItems.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            No fee items have been assigned to your year group yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {feeItems.map((item: any) => (
              <div
                key={item.id}
                style={{
                  padding: "14px 16px",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {item.title}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: 4 }}>
                      {item.description || "Year-group fee item"}
                    </div>
                  </div>
                  <div
                    style={{
                      color: item.isFullyPaid ? "var(--green)" : "var(--amber)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.isFullyPaid ? "Fully paid" : "Pending"}
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 10,
                    marginTop: 12,
                    fontSize: "0.85rem",
                  }}
                >
                  <span>Total: {formatCFA(item.amount)}</span>
                  <span>Paid: {formatCFA(item.paid)}</span>
                  <span>Remaining: {formatCFA(item.remaining)}</span>
                </div>
                {item.amountInWords ? (
                  <div style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                    Amount in words: {item.amountInWords}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
