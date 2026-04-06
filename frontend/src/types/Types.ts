// Define specific union types for better strictness and autocomplete
export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";
export type UserStatus = "Active" | "Inactive" | "Suspended";
export type Gender = "Male" | "Female" | "Other";

export interface User {
  id: number;
  email: string;
  name: string;
  initials: string | null;
  gender: Gender; // Or just 'string' if you don't want to be strict
  dateOfBirth: string | null; // ISO Date string
  phoneNumber: string | null;
  address: string | null;
  avatarUrl: string | null;
  specialization: string | null;
  enrollmentDate: string; // ISO Date string
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  enrolledYearGroupId: number | null;

  // Relationships (Enriched from backend)
  enrolledYearGroup?: YearGroup;
  grades?: Grade[];
  attendance?: Attendance[];
}

export interface YearGroup {
  id: number;
  name: string;
  level: "Primary" | "JuniorSecondary" | "SeniorSecondary" | "University";
  roomNumber?: string | null;
  capacity?: number | null;
  subjects?: Subject[];
  teachers?: Pick<User, "id" | "name" | "email" | "specialization">[];
  timetables?: Timetable[];
  fees?: Fee[];
  students?: User[];
}

export interface Subject {
  id: number;
  name: string;
  description?: string | null;
  yearGroups?: Pick<YearGroup, "id" | "name" | "level">[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Grade {
  id: number;
  score: number;
  grade: string;
  subject?: Subject;
  teacher?: User;
  date: string;
}

export interface Attendance {
  id: number;
  status: "P" | "A" | "T" | "H";
  date: string;
}

export interface Fee {
  id: number;
  title: string;
  description?: string | null;
  amount: number;
  yearGroupId: number;
  payments?: FeePayment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FeePayment {
  id: number;
  feeId: number;
  studentId: number;
  amountPaid: number;
  amountInWords?: string | null;
  isFullyPaid: boolean;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  student?: Pick<User, "id" | "name" | "email">;
}

// If this is part of your login response, you can use a wrapper type like this:
export interface UserResponse {
  data: User;
}

//LoginResponse

// {
//   "success": true,
//   "message": "User login successful",
//   "data": {
//     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJTVFVERU5UIiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJuYW1lIjoiQWRtaW4iLCJpYXQiOjE3NzUyOTA5MzcsImV4cCI6MTc3NTI5MTgzN30.fMuTOHPIULwN7KJ5yHD8OT2h-h3JyMX12YZPm9ihXSs",
//     "user": {
//       "id": 1,
//       "role": "STUDENT",
//       "email": "admin@gmail.com",
//       "name": "Admin"
//     }
//   }
// }

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
}

export interface LoginResponseData {
  accessToken: string;
  user: User;
}

export interface Timetable {
  id: number;
  day: string;
  yearGroupId: number;
  periodId: number;
  subjectId: number | null;
  teacherId?: number | null;
  period: Period;
  subject: Subject | null;
  teacher?: Pick<User, "id" | "name" | "email" | "specialization"> | null;
}

export interface Period {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: "Normal" | "Important" | "Urgent";
  authorId: number;
  targetType: "ALL" | "YEAR_GROUP" | "TEACHERS_ONLY";
  targetYearGroupId: number | null;
  createdAt: string;
  author?: { name: string; role: string };
}
