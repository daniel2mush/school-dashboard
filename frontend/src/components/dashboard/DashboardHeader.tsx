"use client";

import { Avatar, Badge } from "../ui";
import { ROLE_LABELS, type AppRole } from "../../constants/navigation";
import { SCHOOL } from "../../data/mockData";
import type { AuthUser } from "../../lib/demoAuth";
import { useSchoolData } from "../../providers/SchoolDataProvider";

type DashboardHeaderProps = {
  role: AppRole;
  sectionLabel: string;
  user: AuthUser;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
};

const ROLE_BADGE_VARIANT: Record<AppRole, string> = {
  principal: "blue",
  teacher: "green",
  student: "amber",
};

export default function DashboardHeader({
  role,
  sectionLabel,
  user,
  isDark,
  onToggleTheme,
  onLogout,
}: DashboardHeaderProps) {
  const { resetDemoData } = useSchoolData();

  return (
    <header className="dashboard-topbar">
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Badge variant={ROLE_BADGE_VARIANT[role]}>{ROLE_LABELS[role]}</Badge>
          <Badge variant="gray">{SCHOOL.term}</Badge>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem, 2.5vw, 2.5rem)", lineHeight: 1.05, marginTop: 12 }}>{sectionLabel}</h1>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
          Signed in as {user.name} and browsing the {ROLE_LABELS[role].toLowerCase()} workspace.
        </div>
      </div>

      <div className="dashboard-topbar-actions">
        <div className="dashboard-user-pill">
          <Avatar initials={user.initials} color={user.color} size={40} fontSize={14} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.subtitle}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn"
          onClick={onToggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? "Dark" : "Light"}
        </button>

        <button type="button" className="btn" onClick={resetDemoData}>
          Reset demo data
        </button>

        <button type="button" className="btn" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
