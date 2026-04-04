// import { useState } from "react";
// import { useAuth } from "../providers/AuthProvider";
// import { DAYS, PERIOD_OPTIONS, useSchoolData } from "../providers/SchoolDataProvider";

// export default function Modal({ modal, onClose }) {
//   return (
//     <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
//       <div className="modal-box">
//         <ModalContent type={modal.type} data={modal.data} onClose={onClose} />
//       </div>
//     </div>
//   );
// }

// function ModalContent({ type, data, onClose }) {
//   if (type === "announcement") return <AnnouncementModal onClose={onClose} />;
//   if (type === "yeargroup" || type === "editYear") return <YearGroupModal onClose={onClose} yearGroupId={typeof data === "number" ? data : data?.yearId} />;
//   if (type === "assignTeacher") return <AssignTeachersModal onClose={onClose} yearGroupId={typeof data === "number" ? data : data?.yearId} />;
//   if (type === "enrolStudents") return <EnrolStudentsModal onClose={onClose} yearGroupId={typeof data === "number" ? data : data?.yearId} />;
//   if (type === "addTeacher") return <AccountModal onClose={onClose} accountType="teacher" />;
//   if (type === "addStudent") return <AccountModal onClose={onClose} accountType="student" />;
//   if (type === "upload") return <UploadModal onClose={onClose} />;
//   if (type === "markAttendance") return <AttendanceModal onClose={onClose} yearGroupId={typeof data === "number" ? data : data?.yearId} />;
//   if (type === "feeStructure") return <FeeStructureModal onClose={onClose} />;
//   if (type === "timetableEdit") return <TimetableEditModal onClose={onClose} initialData={data} />;
//   if (type === "addGrade") return <GradeModal onClose={onClose} initialData={data} />;

//   return <div style={{ fontSize: 12 }}>Unknown modal type: {type}</div>;
// }

// function ModalActions({ onClose, onSave, saveLabel = "Save" }) {
//   return (
//     <div className="modal-actions">
//       <button className="btn" onClick={onClose}>Cancel</button>
//       <button className="btn btn-primary" onClick={onSave}>{saveLabel}</button>
//     </div>
//   );
// }

// function ModalError({ message }) {
//   if (!message) {
//     return null;
//   }

//   return (
//     <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: "var(--red-bg)", color: "var(--red-text)", fontSize: 12 }}>
//       {message}
//     </div>
//   );
// }

// function ToggleChip({ active, children, onClick }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={active ? "btn btn-primary" : "btn"}
//       style={{ padding: "4px 10px", fontSize: 11 }}
//     >
//       {children}
//     </button>
//   );
// }

// function AnnouncementModal({ onClose }) {
//   const { user } = useAuth();
//   const { yearGroups, postAnnouncement } = useSchoolData();
//   const [title, setTitle] = useState("");
//   const [body, setBody] = useState("");
//   const [target, setTarget] = useState("All");
//   const [priority, setPriority] = useState("Normal");
//   const [error, setError] = useState("");

//   const handleSave = () => {
//     if (!title.trim() || !body.trim()) {
//       setError("Add a title and message before posting the announcement.");
//       return;
//     }

//     postAnnouncement({
//       title: title.trim(),
//       body: body.trim(),
//       target,
//       urgent: priority === "Urgent",
//       from: user?.name || "Sunridge Academy",
//     });
//     onClose();
//   };

//   return (
//     <>
//       <div className="modal-title">Post announcement</div>
//       <label>Title</label>
//       <input type="text" placeholder="Announcement title" value={title} onChange={(event) => setTitle(event.target.value)} />
//       <label>Message</label>
//       <textarea rows={4} placeholder="Type your message..." value={body} onChange={(event) => setBody(event.target.value)} />
//       <label>Target audience</label>
//       <select value={target} onChange={(event) => setTarget(event.target.value)}>
//         <option value="All">All users</option>
//         {yearGroups.map((yearGroup) => <option key={yearGroup.id} value={yearGroup.name}>{yearGroup.name}</option>)}
//         <option value="Teachers only">Teachers only</option>
//       </select>
//       <label>Priority</label>
//       <select value={priority} onChange={(event) => setPriority(event.target.value)}>
//         <option>Normal</option>
//         <option>Urgent</option>
//       </select>
//       <ModalError message={error} />
//       <ModalActions onClose={onClose} onSave={handleSave} saveLabel="Post" />
//     </>
//   );
// }

