import styles from "./AdminFees.module.scss";
import { useGetAdminAnalytics, useGetSchoolStructure } from "@/query/AdminQuery";
import { Badge } from "@/components/ui";

export default function AdminFees() {
  const { data: analytics, isLoading: isAnalyticLoading } = useGetAdminAnalytics();
  const { data: structure, isLoading: isStructureLoading } = useGetSchoolStructure();

  if (isAnalyticLoading || isStructureLoading || !analytics || !structure) {
    return <div className={styles.view}>Loading financial records...</div>;
  }

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
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Finance</div>
        <h2 className={styles.title}>Fee collection and balance tracking</h2>
        <p style={{ marginTop: 8, color: "var(--text-secondary)" }}>
          Detailed breakdown of school revenue, expected vs collected balances across all year groups.
        </p>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.label}>Collected</span>
          <strong className={styles.value} style={{ color: "var(--green)" }}>
            {formatGHS(analytics.totalCollectedRevenue)}
          </strong>
        </article>
        <article className={styles.card}>
          <span className={styles.label}>Outstanding Balance</span>
          <strong className={styles.value} style={{ color: "var(--red)" }}>
            {formatGHS(analytics.totalExpectedRevenue - analytics.totalCollectedRevenue)}
          </strong>
        </article>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div>Year Group</div>
          <div>Billed Per Captia</div>
          <div>Total Collected</div>
          <div>Collection %</div>
        </div>

        {structure.map((yg) => {
          // Find the related fee records
          const totalBilled = yg.fees.reduce((sum, fee) => sum + fee.amount, 0);
          const totalPaid = yg.fees.reduce((sum, fee) => sum + fee.paid, 0);
          const collectionPercent = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;

          return (
            <div key={yg.id} className={styles.tableRow}>
              <div>
                <strong style={{ display: "block", color: "var(--text-primary)" }}>{yg.name}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{yg._count.students} Students</span>
              </div>
              
              <div>{formatGHS(totalBilled / (yg._count.students || 1))}</div>
              <div>{formatGHS(totalPaid)}</div>
              
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Badge variant={collectionPercent >= 80 ? "green" : collectionPercent >= 50 ? "amber" : "red"}>
                    {collectionPercent}%
                  </Badge>
                </div>
                <div className={styles.progressTrack}>
                  <div 
                    className={styles.progressFill} 
                    style={{ 
                      width: `${collectionPercent}%`,
                      background: collectionPercent >= 80 ? "var(--green)" : collectionPercent >= 50 ? "var(--amber)" : "var(--red)" 
                    }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
