import {
  Badge,
  Card,
  CardHeader,
  MetricCard,
  PageHeader,
} from "@/components/ui";
import styles from "./StudentDashboard.module.scss";
import { PERIODS } from "@/data/mockData";
import useUserStore from "@/store/UserStore";

export default function StudentDashboard() {
  // const {
  //   student,
  //   yearGroup,
  //   teachers,
  //   studentAnnouncements,
  //   studentGrades,
  //   studentTimetable,
  // } = useCurrentStudent();
  // const feePct = Math.round((student.fees.paid / student.fees.total) * 100);
  // const todayLessons = Object.values(studentTimetable)[0] || [];
  // const strongestSubject = [...studentGrades].sort(
  //   (left, right) => right.score - left.score,
  // )[0];
  const student = useUserStore().user;

  if (!student) return;

  return (
    <>
      <PageHeader title={`Good morning, ${student.name.split(" ")[0]}`} />
      <div
        className="metrics-grid"
        style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}
      >
        {/* <MetricCard label="Year group" value={student.enrollmentDate} />
        <MetricCard
          label="Attendance"
          value={`${student.att}%`}
          sub="This term"
          valueColor="var(--green)"
        />
        <MetricCard
          label="Fees paid"
          value={`${feePct}%`}
          sub={`GHS ${student.fees.paid.toLocaleString()} of ${student.fees.total.toLocaleString()}`}
        />
        <MetricCard
          label="Best subject"
          value={strongestSubject?.subject || "Waiting"}
          sub={
            strongestSubject ? `${strongestSubject.score}%` : "No grades yet"
          }
          valueColor="var(--accent)"
        /> */}
      </div>

      <div className="two-col">
        <Card>
          {/* <CardHeader
            title={`My subjects – ${yearGroup.name}`}
            action="View all"
            onAction={() => onNavigate("ssubjects")}
          />
          {yearGroup.subjects.map((subject) => {
            const teacher = teachers.find((candidate) =>
              candidate.subjects.includes(subject),
            );
            const gradeEntry = studentGrades.find(
              (entry) => entry.subject === subject,
            );
            return (
              <div
                key={subject}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: "0.5px solid var(--border-light)",
                }}
              >
                <div>
                  <div style={{ fontSize: 12 }}>{subject}</div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                    {teacher ? teacher.name : "Teacher to be assigned"}
                  </div>
                </div>
                {gradeEntry ? (
                  <Badge variant="blue">{gradeEntry.grade}</Badge>
                ) : (
                  <Badge variant="gray">Awaiting grade</Badge>
                )}
              </div>
            );
          })} */}
        </Card>

        <div>
          <Card>
            {/* <CardHeader title="School announcements" />
            {studentAnnouncements.slice(0, 3).map((announcement) => (
              <div
                key={announcement.id}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "8px 0",
                  borderBottom: "0.5px solid var(--border-light)",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: announcement.urgent
                      ? "var(--red)"
                      : "var(--accent)",
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 12 }}>{announcement.title}</div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-secondary)",
                      marginTop: 1,
                    }}
                  >
                    {announcement.from} · {announcement.date}
                  </div>
                </div>
              </div>
            ))} */}
          </Card>
          <Card>
            {/* <CardHeader title="Next classes" />
            {todayLessons.slice(0, 4).map((subject, index) => (
              <div
                key={`${subject}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: "0.5px solid var(--border-light)",
                }}
              >
                <span style={{ fontSize: 12 }}>{subject}</span>
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  {PERIODS[index]?.time}
                </span>
              </div>
            ))}
          </Card>
          <Card>
            <CardHeader title="Quick actions" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["sreport", "View my report card"],
                ["stimetable", "View class timetable"],
                ["sfees", "Check fee balance"],
              ].map(([page, label]) => (
                <button
                  key={page}
                  className="btn"
                  style={{ textAlign: "left" }}
                  onClick={() => onNavigate(page)}
                >
                  {label} →
                </button>
              ))}
            </div> */}
          </Card>
        </div>
      </div>
    </>
  );
}
