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
  dateOfBirth: string; // ISO Date string
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
}

// If this is part of your login response, you can use a wrapper type like this:
export interface UserResponse {
  data: User;
}

export interface Subject {
  id: number;
  name: string;
  description: string | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  _count: { yearGroups: number; grades: number; timetable: number };
}