// function YearGroupModal({ onClose, yearGroupId }) {
//   const { yearGroups, subjectOptions, feeStructures, saveYearGroup } = useSchoolData();
//   const yearGroup = yearGroups.find((candidate) => candidate.id === yearGroupId);
//   const [name, setName] = useState(yearGroup?.name || "");
//   const [level, setLevel] = useState(yearGroup?.level || "Primary");
//   const [selectedSubjects, setSelectedSubjects] = useState<string[]>(yearGroup?.subjects || []);
//   const [feeTotal, setFeeTotal] = useState(String(feeStructures[String(yearGroupId)] || 3000));
//   const [error, setError] = useState("");

//   const toggleSubject = (subject: string) => {
//     setSelectedSubjects((current) =>
//       current.includes(subject)
//         ? current.filter((item) => item !== subject)
//         : [...current, subject],
//     );
//   };

//   const handleSave = () => {
//     if (!name.trim()) {
//       setError("Give the year group a name before saving.");
//       return;
//     }

//     if (!selectedSubjects.length) {
//       setError("Select at least one subject for this year group.");
//       return;
//     }

//     saveYearGroup({
//       id: yearGroupId,
//       name: name.trim(),
//       level,
//       subjects: selectedSubjects,
//       feeTotal: Number(feeTotal) || 3000,
//     });
//     onClose();
//   };

//   return (
//     <>
//       <div className="modal-title">{yearGroup ? "Edit year group" : "Create year group"}</div>
//       <label>Year group name</label>
//       <input type="text" placeholder="e.g. Year 3" value={name} onChange={(event) => setName(event.target.value)} />
//       <label>Level</label>
//       <select value={level} onChange={(event) => setLevel(event.target.value)}>
//         <option>Primary</option>
//         <option>Junior Secondary</option>
//         <option>Senior Secondary</option>
//         <option>University</option>
//       </select>
//       <label>Default term fee (GHS)</label>
//       <input type="number" min={0} value={feeTotal} onChange={(event) => setFeeTotal(event.target.value)} />
//       <label>Subjects</label>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
//         {subjectOptions.map((subject) => (
//           <ToggleChip key={subject} active={selectedSubjects.includes(subject)} onClick={() => toggleSubject(subject)}>
//             {subject}
//           </ToggleChip>
//         ))}
//       </div>
//       <ModalError message={error} />
//       <ModalActions onClose={onClose} onSave={handleSave} saveLabel="Save year group" />
//     </>
//   );
// }

// function AssignTeachersModal({ onClose, yearGroupId }) {
//   const { yearGroups, teachers, assignTeachersToYear } = useSchoolData();
//   const yearGroup = yearGroups.find((candidate) => candidate.id === yearGroupId);
//   const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>(
//     teachers.filter((teacher) => teacher.years.includes(yearGroupId)).map((teacher) => teacher.id),
//   );

//   const toggleTeacher = (teacherId: number) => {
//     setSelectedTeacherIds((current) =>
//       current.includes(teacherId)
//         ? current.filter((id) => id !== teacherId)
//         : [...current, teacherId],
//     );
//   };

