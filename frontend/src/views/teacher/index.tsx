import { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useSchoolData } from "../../providers/SchoolDataProvider";
import { gradeColor, scoreLetter } from "../../data/mockData";
import { AttBadge, Badge, Card, CardHeader, MetricCard, PageHeader, ProgressBar, Toggle, AnnouncementItem, UserRow } from "../../components/ui";

function useCurrentTeacher() {
  const { user } = useAuth();
  const { teachers, yearGroups, students, publications, announcements, grades, attendance } = useSchoolData();
  const teacher = teachers.find((candidate) => candidate.email === user?.email) || teachers[0];
  const years = yearGroups.filter((yearGroup) => teacher?.years?.includes(yearGroup.id));
  const studentsForTeacher = students.filter((student) => teacher?.years?.includes(student.year));
  const materials = publications.filter((publication) => publication.teacherId === teacher?.id);
  const relatedAnnouncements = announcements.filter((announcement) => {
    const targets = years.map((yearGroup) => yearGroup.name);
    return announcement.from === teacher?.name || announcement.target === "All" || announcement.target === "Teachers only" || targets.includes(announcement.target);
  });

  return {
    teacher,
    years,
    studentsForTeacher,
    materials,
    relatedAnnouncements,
    grades,
    attendance,
  };
}

