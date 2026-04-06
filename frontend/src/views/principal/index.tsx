import { useState } from "react";
import {
  Card,
  CardHeader,
  AnnouncementItem,
  AttBadge,
  Badge,
  FeeBadge,
  FeeBar,
  MetricCard,
  PageHeader,
  ProgressBar,
  SelectInput,
  UserRow,
} from "../../components/ui";
import {
  useSchoolData,
  DAYS,
  PERIOD_OPTIONS,
} from "../../providers/SchoolDataProvider";

function formatMoney(amount, currency = "CFA") {
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

function getStudentAverage(grades) {
  if (!grades?.length) {
    return 0;
  }

  return average(grades.map((grade) => grade.score));
}

export function Overview({ onNavigate, onOpenModal }) {
  const {
    school,
    yearGroups,
    teachers,
    students,
    announcements,
    publications,
  } = useSchoolData();
  const totalPaid = students.reduce(
    (sum, student) => sum + student.fees.paid,
    0,
  );
  const totalDue = students.reduce(
    (sum, student) => sum + student.fees.total,
    0,
  );
  const feePct = totalDue ? Math.round((totalPaid / totalDue) * 100) : 0;
  const avgAtt = average(students.map((student) => student.att));
  const overdueCount = students.filter(
    (student) => student.fees.paid < student.fees.total,
  ).length;
  const draftCount = publications.filter(
    (publication) => !publication.published,
  ).length;
  const understaffedYears = yearGroups.filter(
    (yearGroup) =>
      !teachers.some((teacher) => teacher.years.includes(yearGroup.id)),
  );

  return (
    <>
      <PageHeader title="Platform overview">
        <button
          className="btn btn-primary"
          onClick={() => onOpenModal({ type: "announcement" })}
        >
          + Announcement
        </button>
        <button
          className="btn"
          onClick={() => onOpenModal({ type: "yeargroup" })}
        >
          + Year group
        </button>
      </PageHeader>

      <div
        className="metrics-grid"
        style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
      >
        <MetricCard
          label="Year groups"
          value={yearGroups.length}
          sub="All levels"
        />
        <MetricCard
          label="Total students"
          value={students.length}
          sub="Active this term"
        />
        <MetricCard
          label="Teaching staff"
          value={teachers.length}
          sub="All active"
        />
        <MetricCard
          label="Fees collected"
          value={`${feePct}%`}
          sub={`${formatMoney(totalPaid, school.currency)} of ${formatMoney(totalDue, school.currency)}`}
          valueColor={feePct >= 80 ? "var(--green)" : "var(--amber)"}
        />
        <MetricCard
          label="Avg attendance"
          value={`${avgAtt}%`}
          sub="Across the whole school"
          valueColor="var(--accent)"
        />
      </div>

      <div className="two-col">
        <Card>
          <CardHeader
            title="Year groups at a glance"
            action="Manage"
            onAction={() => onNavigate("yeargroups")}
          />
          {yearGroups.map((yearGroup) => {
            const assignedTeachers = teachers.filter((teacher) =>
              teacher.years.includes(yearGroup.id),
            ).length;
            return (
              <div
                key={yearGroup.id}
                style={{
                  padding: "8px 0",
                  borderBottom: "0.5px solid var(--border-light)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {yearGroup.name}{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        color: "var(--text-secondary)",
                        fontSize: 10,
                      }}
                    >
                      · {yearGroup.level}
                    </span>
                  </span>
                  <span
                    style={{ fontSize: 10, color: "var(--text-secondary)" }}
                  >
                    {yearGroup.students} students
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10,
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>{yearGroup.subjects.length} subjects</span>
                  <span>{assignedTeachers} assigned teachers</span>
                </div>
                <ProgressBar
                  pct={Math.min(
                    100,
                    Math.round((yearGroup.students / 50) * 100),
                  )}
                  color={yearGroup.color}
                  style={{ marginTop: 8 }}
                />
              </div>
            );
          })}
        </Card>

        <div>
          <Card>
            <CardHeader
              title="Recent announcements"
              action="All"
              onAction={() => onNavigate("announcements")}
            />
            {announcements.slice(0, 4).map((announcement) => (
              <AnnouncementItem key={announcement.id} ann={announcement} />
            ))}
          </Card>

          <Card>
            <CardHeader title="Operational watchlist" />
            {[
              overdueCount
                ? `${overdueCount} students still have outstanding fees.`
                : "All student fee accounts are up to date.",
              draftCount
                ? `${draftCount} learning materials are still saved as drafts.`
                : "All uploaded materials are published.",
              understaffedYears.length
                ? `${understaffedYears.map((yearGroup) => yearGroup.name).join(", ")} need teacher coverage.`
                : "Every year group has at least one assigned teacher.",
            ].map((message) => (
              <div
                key={message}
                style={{
                  padding: "8px 0",
                  borderBottom: "0.5px solid var(--border-light)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                {message}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}

export function YearGroups({ onOpenModal }) {
  const { yearGroups, teachers, students } = useSchoolData();

  return (
    <>
      <PageHeader title="Year groups">
        <button
          className="btn btn-primary"
          onClick={() => onOpenModal({ type: "yeargroup" })}
        >
          + New year group
        </button>
      </PageHeader>

      <div className="three-col" style={{ marginBottom: 12 }}>
        {yearGroups.map((yearGroup) => {
          const assignedTeachers = teachers.filter((teacher) =>
            teacher.years.includes(yearGroup.id),
          );
          const roster = students.filter(
            (student) => student.year === yearGroup.id,
          );
          return (
            <div
              key={yearGroup.id}
              style={{
                background: "var(--bg-primary)",
                border: "0.5px solid var(--border-light)",
                borderRadius: "var(--radius-lg)",
                padding: 14,
                borderTop: `3px solid ${yearGroup.color}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {yearGroup.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-secondary)",
                  marginBottom: 10,
                }}
              >
                {yearGroup.level}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 10,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {yearGroup.students}
                  </strong>{" "}
                  students
                </span>
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {assignedTeachers.length}
                  </strong>{" "}
                  teachers
                </span>
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {yearGroup.subjects.length}
                  </strong>{" "}
                  subjects
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  marginBottom: 10,
                }}
              >
                {yearGroup.subjects.slice(0, 4).map((subject) => (
                  <Badge key={subject} variant="gray">
                    {subject}
                  </Badge>
                ))}
                {yearGroup.subjects.length > 4 && (
                  <Badge variant="gray">+{yearGroup.subjects.length - 4}</Badge>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  marginBottom: 12,
                }}
              >
                {assignedTeachers.slice(0, 3).map((teacher) => (
                  <Badge key={teacher.id} variant="blue">
                    {teacher.initials}
                  </Badge>
                ))}
                {assignedTeachers.length > 3 && (
                  <Badge variant="blue">
                    +{assignedTeachers.length - 3} staff
                  </Badge>
                )}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-secondary)",
                  marginBottom: 10,
                }}
              >
                Roster preview:{" "}
                {roster
                  .slice(0, 3)
                  .map((student) => student.name.split(" ")[0])
                  .join(", ") || "No students yet"}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button
                  className="btn-icon"
                  onClick={() =>
                    onOpenModal({ type: "editYear", data: yearGroup.id })
                  }
                >
                  Edit
                </button>
                <button
                  className="btn-icon"
                  onClick={() =>
                    onOpenModal({ type: "assignTeacher", data: yearGroup.id })
                  }
                >
                  Assign teachers
                </button>
                <button
                  className="btn-icon"
                  onClick={() =>
                    onOpenModal({ type: "enrolStudents", data: yearGroup.id })
                  }
                >
                  Move students
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader title="Subject and teacher coverage" />
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "22%" }}>Teacher</th>
              <th>Subjects</th>
              <th>Year groups</th>
              <th style={{ width: "12%" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>
                  <UserRow
                    initials={teacher.initials}
                    color={teacher.color}
                    name={teacher.name}
                    sub={teacher.email}
                    size={22}
                  />
                </td>
                <td>
                  {teacher.subjects.map((subject) => (
                    <Badge
                      key={subject}
                      variant="blue"
                      style={{ marginRight: 4 }}
                    >
                      {subject}
                    </Badge>
                  ))}
                </td>
                <td>
                  {teacher.years.map((yearId) => (
                    <Badge
                      key={yearId}
                      variant="gray"
                      style={{ marginRight: 4 }}
                    >
                      {yearGroups.find((yearGroup) => yearGroup.id === yearId)
                        ?.name || `Year ${yearId}`}
                    </Badge>
                  ))}
                </td>
                <td>
                  <Badge variant="green">{teacher.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export function UsersPage({ onOpenModal }) {
  const { yearGroups, teachers, students } = useSchoolData();
  const [studentFilter, setStudentFilter] = useState("All year groups");
  const [search, setSearch] = useState("");

  const visibleTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email.toLowerCase().includes(search.toLowerCase()),
  );
  const visibleStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());
    const matchesYear =
      studentFilter === "All year groups" ||
      yearGroups.find((yearGroup) => yearGroup.id === student.year)?.name ===
        studentFilter;
    return matchesSearch && matchesYear;
  });

  return (
    <>
      <PageHeader title="Staff and students">
        <input
          placeholder="Search users"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{
            minWidth: 180,
            padding: "6px 10px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-mid)",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        />
        <button
          className="btn"
          onClick={() => onOpenModal({ type: "addTeacher" })}
        >
          + Add teacher
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onOpenModal({ type: "addStudent" })}
        >
          + Add student
        </button>
      </PageHeader>

      <Card>
        <CardHeader title={`Teaching staff (${visibleTeachers.length})`} />
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Name</th>
              <th>Subjects</th>
              <th>Years</th>
              <th style={{ width: "18%" }}>Email</th>
            </tr>
          </thead>
          <tbody>
            {visibleTeachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>
                  <UserRow
                    initials={teacher.initials}
                    color={teacher.color}
                    name={teacher.name}
                    size={22}
                  />
                </td>
                <td>
                  {teacher.subjects.map((subject) => (
                    <Badge
                      key={subject}
                      variant="blue"
                      style={{ marginRight: 4 }}
                    >
                      {subject}
                    </Badge>
                  ))}
                </td>
                <td>
                  {teacher.years.map((yearId) => (
                    <Badge
                      key={yearId}
                      variant="gray"
                      style={{ marginRight: 4 }}
                    >
                      {yearGroups.find((yearGroup) => yearGroup.id === yearId)
                        ?.name || `Year ${yearId}`}
                    </Badge>
                  ))}
                </td>
                <td style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  {teacher.email}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <CardHeader title={`Students (${visibleStudents.length})`}>
          <SelectInput
            options={[
              "All year groups",
              ...yearGroups.map((yearGroup) => yearGroup.name),
            ]}
            value={studentFilter}
            onChange={(event) => setStudentFilter(event.target.value)}
          />
        </CardHeader>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "22%" }}>Name</th>
              <th style={{ width: "14%" }}>Year</th>
              <th style={{ width: "12%" }}>Attendance</th>
              <th>Fee status</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((student) => (
              <tr key={student.id}>
                <td>
                  <UserRow
                    initials={student.initials}
                    color={student.color}
                    name={student.name}
                    size={22}
                  />
                </td>
                <td>
                  <Badge variant="blue">
                    {yearGroups.find(
                      (yearGroup) => yearGroup.id === student.year,
                    )?.name || `Year ${student.year}`}
                  </Badge>
                </td>
                <td>
                  <AttBadge pct={student.att} />
                </td>
                <td>
                  <FeeBar paid={student.fees.paid} total={student.fees.total} />
                </td>
                <td style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  {student.email}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export function FeesPage({ onOpenModal }) {
  const { school, yearGroups, students } = useSchoolData();
  const [yearFilter, setYearFilter] = useState("All year groups");
  const total = students.reduce((sum, student) => sum + student.fees.total, 0);
  const paid = students.reduce((sum, student) => sum + student.fees.paid, 0);
  const outstanding = total - paid;
  const pct = total ? Math.round((paid / total) * 100) : 0;
  const visibleStudents = students.filter(
    (student) =>
      yearFilter === "All year groups" ||
      yearGroups.find((yearGroup) => yearGroup.id === student.year)?.name ===
        yearFilter,
  );

  return (
    <>
      <PageHeader title="Fee management">
        <button
          className="btn btn-primary"
          onClick={() => onOpenModal({ type: "feeStructure" })}
        >
          Set fee structure
        </button>
      </PageHeader>

      <div className="metrics-grid">
        <MetricCard
          label="Total billed"
          value={formatMoney(total, school.currency)}
          sub="Current term"
        />
        <MetricCard
          label="Collected"
          value={formatMoney(paid, school.currency)}
          sub={`${pct}% of total`}
          valueColor="var(--green)"
        />
        <MetricCard
          label="Outstanding"
          value={formatMoney(outstanding, school.currency)}
          valueColor="var(--red)"
          sub={`${students.filter((student) => student.fees.paid < student.fees.total).length} students`}
        />
        <MetricCard
          label="Fully paid"
          value={
            students.filter(
              (student) => student.fees.paid >= student.fees.total,
            ).length
          }
          sub={`of ${students.length} students`}
        />
      </div>

      <div className="two-col">
        <Card>
          <CardHeader title="Collection by year group" />
          {yearGroups.map((yearGroup) => {
            const yearStudents = students.filter(
              (student) => student.year === yearGroup.id,
            );
            const yearTotal = yearStudents.reduce(
              (sum, student) => sum + student.fees.total,
              0,
            );
            const yearPaid = yearStudents.reduce(
              (sum, student) => sum + student.fees.paid,
              0,
            );
            const yearPct = yearTotal
              ? Math.round((yearPaid / yearTotal) * 100)
              : 0;
            const color =
              yearPct >= 90
                ? "var(--green)"
                : yearPct >= 70
                  ? "var(--amber)"
                  : "var(--red)";

            return (
              <div key={yearGroup.id} style={{ padding: "8px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    marginBottom: 4,
                  }}
                >
                  <span>{yearGroup.name}</span>
                  <span style={{ color }}>{yearPct}%</span>
                </div>
                <ProgressBar pct={yearPct} color={color} />
              </div>
            );
          })}
        </Card>

        <Card>
          <CardHeader title="Outstanding accounts" />
          {students
            .filter((student) => student.fees.paid < student.fees.total)
            .slice(0, 6)
            .map((student) => (
              <div
                key={student.id}
                style={{
                  padding: "8px 0",
                  borderBottom: "0.5px solid var(--border-light)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 12 }}>{student.name}</span>
                  <FeeBadge
                    paid={student.fees.paid}
                    total={student.fees.total}
                  />
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-secondary)",
                    marginTop: 4,
                  }}
                >
                  Balance:{" "}
                  {formatMoney(
                    student.fees.total - student.fees.paid,
                    school.currency,
                  )}
                </div>
              </div>
            ))}
        </Card>
      </div>

      <Card>
        <CardHeader title="Student fee tracker">
          <SelectInput
            options={[
              "All year groups",
              ...yearGroups.map((yearGroup) => yearGroup.name),
            ]}
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
          />
        </CardHeader>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "20%" }}>Student</th>
              <th style={{ width: "14%" }}>Year</th>
              <th>Total fee</th>
              <th>Paid</th>
              <th>Balance</th>
              <th style={{ width: "12%" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((student) => {
              const balance = student.fees.total - student.fees.paid;
              return (
                <tr key={student.id}>
                  <td>
                    <UserRow
                      initials={student.initials}
                      color={student.color}
                      name={student.name}
                      size={20}
                    />
                  </td>
                  <td>
                    <Badge variant="gray">
                      {yearGroups.find(
                        (yearGroup) => yearGroup.id === student.year,
                      )?.name || `Year ${student.year}`}
                    </Badge>
                  </td>
                  <td>{formatMoney(student.fees.total, school.currency)}</td>
                  <td>{formatMoney(student.fees.paid, school.currency)}</td>
                  <td
                    style={{
                      color: balance > 0 ? "var(--red)" : "var(--green)",
                    }}
                  >
                    {formatMoney(balance, school.currency)}
                  </td>
                  <td>
                    <FeeBadge
                      paid={student.fees.paid}
                      total={student.fees.total}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export function TimetablePage({ onOpenModal }) {
  const { yearGroups, timetable, teachers } = useSchoolData();
  const [selectedYearId, setSelectedYearId] = useState(yearGroups[0]?.id || 1);
  const selectedYear =
    yearGroups.find((yearGroup) => yearGroup.id === selectedYearId) ||
    yearGroups[0];
  const selectedSchedule = timetable[String(selectedYearId)] || {};
  const assignedTeachers = teachers.filter((teacher) =>
    teacher.years.includes(selectedYearId),
  );

  return (
    <>
      <PageHeader title="School timetable">
        <SelectInput
          options={yearGroups.map((yearGroup) => yearGroup.name)}
          value={selectedYear?.name}
          onChange={(event) => {
            const match = yearGroups.find(
              (yearGroup) => yearGroup.name === event.target.value,
            );
            if (match) {
              setSelectedYearId(match.id);
            }
          }}
          style={{ minWidth: 160 }}
        />
        <button
          className="btn btn-primary"
          onClick={() =>
            onOpenModal({
              type: "timetableEdit",
              data: { yearId: selectedYearId },
            })
          }
        >
          Edit slot
        </button>
      </PageHeader>

      <div className="two-col">
        <Card>
          <CardHeader title={`${selectedYear?.name} timetable`} />
          <div style={{ overflowX: "auto" }}>
            <table className="timetable-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Time</th>
                  {DAYS.map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIOD_OPTIONS.map((period, periodIndex) => (
                  <tr key={period.label}>
                    <td className="tt-period">{period.label}</td>
                    <td className="tt-period">{period.time}</td>
                    {DAYS.map((day) => {
                      const subject =
                        selectedSchedule[day]?.[periodIndex] || "-";
                      return (
                        <td key={day}>
                          <button
                            type="button"
                            className="tt-cell"
                            style={{
                              width: "100%",
                              background: "var(--bg-secondary)",
                              color: "var(--text-primary)",
                              border: "none",
                            }}
                            onClick={() =>
                              onOpenModal({
                                type: "timetableEdit",
                                data: {
                                  yearId: selectedYearId,
                                  day,
                                  periodIndex,
                                  subject,
                                },
                              })
                            }
                          >
                            {subject}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div>
          <Card>
            <CardHeader title="Planning summary" />
            <div style={{ display: "grid", gap: 10 }}>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 16,
                  background: "var(--bg-secondary)",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  Assigned teachers
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>
                  {assignedTeachers.length}
                </div>
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 16,
                  background: "var(--bg-secondary)",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  Subjects scheduled
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>
                  {selectedYear?.subjects.length || 0}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Teacher coverage" />
            {assignedTeachers.length ? (
              assignedTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  style={{
                    padding: "8px 0",
                    borderBottom: "0.5px solid var(--border-light)",
                  }}
                >
                  <div style={{ fontSize: 12 }}>{teacher.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                    {teacher.subjects.join(", ")}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                No teachers are currently assigned to this year group.
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

export function AnnouncementsPage({ onOpenModal }) {
  const { announcements, yearGroups } = useSchoolData();
  const [targetFilter, setTargetFilter] = useState("All targets");
  const [priorityFilter, setPriorityFilter] = useState("Everything");

  const visibleAnnouncements = announcements.filter((announcement) => {
    const matchesTarget =
      targetFilter === "All targets" || announcement.target === targetFilter;
    const matchesPriority =
      priorityFilter === "Everything" ||
      (priorityFilter === "Urgent only" && announcement.urgent) ||
      (priorityFilter === "Standard only" && !announcement.urgent);
    return matchesTarget && matchesPriority;
  });

  return (
    <>
      <PageHeader title="Announcements">
        <SelectInput
          options={[
            "All targets",
            "All",
            "Teachers only",
            ...yearGroups.map((yearGroup) => yearGroup.name),
          ]}
          value={targetFilter}
          onChange={(event) => setTargetFilter(event.target.value)}
          style={{ minWidth: 160 }}
        />
        <SelectInput
          options={["Everything", "Urgent only", "Standard only"]}
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          style={{ minWidth: 140 }}
        />
        <button
          className="btn btn-primary"
          onClick={() => onOpenModal({ type: "announcement" })}
        >
          + Post
        </button>
      </PageHeader>
      <Card>
        {visibleAnnouncements.map((announcement) => (
          <AnnouncementItem key={announcement.id} ann={announcement} />
        ))}
      </Card>
    </>
  );
}

export function AnalyticsPage() {
  const { yearGroups, students, publications, grades } = useSchoolData();
  const attByYear = yearGroups.map((yearGroup) =>
    average(
      students
        .filter((student) => student.year === yearGroup.id)
        .map((student) => student.att),
    ),
  );
  const feeByYear = yearGroups.map((yearGroup) => {
    const yearStudents = students.filter(
      (student) => student.year === yearGroup.id,
    );
    const total = yearStudents.reduce(
      (sum, student) => sum + student.fees.total,
      0,
    );
    const paid = yearStudents.reduce(
      (sum, student) => sum + student.fees.paid,
      0,
    );
    return total ? Math.round((paid / total) * 100) : 0;
  });
  const averages = students
    .map((student) => ({
      name: student.name,
      score: getStudentAverage(grades[String(student.id)]),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);
  const topPerformer = averages[0];
  const avgAttendance = average(students.map((student) => student.att));
  const feeCollection = average(feeByYear);

  return (
    <>
      <PageHeader title="Analytics and oversight" />
      <div
        className="metrics-grid"
        style={{ gridTemplateColumns: "repeat(5, minmax(0,1fr))" }}
      >
        <MetricCard
          label="Avg attendance"
          value={`${avgAttendance}%`}
          sub="School-wide"
        />
        <MetricCard
          label="Top year (att.)"
          value={
            yearGroups[attByYear.indexOf(Math.max(...attByYear))]?.name || "N/A"
          }
          sub={`${Math.max(...attByYear, 0)}% avg`}
        />
        <MetricCard
          label="Fee collection"
          value={`${feeCollection}%`}
          sub="This term"
        />
        <MetricCard
          label="Published materials"
          value={
            publications.filter((publication) => publication.published).length
          }
          sub={`${publications.length} total files`}
        />
        <MetricCard
          label="Top performer"
          value={topPerformer?.name?.split(" ")[0] || "N/A"}
          sub={
            topPerformer ? `${topPerformer.score}% average` : "No grades yet"
          }
        />
      </div>

      <div className="two-col">
        <Card>
          <CardHeader title="Attendance by year group" />
          {yearGroups.map((yearGroup, index) => (
            <div key={yearGroup.id} style={{ padding: "6px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  marginBottom: 3,
                }}
              >
                <span>{yearGroup.name}</span>
                <span style={{ color: "var(--text-secondary)" }}>
                  {attByYear[index]}%
                </span>
              </div>
              <ProgressBar pct={attByYear[index]} color={yearGroup.color} />
            </div>
          ))}
        </Card>

        <Card>
          <CardHeader title="Fee collection by year group" />
          {yearGroups.map((yearGroup, index) => {
            const pct = feeByYear[index];
            const color =
              pct >= 90
                ? "var(--green)"
                : pct >= 60
                  ? "var(--amber)"
                  : "var(--red)";
            return (
              <div key={yearGroup.id} style={{ padding: "6px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    marginBottom: 3,
                  }}
                >
                  <span>{yearGroup.name}</span>
                  <span style={{ color }}>{pct}%</span>
                </div>
                <ProgressBar pct={pct} color={color} />
              </div>
            );
          })}
        </Card>
      </div>

      <Card>
        <CardHeader title="Student performance leaderboard" />
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Student</th>
              <th style={{ width: "20%" }}>Year group</th>
              <th>Average score</th>
              <th style={{ width: "16%" }}>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {averages.slice(0, 8).map((entry) => {
              const student = students.find(
                (candidate) => candidate.name === entry.name,
              );
              return (
                <tr key={entry.name}>
                  <td>{entry.name}</td>
                  <td>
                    <Badge variant="gray">
                      {yearGroups.find(
                        (yearGroup) => yearGroup.id === student?.year,
                      )?.name || "N/A"}
                    </Badge>
                  </td>
                  <td>{entry.score}%</td>
                  <td>
                    <AttBadge pct={student?.att || 0} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