//   return (
//     <>
//       <div className="modal-title">Assign teachers to {yearGroup?.name || "year group"}</div>
//       <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 10 }}>
//         Pick the staff members who should work with this year group.
//       </div>
//       <div style={{ marginTop: 8, maxHeight: 260, overflowY: "auto" }}>
//         {teachers.map((teacher) => (
//           <button
//             key={teacher.id}
//             type="button"
//             onClick={() => toggleTeacher(teacher.id)}
//             style={{
//               width: "100%",
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//               padding: "8px 0",
//               border: "none",
//               background: "transparent",
//               borderBottom: "0.5px solid var(--border-light)",
//               textAlign: "left",
//             }}
//           >
//             <input type="checkbox" readOnly checked={selectedTeacherIds.includes(teacher.id)} />
//             <div style={{ width: 24, height: 24, borderRadius: "50%", background: teacher.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--text-inverse)", fontWeight: 600 }}>
//               {teacher.initials}
//             </div>
//             <div style={{ flex: 1 }}>
//               <div style={{ fontSize: 12 }}>{teacher.name}</div>
//               <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{teacher.subjects.join(", ")}</div>
//             </div>
//           </button>
//         ))}
//       </div>
//       <ModalActions
//         onClose={onClose}
//         onSave={() => {
//           assignTeachersToYear({ yearId: yearGroupId, teacherIds: selectedTeacherIds });
//           onClose();
//         }}
//         saveLabel="Save assignments"
//       />
//     </>
//   );
// }

// function EnrolStudentsModal({ onClose, yearGroupId }) {
//   const { yearGroups, students, enrolStudentsToYear } = useSchoolData();
//   const yearGroup = yearGroups.find((candidate) => candidate.id === yearGroupId);
//   const [search, setSearch] = useState("");
//   const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>(
//     students.filter((student) => student.year === yearGroupId).map((student) => student.id),
//   );

//   const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(search.trim().toLowerCase()));

//   const toggleStudent = (studentId: number) => {
//     setSelectedStudentIds((current) =>
//       current.includes(studentId)
//         ? current.filter((id) => id !== studentId)
//         : [...current, studentId],
//     );
//   };

//   return (
//     <>
//       <div className="modal-title">Move students into {yearGroup?.name || "year group"}</div>
//       <label>Search</label>
//       <input type="text" placeholder="Search by name..." value={search} onChange={(event) => setSearch(event.target.value)} />
//       <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 10 }}>
//         Selected students will be assigned to this year group.
//       </div>
//       <div style={{ marginTop: 8, maxHeight: 220, overflowY: "auto" }}>
//         {filteredStudents.map((student) => (
//           <button
//             key={student.id}
//             type="button"
//             onClick={() => toggleStudent(student.id)}
//             style={{
//               width: "100%",
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//               padding: "6px 0",
//               border: "none",
//               background: "transparent",
//               borderBottom: "0.5px solid var(--border-light)",
//               textAlign: "left",
//             }}
//           >
//             <input type="checkbox" readOnly checked={selectedStudentIds.includes(student.id)} />
//             <div style={{ width: 20, height: 20, borderRadius: "50%", background: student.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "var(--text-inverse)", fontWeight: 600 }}>
//               {student.initials}
//             </div>
//             <span style={{ flex: 1, fontSize: 12 }}>{student.name}</span>
//             <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>Currently {student.year}</span>
//           </button>
//         ))}
//       </div>
//       <ModalActions
//         onClose={onClose}
//         onSave={() => {
//           enrolStudentsToYear({ yearId: yearGroupId, studentIds: selectedStudentIds });
//           onClose();
//         }}
//         saveLabel="Save enrolment"
//       />
//     </>
//   );
// }

// function AccountModal({ onClose, accountType }) {
//   const { yearGroups, subjectOptions, addTeacher, addStudent } = useSchoolData();
//   const isTeacher = accountType === "teacher";
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
//   const [selectedYears, setSelectedYears] = useState<number[]>([]);
//   const [yearId, setYearId] = useState(yearGroups[0]?.id || 1);
//   const [feeTotal, setFeeTotal] = useState("3000");
//   const [error, setError] = useState("");

//   const toggleValue = (value: any, setter: any) => {
//     setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
//   };

//   const handleSave = () => {
//     if (!name.trim() || !email.trim()) {
//       setError("Add a name and email before creating the account.");
//       return;
//     }

//     if (isTeacher) {
//       if (!selectedSubjects.length || !selectedYears.length) {
//         setError("Choose at least one subject and one year group for the teacher.");
//         return;
//       }

//       addTeacher({
//         name: name.trim(),
//         email: email.trim(),
//         subjects: selectedSubjects,
//         years: selectedYears,
//       });
//     } else {
//       addStudent({
//         name: name.trim(),
//         email: email.trim(),
//         year: Number(yearId),
//         feeTotal: Number(feeTotal) || 0,
//       });
//     }