export function TeacherYears({ onNavigate }) {
  const { teacher, years, studentsForTeacher, materials, relatedAnnouncements } = useCurrentTeacher();

  return (
    <>
      <PageHeader title={`Welcome back, ${teacher.name.split(" ")[0]}`} />
      <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        <MetricCard label="Assigned year groups" value={years.length} sub="Current workload" />
        <MetricCard label="Students in scope" value={studentsForTeacher.length} sub="Across all assigned years" />
        <MetricCard label="Published materials" value={materials.filter((publication) => publication.published).length} sub={`${materials.length} total uploads`} />
        <MetricCard label="Announcements" value={relatedAnnouncements.length} sub="Relevant to your classes" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
        {years.map((yearGroup) => (
          <div
            key={yearGroup.id}
            style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border-light)", borderRadius: "var(--radius-lg)", padding: 14, borderTop: `3px solid ${yearGroup.color}`, cursor: "pointer" }}
            onClick={() => onNavigate("tgrades")}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>{yearGroup.name}</div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", margin: "2px 0 8px" }}>{yearGroup.level}</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: "var(--text-secondary)" }}><strong style={{ color: "var(--text-primary)" }}>{studentsForTeacher.filter((student) => student.year === yearGroup.id).length}</strong> students</span>
              <span style={{ fontSize: 10, color: "var(--text-secondary)" }}><strong style={{ color: "var(--text-primary)" }}>{yearGroup.subjects.filter((subject) => teacher.subjects.includes(subject)).length}</strong> of my subjects</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {yearGroup.subjects.filter((subject) => teacher.subjects.includes(subject)).map((subject) => <Badge key={subject} variant="blue">{subject}</Badge>)}
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="Teaching focus" />
        {[
          `${materials.filter((publication) => !publication.published).length} materials are still saved as drafts.`,
          `${studentsForTeacher.filter((student) => student.att < 80).length} students need attendance follow-up.`,
          `${relatedAnnouncements.filter((announcement) => announcement.urgent).length} urgent announcements are active for your classes.`,
        ].map((message) => (
          <div key={message} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "0.5px solid var(--border-light)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", marginTop: 5, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{message}</div>
          </div>
        ))}
      </Card>
    </>
  );
}

export function TeacherSubjects({ onOpenModal }) {
  const { teacher, materials } = useCurrentTeacher();
  const { togglePublication } = useSchoolData();
  const [yearFilter, setYearFilter] = useState("All years");
  const visibleMaterials = materials.filter((publication) => yearFilter === "All years" || publication.year === yearFilter);

  return (
    <>
      <PageHeader title="Subjects and content">
        <button className="btn btn-primary" onClick={() => onOpenModal({ type: "upload" })}>+ Upload material</button>
      </PageHeader>
      <Card>
        <CardHeader title={`${teacher.name}'s materials`}>
          <select
            style={{ fontSize: 11, padding: "4px 8px", border: "0.5px solid var(--border-mid)", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
          >
            <option>All years</option>
            {Array.from(new Set(materials.map((publication) => publication.year))).map((year) => <option key={year}>{year}</option>)}
          </select>
        </CardHeader>
        <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 10 }}>
          {materials.filter((publication) => publication.published).length} published · {materials.filter((publication) => !publication.published).length} draft
        </div>
        {visibleMaterials.map((publication) => (
          <div key={publication.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid var(--border-light)" }}>
            <div style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>◻</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{publication.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>
                <Badge variant="gray" style={{ marginRight: 4 }}>{publication.year}</Badge>
                <Badge variant="blue">{publication.subject}</Badge> · {publication.date}
              </div>
            </div>
            <Toggle on={publication.published} onToggle={() => togglePublication(publication.id)} />
          </div>
        ))}
      </Card>
    </>
  );
}

export function GradingPage({ onOpenModal }) {
  const { teacher, years, studentsForTeacher, grades } = useCurrentTeacher();
  const [selectedYearId, setSelectedYearId] = useState(years[0]?.id || 1);
  const [selectedSubject, setSelectedSubject] = useState(teacher.subjects[0] || "Mathematics");
  const visibleStudents = studentsForTeacher.filter((student) => student.year === selectedYearId);
  const results = visibleStudents.map((student) => {
    const entry = (grades[String(student.id)] || []).find((grade) => grade.subject === selectedSubject);
    const mid = entry?.midTerm ?? entry?.score ?? 0;
    const assignmentAvg = entry?.assignmentAvg ?? Math.max(0, mid - 5);
    const projected = entry?.score ?? Math.round(mid * 0.6 + assignmentAvg * 0.4);
    return { student, mid, assignmentAvg, projected };
  });
  const classAverage = results.length ? Math.round(results.reduce((sum, entry) => sum + entry.projected, 0) / results.length) : 0;

  return (
    <>
      <PageHeader title="Grading">
        <select style={{ fontSize: 11, padding: "4px 8px", border: "0.5px solid var(--border-mid)", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} value={selectedYearId} onChange={(event) => setSelectedYearId(Number(event.target.value))}>
          {years.map((yearGroup) => <option key={yearGroup.id} value={yearGroup.id}>{yearGroup.name}</option>)}
        </select>
        <select style={{ fontSize: 11, padding: "4px 8px", border: "0.5px solid var(--border-mid)", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
          {teacher.subjects.map((subject) => <option key={subject}>{subject}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => onOpenModal({ type: "addGrade", data: { yearId: selectedYearId, subject: selectedSubject } })}>+ Add grades</button>
      </PageHeader>

      <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <MetricCard label="Class size" value={results.length} sub="Visible students" />
        <MetricCard label="Projected average" value={`${classAverage}%`} sub={selectedSubject} valueColor="var(--accent)" />
        <MetricCard label="Top score" value={`${Math.max(...results.map((entry) => entry.projected), 0)}%`} sub="Current selection" valueColor="var(--green)" />
      </div>

      <Card>
        <CardHeader title={`${selectedSubject} – ${years.find((yearGroup) => yearGroup.id === selectedYearId)?.name || "Year"} scores`} />
        <table className="data-table">
          <thead><tr><th style={{ width: "25%" }}>Student</th><th>Mid-term</th><th>Assignment avg.</th><th>Projected</th><th style={{ width: "10%" }}>Grade</th></tr></thead>
          <tbody>
            {results.map(({ student, mid, assignmentAvg, projected }) => {
              const gc = gradeColor(projected);
              return (
                <tr key={student.id}>
                  <td><UserRow initials={student.initials} color={student.color} name={student.name} size={20} /></td>
                  <td>{mid}%</td>
                  <td>{assignmentAvg}%</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {projected}%
                      <div style={{ flex: 1, height: 4, background: "var(--bg-secondary)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${projected}%`, height: "100%", background: gc.text, borderRadius: 2 }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: gc.bg, color: gc.text, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                      {scoreLetter(projected)}
                    </div>
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

export function AttendancePage({ onOpenModal }) {
  const { years, studentsForTeacher, attendance } = useCurrentTeacher();
  const [selectedYearId, setSelectedYearId] = useState(years[0]?.id || 1);
  const days = Array.from({ length: 20 }, (_, index) => `${index + 1}`);
  const yearStudents = studentsForTeacher.filter((student) => student.year === selectedYearId);

  return (
    <>
      <PageHeader title="Attendance">
        <select style={{ fontSize: 11, padding: "4px 8px", border: "0.5px solid var(--border-mid)", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} value={selectedYearId} onChange={(event) => setSelectedYearId(Number(event.target.value))}>
          {years.map((yearGroup) => <option key={yearGroup.id} value={yearGroup.id}>{yearGroup.name}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => onOpenModal({ type: "markAttendance", data: { yearId: selectedYearId } })}>Mark today</button>
      </PageHeader>

      <Card style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 12, fontSize: 10, flexWrap: "wrap" }}>
          {[["var(--green-bg)", "Present"], ["var(--red-bg)", "Absent"], ["var(--amber-bg)", "Late"], ["var(--bg-secondary)", "Holiday"]].map(([bg, label]) => (
            <span key={label}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: bg, marginRight: 4 }} />{label}</span>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title={`${years.find((yearGroup) => yearGroup.id === selectedYearId)?.name || "Year"} attendance log`} />
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th style={{ width: "22%" }}>Student</th>
                <th style={{ width: "10%" }}>Att. %</th>
                {days.map((day) => <th key={day} style={{ width: "3.5%", textAlign: "center" }}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {yearStudents.map((student) => {
                const record = attendance[String(student.id)] || [];
                return (
                  <tr key={student.id}>
                    <td><UserRow initials={student.initials} color={student.color} name={student.name.split(" ")[0]} size={18} /></td>
                    <td><AttBadge pct={student.att} /></td>
                    {record.map((entry, index) => (
                      <td key={index} style={{ padding: "4px 2px" }}>
                        <div className={`att-day att-${entry.toLowerCase()}`}>{entry}</div>
                      </td>
                    ))}
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

export function TeacherAnnouncements({ onOpenModal }) {
  const { relatedAnnouncements } = useCurrentTeacher();
  return (
    <>
      <PageHeader title="Announcements">
        <button className="btn btn-primary" onClick={() => onOpenModal({ type: "announcement" })}>+ Post</button>
      </PageHeader>
      <Card>{relatedAnnouncements.map((announcement) => <AnnouncementItem key={announcement.id} ann={announcement} />)}</Card>
    </>
  );
}
