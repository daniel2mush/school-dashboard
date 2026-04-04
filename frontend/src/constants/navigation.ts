export type AppRole = "principal" | "teacher" | "student";

export type NavGroupLabel = {
  section: string;
};

export type NavPageItem = {
  id: string;
  label: string;
  icon: string;
};

export type NavItem = NavGroupLabel | NavPageItem;

export const ROLE_LABELS: Record<AppRole, string> = {
  principal: "Principal",
  teacher: "Teacher",
  student: "Student",
};

export const ROLE_DEFAULT_PAGE: Record<AppRole, string> = {
  principal: "overview",
  teacher: "tmy",
  student: "sdash",
};

export const NAV_CONFIG: Record<AppRole, NavItem[]> = {
  principal: [
    { section: "Platform" },
    { id: "overview", label: "Overview", icon: "◉" },
    { id: "yeargroups", label: "Year Groups", icon: "◫" },
    { id: "users", label: "Staff & Students", icon: "◎" },
    { id: "fees", label: "Fee Management", icon: "◈" },
    { section: "School" },
    { id: "timetable", label: "Timetable", icon: "▦" },
    { id: "announcements", label: "Announcements", icon: "◬" },
    { id: "analytics", label: "Analytics", icon: "◑" },
  ],
  teacher: [
    { section: "My Classes" },
    { id: "tmy", label: "My Year Groups", icon: "◫" },
    { id: "tsubjects", label: "Subjects & Content", icon: "◎" },
    { id: "tgrades", label: "Grading", icon: "◑" },
    { id: "tattend", label: "Attendance", icon: "◈" },
    { section: "Communication" },
    { id: "tann", label: "Announcements", icon: "◬" },
  ],
  student: [
    { section: "My School" },
    { id: "sdash", label: "Dashboard", icon: "◉" },
    { id: "ssubjects", label: "My Subjects", icon: "◫" },
    { id: "sreport", label: "Report Card", icon: "◑" },
    { id: "satt", label: "Attendance", icon: "◈" },
    { id: "stimetable", label: "Timetable", icon: "▦" },
    { id: "sfees", label: "Fee Status", icon: "◈" },
  ],
};

export function isRole(value: string): value is AppRole {
  return value in NAV_CONFIG;
}

export function isNavPageItem(item: NavItem): item is NavPageItem {
  return "id" in item;
}

export function getRolePages(role: AppRole): NavPageItem[] {
  return NAV_CONFIG[role].filter(isNavPageItem);
}

export function isValidSection(role: AppRole, section: string) {
  return getRolePages(role).some((item) => item.id === section);
}

export function getSectionLabel(role: AppRole, section: string) {
  return (
    getRolePages(role).find((item) => item.id === section)?.label ?? "Dashboard"
  );
}

export function getDashboardHref(
  role: AppRole,
  section = ROLE_DEFAULT_PAGE[role],
) {
  return `/dashboard/${section}`;
}