//     onClose();
//   };

//   return (
//     <>
//       <div className="modal-title">Add {isTeacher ? "teacher" : "student"}</div>
//       <label>Full name</label>
//       <input type="text" placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} />
//       <label>Email address</label>
//       <input type="text" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
//       {isTeacher ? (
//         <>
//           <label>Subjects</label>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
//             {subjectOptions.map((subject) => (
//               <ToggleChip key={subject} active={selectedSubjects.includes(subject)} onClick={() => toggleValue(subject, setSelectedSubjects)}>
//                 {subject}
//               </ToggleChip>
//             ))}
//           </div>
//           <label>Assign to year groups</label>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
//             {yearGroups.map((yearGroup) => (
//               <ToggleChip key={yearGroup.id} active={selectedYears.includes(yearGroup.id)} onClick={() => toggleValue(yearGroup.id, setSelectedYears)}>
//                 {yearGroup.name}
//               </ToggleChip>
//             ))}
//           </div>
//         </>
//       ) : (
//         <>
//           <label>Enrol into year group</label>
//           <select value={yearId} onChange={(event) => setYearId(Number(event.target.value))}>
//             {yearGroups.map((yearGroup) => <option key={yearGroup.id} value={yearGroup.id}>{yearGroup.name}</option>)}
//           </select>
//           <label>Fee plan (GHS)</label>
//           <input type="number" placeholder="e.g. 3200" min={0} value={feeTotal} onChange={(event) => setFeeTotal(event.target.value)} />
//         </>
//       )}
//       <ModalError message={error} />
//       <ModalActions onClose={onClose} onSave={handleSave} saveLabel="Create account" />
//     </>
//   );
// }

// function UploadModal({ onClose }) {
//   const { user } = useAuth();
//   const { teachers, yearGroups, subjectOptions, addPublication } = useSchoolData();
//   const currentTeacher = teachers.find((teacher) => teacher.email === user?.email) || teachers[0];
//   const [name, setName] = useState("");
//   const [year, setYear] = useState(yearGroups[0]?.name || "");
//   const [subject, setSubject] = useState(subjectOptions[0] || "English");
//   const [visibility, setVisibility] = useState("Draft");
//   const [error, setError] = useState("");

//   const handleSave = () => {
//     if (!name.trim()) {
//       setError("Give the learning material a name before uploading.");
//       return;
//     }

//     addPublication({
//       name: name.trim(),
//       year,
//       subject,
//       published: visibility === "Published",
//       teacherId: currentTeacher?.id,
//     });
//     onClose();
//   };

//   return (
//     <>
//       <div className="modal-title">Upload material</div>
//       <label>File name</label>
//       <input type="text" placeholder="e.g. Week 5 notes.pdf" value={name} onChange={(event) => setName(event.target.value)} />
//       <label>Year group</label>
//       <select value={year} onChange={(event) => setYear(event.target.value)}>
//         {yearGroups.map((yearGroup) => <option key={yearGroup.id} value={yearGroup.name}>{yearGroup.name}</option>)}
//       </select>
//       <label>Subject</label>
//       <select value={subject} onChange={(event) => setSubject(event.target.value)}>
//         {subjectOptions.map((entry) => <option key={entry}>{entry}</option>)}
//       </select>
//       <label>Visibility</label>
//       <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
//         <option>Draft</option>
//         <option>Published</option>
//       </select>
//       <ModalError message={error} />
//       <ModalActions onClose={onClose} onSave={handleSave} saveLabel="Upload" />
//     </>
//   );
// }

// function AttendanceModal({ onClose, yearGroupId }) {
//   const { yearGroups, students, saveAttendance } = useSchoolData();
//   const currentYearId = yearGroupId || yearGroups[0]?.id;
//   const yearGroup = yearGroups.find((candidate) => candidate.id === currentYearId);
//   const yearStudents = students.filter((student) => student.year === currentYearId);
//   const [statusesByStudent, setStatusesByStudent] = useState<Record<string, string>>(
//     yearStudents.reduce((all, student) => {
//       all[student.id] = "P";
//       return all;
//     }, {}),
//   );

