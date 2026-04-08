import { isRole, type AppRole } from "../constants/navigation";

export type DemoUser = {
  id: string;
  role: AppRole;
  email: string;
  password: string;
  name: string;
  initials: string;
  subtitle: string;
  color: string;
};

export type AuthUser = Omit<DemoUser, "password">;

export const AUTH_STORAGE_KEY = "sunridge-auth-session";
export const DEMO_PASSWORD = "sunridge123";

export const DEMO_USERS: DemoUser[] = [
  {
    id: "principal-demo",
    role: "principal",
    email: "principal@sunridge.academy",
    password: DEMO_PASSWORD,
    name: "Principal Mensah",
    initials: "PM",
    subtitle: "Super Admin · Ghana",
    color: "var(--accent)",
  },
  {
    id: "teacher-demo",
    role: "teacher",
    email: "k.mensah@sunridge.edu",
    password: DEMO_PASSWORD,
    name: "Mr. Kofi Mensah",
    initials: "KM",
    subtitle: "Mathematics · Year 1, 2, 5 & 6",
    color: "var(--green)",
  },
  {
    id: "student-demo",
    role: "student",
    email: "ama.o@student.edu",
    password: DEMO_PASSWORD,
    name: "Ama Owusu",
    initials: "AO",
    subtitle: "Year 1 · Primary",
    color: "var(--red)",
  },
];

export function sanitizeUser(user: DemoUser): AuthUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

export function authenticateDemoUser(email: string, password: string) {
  const match = DEMO_USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
  );

  if (!match) {
    return null;
  }

  return sanitizeUser(match);
}

export function getDemoUserByRole(role: AppRole) {
  const user = DEMO_USERS.find((candidate) => candidate.role === role);
  return user ? sanitizeUser(user) : null;
}

export function parseStoredSession(raw: string | null) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.initials !== "string" ||
      typeof parsed.subtitle !== "string" ||
      typeof parsed.color !== "string" ||
      typeof parsed.role !== "string" ||
      !isRole(parsed.role)
    ) {
      return null;
    }

    return parsed as AuthUser;
  } catch {
    return null;
  }
}
