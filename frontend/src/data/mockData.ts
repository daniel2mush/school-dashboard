// ============================================================
// data/mockData.js
// Central data store for the Sunridge Academy prototype.
// DEVELOPER NOTE: Replace each export with your real API calls
// or React Query / SWR hooks. The shape of each object is the
// contract your backend should match.
// ============================================================

export const SCHOOL = {
  name: "Sunridge Academy",
  term: "Term 2 · 2025",
  country: "Ghana",
  currency: "GHS",
};

// ── Year Groups ──────────────────────────────────────────────
// Each year group is a "section" of the school.
// Principal creates these and assigns teachers + students.
export const YEAR_GROUPS = [
  {
    id: 1,
    name: "Year 1",
    level: "Primary",
    students: 42,
    color: "var(--accent-text)",
    bg: "var(--accent-bg)",
    subjects: ["English", "Mathematics", "Science", "Social Studies", "ICT"],
  },
  {
    id: 2,
    name: "Year 2",
    level: "Primary",
    students: 38,
    color: "var(--green-text)",
    bg: "var(--green-bg)",
    subjects: ["English", "Mathematics", "Science", "Social Studies", "French", "ICT"],
  },
  {
    id: 3,
    name: "Year 3",
    level: "Junior Secondary",
    students: 35,
    color: "var(--amber-text)",
    bg: "var(--amber-bg)",
    subjects: ["English", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography"],
  },
  {
    id: 4,
    name: "Year 4",
    level: "Junior Secondary",
    students: 33,
    color: "var(--red-text)",
    bg: "var(--red-bg)",
    subjects: ["English", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Economics"],
  },
  {
    id: 5,
    name: "Year 5",
    level: "Senior Secondary",
    students: 28,
    color: "var(--purple-text)",
    bg: "var(--purple-bg)",
    subjects: ["English", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Literature"],
  },
  {
    id: 6,
    name: "Year 6",
    level: "Senior Secondary",
    students: 24,
    color: "var(--green-text)",
    bg: "var(--green-bg)",
    subjects: ["English", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Literature"],
  },
];

// ── Teachers ─────────────────────────────────────────────────
// years[] = array of year group IDs this teacher is assigned to
export const TEACHERS = [
  {
    id: 1,
    name: "Mr. Kofi Mensah",
    initials: "KM",
    color: "var(--accent-text)",
    subjects: ["Mathematics", "Physics"],
    years: [1, 2, 5, 6],
    email: "k.mensah@sunridge.edu",
    status: "Active",
  },
  {
    id: 2,
    name: "Mrs. Abena Asante",
    initials: "AA",
    color: "var(--green-text)",
    subjects: ["English", "Literature"],
    years: [1, 2, 3, 4],
    email: "a.asante@sunridge.edu",
    status: "Active",
  },
  {
    id: 3,
    name: "Mr. Chukwu Obi",
    initials: "CO",
    color: "var(--amber-text)",
    subjects: ["Chemistry", "Biology"],
    years: [3, 4, 5, 6],
    email: "c.obi@sunridge.edu",
    status: "Active",
  },
  {
    id: 4,
    name: "Ms. Fatima Diallo",
    initials: "FD",
    color: "var(--red-text)",
    subjects: ["History", "Geography", "Social Studies"],
    years: [1, 2, 3, 4],
    email: "f.diallo@sunridge.edu",
    status: "Active",
  },
  {
    id: 5,
    name: "Mr. Sipho Ndlovu",
    initials: "SN",
    color: "var(--purple-text)",
    subjects: ["ICT", "Economics"],
    years: [1, 2, 5, 6],
    email: "s.ndlovu@sunridge.edu",
    status: "Active",
  },
];

// ── Students ─────────────────────────────────────────────────
// year = year group ID the student is enrolled in
export const STUDENTS = [
  { id: 1, name: "Ama Owusu",      initials: "AO", color: "var(--accent-text)", year: 1, email: "ama.o@student.edu",      fees: { total: 2500, paid: 2500 }, att: 92 },
  { id: 2, name: "Kwame Boateng",  initials: "KB", color: "var(--red-text)", year: 1, email: "kwame.b@student.edu",    fees: { total: 2500, paid: 1800 }, att: 88 },
  { id: 3, name: "Chidinma Eze",   initials: "CE", color: "var(--green-text)", year: 2, email: "chidinma.e@student.edu", fees: { total: 2800, paid: 2800 }, att: 96 },
  { id: 4, name: "Tunde Adeyemi",  initials: "TA", color: "var(--amber-text)", year: 3, email: "tunde.a@student.edu",    fees: { total: 3200, paid: 2400 }, att: 79 },
  { id: 5, name: "Zinhle Dlamini", initials: "ZD", color: "var(--purple-text)", year: 5, email: "zinhle.d@student.edu",   fees: { total: 3800, paid: 3800 }, att: 94 },
  { id: 6, name: "Amara Conteh",   initials: "AC", color: "var(--green-text)", year: 6, email: "amara.c@student.edu",    fees: { total: 3800, paid: 1900 }, att: 85 },
  { id: 7, name: "Nkosi Sithole",  initials: "NS", color: "var(--amber-text)", year: 4, email: "nkosi.s@student.edu",    fees: { total: 3200, paid: 3200 }, att: 91 },
  { id: 8, name: "Yemi Okonkwo",   initials: "YO", color: "var(--red-text)", year: 2, email: "yemi.o@student.edu",     fees: { total: 2800, paid: 2100 }, att: 83 },
];

// ── Announcements ─────────────────────────────────────────────
// target: "All" | year group name | "Teachers only"
export const ANNOUNCEMENTS = [
  { id: 1, title: "End of Term Examinations",    body: "Exams begin 14th July. Please review the timetable distributed last week.",                       from: "Principal Mensah",   target: "All",    urgent: true,  date: "Jun 28" },
  { id: 2, title: "Mathematics Olympiad",         body: "Interested Year 5 & 6 students should register with Mr. Ndlovu by Friday.",                        from: "Mr. Sipho Ndlovu",  target: "Year 5", urgent: false, date: "Jun 27" },
  { id: 3, title: "Science Lab Rules Update",     body: "New safety protocols are in effect. All Year 3–6 students must read the updated lab manual.",       from: "Mr. Chukwu Obi",   target: "Year 3", urgent: false, date: "Jun 26" },
  { id: 4, title: "Fee Reminder – Term 2",        body: "Outstanding fees for Term 2 must be cleared by 30th June to avoid disruption to studies.",          from: "Principal Mensah",  target: "All",    urgent: true,  date: "Jun 25" },
];

// ── Publications / Materials ───────────────────────────────────
// published: true = visible to students; false = draft
export const PUBLICATIONS = [
  { id: 1, name: "Year 1 – Algebra Intro.pdf",        year: "Year 1", subject: "Mathematics", published: true,  date: "Jun 25", teacherId: 1 },
  { id: 2, name: "Year 2 – Geometry Notes.pptx",      year: "Year 2", subject: "Mathematics", published: true,  date: "Jun 22", teacherId: 1 },
  { id: 3, name: "Year 5 – Calculus Basics.pdf",      year: "Year 5", subject: "Mathematics", published: false, date: "Jun 20", teacherId: 1 },
  { id: 4, name: "Year 6 – Physics Exam Prep.pdf",    year: "Year 6", subject: "Physics",     published: true,  date: "Jun 18", teacherId: 1 },
  { id: 5, name: "Year 1 – Number Theory Quiz.docx",  year: "Year 1", subject: "Mathematics", published: false, date: "Jun 28", teacherId: 1 },
];

// ── Grades ───────────────────────────────────────────────────
// Keyed by student ID. Each entry is an array of subject results.
export const GRADES = {
  1: [
    { subject: "English",       score: 78, grade: "B+", teacher: "Mrs. Abena Asante" },
    { subject: "Mathematics",   score: 91, grade: "A",  teacher: "Mr. Kofi Mensah" },
    { subject: "Science",       score: 84, grade: "A-", teacher: "Mr. Chukwu Obi" },
    { subject: "Social Studies",score: 72, grade: "B",  teacher: "Ms. Fatima Diallo" },
    { subject: "ICT",           score: 88, grade: "A-", teacher: "Mr. Sipho Ndlovu" },
  ],
};

// ── Attendance log ───────────────────────────────────────────
// Keyed by student ID. P=Present A=Absent T=Late H=Holiday
export const ATTENDANCE = {
  1: ["P","P","P","A","P","P","P","P","H","P","P","T","P","P","P","P","P","P","A","P"],
  2: ["P","P","A","P","P","P","P","P","P","P","P","P","P","A","P","P","P","P","P","P"],
};

// ── Timetable ─────────────────────────────────────────────────
// Keyed by year group ID → day → array of 5 period slots
// Each slot: subject name string or "-" for free
export const TIMETABLE = {
  1: {
    Monday:    ["English",      "Mathematics", "Science",       "Social Studies", "ICT"],
    Tuesday:   ["Mathematics",  "English",     "ICT",           "Science",        "Social Studies"],
    Wednesday: ["Science",      "Social Studies","Mathematics", "English",        "ICT"],
    Thursday:  ["ICT",          "English",     "Social Studies","Mathematics",    "Science"],
    Friday:    ["English",      "Science",     "Mathematics",   "Assembly",       "ICT"],
  },
};

export const PERIODS = [
  { label: "Period 1", time: "7:30 – 8:30" },
  { label: "Period 2", time: "8:30 – 9:30" },
  { label: "Period 3", time: "9:30 – 10:30" },
  { label: "Break",    time: "10:30 – 11:00", isBreak: true },
  { label: "Period 4", time: "11:00 – 12:00" },
  { label: "Period 5", time: "12:00 – 13:00" },
];

// ── Subject colour map ────────────────────────────────────────
export const SUBJECT_COLORS = {
  English:        { bg: "var(--accent-bg)", text: "var(--accent-text)" },
  Mathematics:    { bg: "var(--green-bg)", text: "var(--green-text)" },
  Science:        { bg: "var(--amber-bg)", text: "var(--amber-text)" },
  "Social Studies":{ bg: "var(--red-bg)", text: "var(--red-text)" },
  ICT:            { bg: "var(--purple-bg)", text: "var(--purple-text)" },
  Physics:        { bg: "var(--green-bg)", text: "var(--green-text)" },
  Chemistry:      { bg: "var(--red-bg)", text: "var(--red-text)" },
  Biology:        { bg: "var(--green-bg)", text: "var(--green-text)" },
  History:        { bg: "var(--amber-bg)", text: "var(--amber-text)" },
  Geography:      { bg: "var(--accent-bg)", text: "var(--accent-text)" },
  French:         { bg: "var(--red-bg)", text: "var(--red-text)" },
  Economics:      { bg: "var(--purple-bg)", text: "var(--purple-text)" },
  Literature:     { bg: "var(--red-bg)", text: "var(--red-text)" },
  Assembly:       { bg: "var(--bg-secondary)", text: "var(--text-secondary)" },
};

// ── Helper: grade colour from score ──────────────────────────
export function gradeColor(score) {
  if (score >= 80) return { bg: "var(--green-bg)", text: "var(--green-text)" };
  if (score >= 65) return { bg: "var(--accent-bg)", text: "var(--accent-text)" };
  if (score >= 50) return { bg: "var(--amber-bg)", text: "var(--amber-text)" };
  return { bg: "var(--red-bg)", text: "var(--red-text)" };
}

export function scoreLetter(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B+";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}