//   return (
//     <>
//       <div className="modal-title">Mark attendance</div>
//       <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 8 }}>{yearGroup?.name}</div>
//       {yearStudents.map((student) => (
//         <div key={student.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "0.5px solid var(--border-light)" }}>
//           <div style={{ width: 22, height: 22, borderRadius: "50%", background: student.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "var(--text-inverse)", fontWeight: 600 }}>
//             {student.initials}
//           </div>
//           <span style={{ flex: 1, fontSize: 12 }}>{student.name}</span>
//           <select
//             style={{ fontSize: 11, padding: "3px 6px", border: "0.5px solid var(--border-mid)", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
//             value={statusesByStudent[student.id] || "P"}
//             onChange={(event) => setStatusesByStudent((current) => ({ ...current, [student.id]: event.target.value }))}
//           >
//             <option value="P">Present</option>
//             <option value="A">Absent</option>
//             <option value="T">Late</option>
//           </select>
//         </div>
//       ))}
//       <ModalActions
//         onClose={onClose}
//         onSave={() => {
//           saveAttendance({ yearId: currentYearId, statusesByStudent });
//           onClose();
//         }}
//         saveLabel="Save attendance"
//       />
//     </>
//   );
// }

// function FeeStructureModal({ onClose }) {
//   const { yearGroups, feeStructures, saveFeeStructures } = useSchoolData();
//   const [amounts, setAmounts] = useState<Record<string, string>>(
//     yearGroups.reduce((all, yearGroup) => {
//       all[yearGroup.id] = String(feeStructures[String(yearGroup.id)] || feeStructures[yearGroup.id] || 0);
//       return all;
//     }, {}),
//   );

//   return (
//     <>
//       <div className="modal-title">Set fee structure (GHS)</div>
//       {yearGroups.map((yearGroup) => (
//         <div key={yearGroup.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "0.5px solid var(--border-light)" }}>
//           <span style={{ fontSize: 12, flex: 1 }}>{yearGroup.name}</span>
//           <input
//             type="number"
//             placeholder="Amount"
//             style={{ width: 120, fontSize: 11, padding: "3px 7px" }}
//             min={0}
//             value={amounts[yearGroup.id] || ""}
//             onChange={(event) => setAmounts((current) => ({ ...current, [yearGroup.id]: event.target.value }))}
//           />
//         </div>
//       ))}
//       <ModalActions
//         onClose={onClose}
//         onSave={() => {
//           saveFeeStructures(
//             Object.entries(amounts).reduce((all, [yearId, amount]) => {
//               all[yearId] = Number(amount) || 0;
//               return all;
//             }, {}),
//           );
//           onClose();
//         }}
//         saveLabel="Save structure"
//       />
//     </>
//   );
// }

// function TimetableEditModal({ onClose, initialData }) {
//   const { yearGroups, subjectOptions, teachers, saveTimetableSlot } = useSchoolData();
//   const [yearId, setYearId] = useState(Number(initialData?.yearId || yearGroups[0]?.id || 1));
//   const [day, setDay] = useState(initialData?.day || DAYS[0]);
//   const [periodIndex, setPeriodIndex] = useState(Number(initialData?.periodIndex ?? 0));
//   const [subject, setSubject] = useState(initialData?.subject || subjectOptions[0] || "English");
//   const [teacherId, setTeacherId] = useState(String(initialData?.teacherId || teachers[0]?.id || ""));

