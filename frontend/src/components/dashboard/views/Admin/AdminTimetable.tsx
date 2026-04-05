import styles from "./AdminTimetable.module.scss";
import { useGetSchoolStructure } from "@/query/AdminQuery";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function AdminTimetable() {
  const { data: yearGroups, isLoading } = useGetSchoolStructure();

  if (isLoading || !yearGroups) {
    return <div className={styles.view}>Loading school schedule registry...</div>;
  }

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.eyebrow}>Institutional Oversight</div>
        <h2 className={styles.title}>Master Scheduling</h2>
        <p className={styles.copy}>
          High-level view of all Year Group timetables and subject allocation.
        </p>
      </header>

      <div className={styles.timetableGrid}>
        {yearGroups.map((yg) => (
          <div key={yg.id} className={styles.timetableCard}>
             <div className={styles.cardHeader}>
                {yg.name} - {yg.level}
             </div>
             
             <div className={styles.miniGrid}>
                {DAYS.map(day => {
                  // Filter timetables for this specific day
                  const daySlots = yg.timetables
                    .filter(t => t.day === day)
                    .sort((a, b) => a.periodId - b.periodId);

                  return (
                    <div key={day} className={styles.dayRow}>
                      <span className={styles.dayLabel}>{day.slice(0, 3)}</span>
                      <div className={styles.slots}>
                        {[1, 2, 3, 4, 5].map(periodId => {
                          const slot = daySlots.find(s => s.periodId === periodId);
                          const subjectName = slot?.subject?.name;
                          return (
                            <div 
                              key={periodId} 
                              className={`${styles.slot} ${subjectName ? styles.populated : ""}`}
                              title={subjectName || "Free"}
                            >
                              {subjectName ? subjectName.slice(0, 3) : "-"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        ))}
      </div>
    </section>
  );
}
