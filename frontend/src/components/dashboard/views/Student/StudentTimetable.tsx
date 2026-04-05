import styles from "./StudentTimetable.module.scss";
import useCurrentStudent from "@/hooks/useCurrentStudent";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [
  { label: "Period 1", time: "7:30 – 8:30" },
  { label: "Period 2", time: "8:30 – 9:30" },
  { label: "Period 3", time: "9:30 – 10:30" },
  { label: "Break", time: "10:30 – 11:00", isBreak: true },
  { label: "Period 4", time: "11:00 – 12:00" },
  { label: "Period 5", time: "12:00 – 13:00" },
];

export default function StudentTimetable() {
  const currentData = useCurrentStudent();

  if (!currentData) return null;

  const { studentTimetable, yearGroup } = currentData;

  // We mapped timetables to an index array.
  // Period 1 = [0], 2 = [1], 3 = [2], Break is skipped, 4 = [3], 5 = [4]
  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Timetable</div>
        <h2 className={styles.title}>Weekly Schedule</h2>
        <p className={styles.copy}>
          Your class schedule for {yearGroup.name}.
        </p>
      </div>

      <div className={styles.timetableContainer}>
        <div className={styles.timetableGrid}>
          {/* Header Row */}
          <div className={styles.headerCell}>Time</div>
          {DAYS.map((day) => (
            <div key={day} className={styles.headerCell}>
              {day}
            </div>
          ))}

          {/* Time Slots */}
          {PERIODS.map((period, index) => {
            if (period.isBreak) {
              return (
                <div key={index} className={styles.breakRow}>
                  {period.label} ({period.time})
                </div>
              );
            }

            // Figure out which index in the backend array this period corresponds to
            let slotIndex = 0;
            if (period.label === "Period 1") slotIndex = 0;
            else if (period.label === "Period 2") slotIndex = 1;
            else if (period.label === "Period 3") slotIndex = 2;
            else if (period.label === "Period 4") slotIndex = 3;
            else if (period.label === "Period 5") slotIndex = 4;

            return (
              <div key={index} className={styles.gridRowWrapper} style={{ display: "contents" }}>
                <div className={styles.timeCell}>
                  <span className={styles.periodLabel}>{period.label}</span>
                  <span>{period.time}</span>
                </div>
                {DAYS.map((day) => {
                  const daySchedule = studentTimetable[day] || [];
                  const subject = daySchedule[slotIndex];

                  return (
                    <div key={`${day}-${period.label}`} className={styles.slotCell}>
                      {subject && subject !== "-" ? (
                        <div className={styles.subjectPill}>{subject}</div>
                      ) : (
                        <span style={{ color: "var(--border-light)" }}>Free</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