//   return (
//     <>
//       <div className="modal-title">Edit timetable slot</div>
//       <label>Year group</label>
//       <select value={yearId} onChange={(event) => setYearId(Number(event.target.value))}>
//         {yearGroups.map((yearGroup) => <option key={yearGroup.id} value={yearGroup.id}>{yearGroup.name}</option>)}
//       </select>
//       <label>Day</label>
//       <select value={day} onChange={(event) => setDay(event.target.value)}>
//         {DAYS.map((entry) => <option key={entry}>{entry}</option>)}
//       </select>
//       <label>Period</label>
//       <select value={periodIndex} onChange={(event) => setPeriodIndex(Number(event.target.value))}>
//         {PERIOD_OPTIONS.map((period, index) => <option key={period.label} value={index}>{period.label} ({period.time})</option>)}
//       </select>
//       <label>Subject</label>
//       <select value={subject} onChange={(event) => setSubject(event.target.value)}>
//         {subjectOptions.map((entry) => <option key={entry}>{entry}</option>)}
//       </select>
//       <label>Assign teacher</label>
//       <select value={teacherId} onChange={(event) => setTeacherId(event.target.value)}>
//         {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
//       </select>
//       <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 10 }}>
//         The current frontend demo saves the timetable subject for this slot and keeps teacher selection available for planning.
//       </div>
//       <ModalActions
//         onClose={onClose}
//         onSave={() => {
//           saveTimetableSlot({ yearId, day, periodIndex, subject, teacherId: Number(teacherId) });
//           onClose();
//         }}
//         saveLabel="Save slot"
//       />
//     </>
//   );
// }

// function GradeModal({ onClose, initialData }) {
//   const { user } = useAuth();
//   const { teachers, students, yearGroups, subjectOptions, saveGrade } = useSchoolData();
//   const currentTeacher = teachers.find((teacher) => teacher.email === user?.email) || teachers[0];
//   const [yearId, setYearId] = useState(Number(initialData?.yearId || currentTeacher?.years?.[0] || yearGroups[0]?.id || 1));
//   const yearStudents = students.filter((student) => student.year === yearId);
//   const [studentId, setStudentId] = useState(Number(initialData?.studentId || yearStudents[0]?.id || students[0]?.id || 1));
//   const [subject, setSubject] = useState(initialData?.subject || currentTeacher?.subjects?.[0] || subjectOptions[0] || "English");
//   const [midTerm, setMidTerm] = useState(String(initialData?.midTerm || 70));
//   const [assignmentAvg, setAssignmentAvg] = useState(String(initialData?.assignmentAvg || 70));
//   const [comment, setComment] = useState(initialData?.comment || "");
//   const [error, setError] = useState("");

//   const visibleStudents = students.filter((student) => student.year === yearId);

//   const handleSave = () => {
//     if (!studentId || !subject) {
//       setError("Choose a student and subject before saving the grade.");
//       return;
//     }

//     saveGrade({
//       studentId,
//       subject,
//       midTerm,
//       assignmentAvg,
//       teacher: currentTeacher?.name || user?.name || "Teacher",
//       comment,
//     });
//     onClose();
//   };

//   return (
//     <>
//       <div className="modal-title">Add or update grades</div>
//       <label>Year group</label>
//       <select
//         value={yearId}
//         onChange={(event) => {
//           const nextYearId = Number(event.target.value);
//           const nextStudents = students.filter((student) => student.year === nextYearId);
//           setYearId(nextYearId);
//           setStudentId(nextStudents[0]?.id || 0);
//         }}
//       >
//         {yearGroups.map((yearGroup) => <option key={yearGroup.id} value={yearGroup.id}>{yearGroup.name}</option>)}
//       </select>
//       <label>Student</label>
//       <select value={studentId} onChange={(event) => setStudentId(Number(event.target.value))}>
//         {visibleStudents.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
//       </select>
//       <label>Subject</label>
//       <select value={subject} onChange={(event) => setSubject(event.target.value)}>
//         {subjectOptions.map((entry) => <option key={entry}>{entry}</option>)}
//       </select>
//       <label>Mid-term score (%)</label>
//       <input type="number" placeholder="0–100" min={0} max={100} value={midTerm} onChange={(event) => setMidTerm(event.target.value)} />
//       <label>Assignment average (%)</label>
//       <input type="number" placeholder="0–100" min={0} max={100} value={assignmentAvg} onChange={(event) => setAssignmentAvg(event.target.value)} />
//       <label>Teacher's comment</label>
//       <input type="text" placeholder="Optional remark" value={comment} onChange={(event) => setComment(event.target.value)} />
//       <ModalError message={error} />
//       <ModalActions onClose={onClose} onSave={handleSave} saveLabel="Save grade" />
//     </>
//   );
// }
