import {
  Badge,
  Card,
  CardHeader,
  MetricCard,
  PageHeader,
} from "@/components/ui";
import styles from "./StudentDashboard.module.scss";
import useCurrentStudent from "@/hooks/useCurrentStudent";
import { useGetAnnouncements } from "@/query/AuthQuery";

const PERIODS = [
  { label: "Period 1", time: "7:30 – 8:30" },
  { label: "Period 2", time: "8:30 – 9:30" },
  { label: "Period 3", time: "9:30 – 10:30" },
  { label: "Break",    time: "10:30 – 11:00", isBreak: true },
  { label: "Period 4", time: "11:00 – 12:00" },
  { label: "Period 5", time: "12:00 – 13:00" },
];

interface StudentDashboardProps {
  onNavigate?: (page: string) => void;
}

export default function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const currentData = useCurrentStudent();
  const { data: announcements } = useGetAnnouncements();

  if (!currentData) return null;

  const {
    student,
    yearGroup,
    teachers,
    studentAnnouncements,
    studentGrades,
    studentTimetable,
  } = currentData;

  const feePct = Math.round((student.fees.paid / student.fees.total) * 100);
  const todayLessons = Object.values(studentTimetable)[0] as string[] || [];
  const strongestSubject = [...studentGrades].sort(
    (left, right) => right.score - left.score,
  )[0];

  return (
    <>
      <PageHeader title={`Good morning, ${student.name.split(" ")[0]}`} />
      
      <div className={styles.metricsGrid}>
        <MetricCard
          label="Year group"
          value={yearGroup.name}
          sub={yearGroup.level}
        />
        <MetricCard
          label="Attendance"
          value={`${student.att}%`}
          sub="This term"
          valueColor="var(--green)"
        />
        <MetricCard
          label="Fees paid"
          value={`${feePct}%`}
          sub={`CFA ${student.fees.paid.toLocaleString()} of ${student.fees.total.toLocaleString()}`}
        />
        <MetricCard
          label="Best subject"
          value={strongestSubject?.subject || "Waiting"}
          sub={strongestSubject ? `${strongestSubject.score}%` : "No grades yet"}
          valueColor="var(--accent)"
        />
      </div>

      <div className={styles.twoCol}>
        <Card>
          <CardHeader
            title={`My subjects – ${yearGroup.name}`}
            action="View all"
            onAction={() => onNavigate?.("ssubjects")}
          />
          {yearGroup.subjects.map((subject) => {
            const teacher = teachers.find((candidate) =>
              candidate.subjects.includes(subject),
            );
            const gradeEntry = studentGrades.find(
              (entry) => entry.subject === subject,
            );
            return (
              <div key={subject} className={styles.subjectRow}>
                <div className={styles.subjectInfo}>
                  <div className={styles.subjectName}>{subject}</div>
                  <div className={styles.subjectName}>{teacher ? teacher.name : "Teacher to be assigned"}</div>
                </div>
                {gradeEntry ? (
                  <Badge variant="blue">{gradeEntry.grade}</Badge>
                ) : (
                  <Badge variant="gray">Awaiting grade</Badge>
                )}
              </div>
            );
          })}
        </Card>

        <div className={styles.sidebar}>
          <Card>
            <CardHeader title="School announcements" />
            {announcements?.slice(0, 4).map((ann) => (
              <div key={ann.id} className={styles.announcementRow}>
                <div
                  className={`${styles.announcementDot} ${
                    ann.priority === "Urgent" ? styles.urgent : styles.normal
                  }`}
                />
                <div className={styles.announcementInfo}>
                  <div className={styles.announcementTitle}>{ann.title}</div>
                  <div className={styles.announcementMeta}>
                    {ann.author?.name} · {new Date(ann.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {(!announcements || announcements.length === 0) && (
              <div style={{ padding: 20, textAlign: "center", fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
                No active announcements
              </div>
            )}
          </Card>
          
          <Card>
            <CardHeader title="Next classes" />
            {todayLessons.slice(0, 4).map((subject, index) => (
              <div key={`${subject}-${index}`} className={styles.classRow}>
                <span className={styles.className}>{subject}</span>
                <span className={styles.classTime}>
                  {PERIODS[index]?.time}
                </span>
              </div>
            ))}
          </Card>
          
          <Card>
            <CardHeader title="Quick actions" />
            <div className={styles.actionsList}>
              {[
                ["sreport", "View my report card"],
                ["stimetable", "View class timetable"],
                ["sfees", "Check fee balance"],
              ].map(([page, label]) => (
                <button
                  key={page}
                  className={styles.actionButton}
                  onClick={() => onNavigate?.(page)}
                >
                  {label} <span>→</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
