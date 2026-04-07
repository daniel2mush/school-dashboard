import { useState } from "react";
import styles from "./TeachAttendance.module.scss";
import { useGetTeacherClasses, useSubmitAttendance } from "@/query/TeacherQuery";
import { Avatar } from "@/components/ui";

export default function TeachAttendance() {
  const { data: classes, isLoading } = useGetTeacherClasses();
  const { mutate: submitAttendance, isPending } = useSubmitAttendance();

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

  if (isLoading || !classes) {
    return <div className={styles.view}>Loading attendance portal...</div>;
  }

  const selectedClass = classes.find((c) => c.id.toString() === selectedClassId);
  const students = selectedClass?.students || [];

  const handleMark = (studentId: number, status: string) => {
    submitAttendance({
      studentId,
      status,
      date: new Date(date),
    });
  };

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Daily Register</div>
        <h2 className={styles.title}>Mark Attendance</h2>
        <p className={styles.copy}>
          Keep track of student presence, tardiness, and absences.
        </p>
      </div>

      <div className={styles.controls}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: 6, color: "var(--text-secondary)", fontWeight: 600 }}>
            Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">-- Choose Class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.level})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: 6, color: "var(--text-secondary)", fontWeight: 600 }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {selectedClass && (
        <div className={styles.tableContainer}>
          <div className={styles.headerRow}>
            <div>Student Name</div>
            <div>Mark Status</div>
          </div>
          
          {students.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
              No students enrolled in this class.
            </div>
          ) : (
            students.map((student) => {
              // Find if already marked today
              const todayRecord = student.attendance?.find(
                (a) => new Date(a.date).toISOString().split("T")[0] === date
              );

              return (
                <div key={student.id} className={styles.row}>
                  <div className={styles.studentName}>
                    <Avatar size="sm" seed={student.id.toString()} />
                    {student.name}
                  </div>
                  <div className={styles.actionWrapper}>
                    <button
                      className={`${styles.statusBtn} ${todayRecord?.status === "P" ? styles.activeP : ""}`}
                      onClick={() => handleMark(student.id, "P")}
                      disabled={isPending}
                    >
                      Present
                    </button>
                    <button
                      className={`${styles.statusBtn} ${todayRecord?.status === "T" ? styles.activeT : ""}`}
                      onClick={() => handleMark(student.id, "T")}
                      disabled={isPending}
                    >
                      Late
                    </button>
                    <button
                      className={`${styles.statusBtn} ${todayRecord?.status === "A" ? styles.activeA : ""}`}
                      onClick={() => handleMark(student.id, "A")}
                      disabled={isPending}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
