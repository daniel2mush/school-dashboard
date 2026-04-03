import { useAuth } from "../../providers/AuthProvider";
import { useSchoolData } from "../../providers/SchoolDataProvider";
import { PERIODS, SUBJECT_COLORS, gradeColor, scoreLetter } from "../../data/mockData";
import { Badge, Card, CardHeader, GradeRing, MetricCard, PageHeader, ProgressBar } from "../../components/ui";

function useCurrentStudent() {
  const { user } = useAuth();
  const { school, yearGroups, teachers, students, announcements, grades, attendance, timetable } = useSchoolData();
  const student = students.find((candidate) => candidate.email === user?.email) || students[0];
  const yearGroup = yearGroups.find((candidate) => candidate.id === student.year) || yearGroups[0];
  const studentAnnouncements = announcements.filter((announcement) => announcement.target === "All" || announcement.target === yearGroup?.name);
  const studentGrades = grades[String(student.id)] || [];
  const attendanceRecord = attendance[String(student.id)] || [];
  const studentTimetable = timetable[String(student.year)] || {};

  return {
    school,
    student,
    yearGroup,
    teachers,
    studentAnnouncements,
    studentGrades,
    attendanceRecord,
    studentTimetable,
  };
}

function buildFeeLineItems(total, paid) {
  const tuition = Math.round(total * 0.68);
  const facility = Math.round(total * 0.12);
  const activities = Math.round(total * 0.08);
  const assessment = Math.round(total * 0.07);
  const digital = Math.max(total - tuition - facility - activities - assessment, 0);
  const items = [
    { item: "Tuition fee", amount: tuition },
    { item: "Facility levy", amount: facility },
    { item: "Clubs and sports", amount: activities },
    { item: "Assessment fee", amount: assessment },
    { item: "Digital learning", amount: digital },
  ];

  let runningPaid = paid;

  return items.map((entry) => {
    const itemPaid = Math.max(0, Math.min(entry.amount, runningPaid));
    runningPaid -= itemPaid;

    return {
      ...entry,
      paid: itemPaid >= entry.amount,
    };
  });
}

