export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "principal" | "teacher" | "student";
  classId?: string;
  class?: {
    id: string;
    name: string;
    level: string;
  };
}