export function StudentDash({ onNavigate }) {
  const { student, yearGroup, teachers, studentAnnouncements, studentGrades, studentTimetable } = useCurrentStudent();
  const feePct = Math.round((student.fees.paid / student.fees.total) * 100);
  const todayLessons = Object.values(studentTimetable)[0] || [];
  const strongestSubject = [...studentGrades].sort((left, right) => right.score - left.score)[0];

  return (
    <>
      <PageHeader title={`Good morning, ${student.name.split(" ")[0]}`} />
      <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        <MetricCard label="Year group" value={yearGroup.name} sub={yearGroup.level} />
        <MetricCard label="Attendance" value={`${student.att}%`} sub="This term" valueColor="var(--green)" />
        <MetricCard label="Fees paid" value={`${feePct}%`} sub={`GHS ${student.fees.paid.toLocaleString()} of ${student.fees.total.toLocaleString()}`} />
        <MetricCard label="Best subject" value={strongestSubject?.subject || "Waiting"} sub={strongestSubject ? `${strongestSubject.score}%` : "No grades yet"} valueColor="var(--accent)" />
      </div>

      <div className="two-col">
        <Card>
          <CardHeader title={`My subjects – ${yearGroup.name}`} action="View all" onAction={() => onNavigate("ssubjects")} />
          {yearGroup.subjects.map((subject) => {
            const teacher = teachers.find((candidate) => candidate.subjects.includes(subject));
            const gradeEntry = studentGrades.find((entry) => entry.subject === subject);
            return (
              <div key={subject} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid var(--border-light)" }}>
                <div>
                  <div style={{ fontSize: 12 }}>{subject}</div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{teacher ? teacher.name : "Teacher to be assigned"}</div>
                </div>
                {gradeEntry ? <Badge variant="blue">{gradeEntry.grade}</Badge> : <Badge variant="gray">Awaiting grade</Badge>}
              </div>
            );
          })}
        </Card>

        <div>
          <Card>
            <CardHeader title="School announcements" />
            {studentAnnouncements.slice(0, 3).map((announcement) => (
              <div key={announcement.id} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "0.5px solid var(--border-light)" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: announcement.urgent ? "var(--red)" : "var(--accent)", marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12 }}>{announcement.title}</div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>{announcement.from} · {announcement.date}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <CardHeader title="Next classes" />
            {todayLessons.slice(0, 4).map((subject, index) => (
              <div key={`${subject}-${index}`} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid var(--border-light)" }}>
                <span style={{ fontSize: 12 }}>{subject}</span>
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{PERIODS[index]?.time}</span>
              </div>
            ))}
          </Card>
          <Card>
            <CardHeader title="Quick actions" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[["sreport", "View my report card"], ["stimetable", "View class timetable"], ["sfees", "Check fee balance"]].map(([page, label]) => (
                <button key={page} className="btn" style={{ textAlign: "left" }} onClick={() => onNavigate(page)}>{label} →</button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export function StudentSubjects() {
  const { yearGroup, teachers, studentGrades } = useCurrentStudent();

  return (
    <>
      <PageHeader title={`My subjects – ${yearGroup.name}`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
        {yearGroup.subjects.map((subject) => {
          const teacher = teachers.find((candidate) => candidate.subjects.includes(subject));
          const gradeData = studentGrades.find((entry) => entry.subject === subject);
          const colors = SUBJECT_COLORS[subject] || { bg: "var(--bg-secondary)", text: "var(--text-secondary)" };
          return (
            <Card key={subject} style={{ borderLeft: `3px solid ${colors.text}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{subject}</div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 8 }}>{teacher ? teacher.name : "Teacher to be assigned"}</div>
              {gradeData ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <GradeRing letter={gradeData.grade} bg={gradeColor(gradeData.score).bg} textColor={gradeColor(gradeData.score).text} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>Score: {gradeData.score}%</div>
                    <ProgressBar pct={gradeData.score} />
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>No grade has been entered yet for this subject.</div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}

export function ReportCard() {
  const { school, student, yearGroup, studentGrades } = useCurrentStudent();
  const avg = studentGrades.length ? Math.round(studentGrades.reduce((sum, grade) => sum + grade.score, 0) / studentGrades.length) : 0;
  const colors = gradeColor(avg || 0);
  const teacherRemark = studentGrades.find((grade) => grade.comment)?.comment || "Strong work this term. Keep building consistency across every subject.";

  return (
    <>
      <PageHeader title="Report card">
        <button className="btn" onClick={() => window.print()}>Print report</button>
      </PageHeader>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, paddingBottom: 12, borderBottom: "0.5px solid var(--border-light)" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: student.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "var(--text-inverse)" }}>{student.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{student.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{yearGroup.name} · {yearGroup.level} · {school.term}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <GradeRing letter={scoreLetter(avg || 0)} bg={colors.bg} textColor={colors.text} size={44} />
            <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 3 }}>{avg}% avg</div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Subject</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Teacher</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {studentGrades.map((grade) => {
              const entryColors = gradeColor(grade.score);
              return (
                <tr key={grade.subject}>
                  <td style={{ fontWeight: 600 }}>{grade.subject}</td>
                  <td>{grade.score}%</td>
                  <td><span className="badge" style={{ background: entryColors.bg, color: entryColors.text }}>{grade.grade}</span></td>
                  <td style={{ fontSize: 10, color: "var(--text-secondary)" }}>{grade.teacher}</td>
                  <td><ProgressBar pct={grade.score} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "0.5px solid var(--border-light)" }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Class teacher's remark</div>
          <div style={{ fontSize: 12, marginTop: 3 }}>{teacherRemark}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 16, fontSize: 11, flexWrap: "wrap" }}>
            <span style={{ color: "var(--text-secondary)" }}>Attendance: <strong style={{ color: "var(--text-primary)" }}>{student.att}%</strong></span>
            <span style={{ color: "var(--text-secondary)" }}>Subjects graded: <strong style={{ color: "var(--text-primary)" }}>{studentGrades.length}</strong></span>
            <span style={{ color: "var(--text-secondary)" }}>Conduct: <strong style={{ color: "var(--green)" }}>Excellent</strong></span>
          </div>
        </div>
      </Card>
    </>
  );
}

export function StudentAttendance() {
  const { student, attendanceRecord } = useCurrentStudent();
  const present = attendanceRecord.filter((entry) => entry === "P").length;
  const absent = attendanceRecord.filter((entry) => entry === "A").length;
  const late = attendanceRecord.filter((entry) => entry === "T").length;
  const days = Array.from({ length: attendanceRecord.length }, (_, index) => `${index + 1}`);

  return (
    <>
      <PageHeader title="My attendance" />
      <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <MetricCard label="Present days" value={present} sub={`of ${attendanceRecord.length} school days`} valueColor="var(--green)" />
        <MetricCard label="Absent days" value={absent} valueColor="var(--red)" />
        <MetricCard label="Late arrivals" value={late} valueColor="var(--amber)" />
      </div>

      <Card>
        <CardHeader title="Daily record" />
        <div style={{ display: "flex", gap: 12, fontSize: 10, marginBottom: 10, flexWrap: "wrap" }}>
          {[["var(--green-bg)", "Present"], ["var(--red-bg)", "Absent"], ["var(--amber-bg)", "Late"], ["var(--bg-secondary)", "Holiday"]].map(([bg, label]) => (
            <span key={label}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: bg, marginRight: 4 }} />{label}</span>
          ))}
        </div>
        <div className="att-grid">
          {attendanceRecord.map((entry, index) => (
            <div key={index} className={`att-day att-${entry.toLowerCase()}`} title={`Day ${days[index]}: ${entry}`}>
              {days[index]}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "0.5px solid var(--border-light)" }}>
          <ProgressBar pct={student.att} height={6} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-secondary)", marginTop: 4 }}>
            <span>Attendance rate: {student.att}%</span>
            <span>Minimum required: 75%</span>
          </div>
        </div>
      </Card>
    </>
  );
}

export function StudentTimetable() {
  const { yearGroup, studentTimetable } = useCurrentStudent();

  return (
    <>
      <PageHeader title={`My timetable – ${yearGroup.name}`} />
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table className="timetable-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Time</th>
                {Object.keys(studentTimetable).map((day) => <th key={day}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period, periodIndex) => {
                if (period.isBreak) {
                  return (
                    <tr key={period.label}>
                      <td className="tt-period">Break</td>
                      <td className="tt-period">{period.time}</td>
                      {Object.keys(studentTimetable).map((day) => <td key={day} style={{ background: "var(--bg-secondary)", fontSize: 10, color: "var(--text-secondary)" }}>—</td>)}
                    </tr>
                  );
                }

                const slotIndex = periodIndex > 3 ? periodIndex - 1 : periodIndex;
                return (
                  <tr key={period.label}>
                    <td className="tt-period">{period.label}</td>
                    <td className="tt-period">{period.time}</td>
                    {Object.keys(studentTimetable).map((day) => {
                      const subject = studentTimetable[day]?.[slotIndex] || "-";
                      const colors = SUBJECT_COLORS[subject] || { bg: "var(--bg-secondary)", text: "var(--text-secondary)" };
                      return (
                        <td key={day}>
                          <div className="tt-cell" style={{ background: colors.bg, color: colors.text }}>{subject}</div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export function StudentFees() {
  const { school, student } = useCurrentStudent();
  const balance = student.fees.total - student.fees.paid;
  const pct = Math.round((student.fees.paid / student.fees.total) * 100);
  const lineItems = buildFeeLineItems(student.fees.total, student.fees.paid);

  return (
    <>
      <PageHeader title="Fee status" />
      <Card style={{ maxWidth: 560 }}>
        <CardHeader title={`${school.term} – ${student.name}`} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: pct >= 100 ? "var(--green)" : "var(--accent)" }}>{pct}%</div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>Paid</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="fee-bar" style={{ height: 8, borderRadius: 4 }}>
              <div className="fee-fill" style={{ width: `${pct}%`, background: pct >= 100 ? "var(--green)" : "var(--accent)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-secondary)", marginTop: 4 }}>
              <span>GHS {student.fees.paid.toLocaleString()} paid</span>
              <span>GHS {student.fees.total.toLocaleString()} total</span>
            </div>
          </div>
        </div>

        <table className="data-table">
          <thead><tr><th>Item</th><th>Amount ({school.currency})</th><th>Status</th></tr></thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.item}>
                <td>{item.item}</td>
                <td>{item.amount.toLocaleString()}</td>
                <td><Badge variant={item.paid ? "green" : "red"}>{item.paid ? "Paid" : "Outstanding"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 12, padding: "10px 12px", background: balance > 0 ? "var(--red-bg)" : "var(--green-bg)", borderRadius: "var(--radius-md)" }}>
          {balance > 0 ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--red-text)" }}>Outstanding balance: {school.currency} {balance.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: "var(--red-text)", marginTop: 2 }}>You are {student.fees.total ? Math.round((balance / student.fees.total) * 100) : 0}% away from completing this term's payments.</div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "var(--green-text)" }}>All fees fully paid. Thank you!</div>
          )}
        </div>
      </Card>
    </>
  );
}
