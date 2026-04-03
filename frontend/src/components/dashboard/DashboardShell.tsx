"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import Sidebar from "../Sidebar";
import Modal from "../Modal";
import DashboardHeader from "./DashboardHeader";
import {
  getDashboardHref,
  getSectionLabel,
  ROLE_DEFAULT_PAGE,
  type AppRole,
} from "../../constants/navigation";
import { useAuth } from "../../providers/AuthProvider";

import {
  Overview,
  YearGroups,
  UsersPage,
  FeesPage,
  TimetablePage,
  AnnouncementsPage,
  AnalyticsPage,
} from "../../views/principal";
import {
  TeacherYears,
  TeacherSubjects,
  GradingPage,
  AttendancePage,
  TeacherAnnouncements,
} from "../../views/teacher";
import {
  StudentDash,
  StudentSubjects,
  ReportCard,
  StudentAttendance,
  StudentTimetable,
  StudentFees,
} from "../../views/student";

type DashboardShellProps = {
  role: AppRole;
  section: string;
};

type ModalState = {
  type: string;
  data?: unknown;
} | null;

const VIEW_MAP: Record<AppRole, Record<string, ComponentType<any>>> = {
  principal: {
    overview: Overview,
    yeargroups: YearGroups,
    users: UsersPage,
    fees: FeesPage,
    timetable: TimetablePage,
    announcements: AnnouncementsPage,
    analytics: AnalyticsPage,
  },
  teacher: {
    tmy: TeacherYears,
    tsubjects: TeacherSubjects,
    tgrades: GradingPage,
    tattend: AttendancePage,
    tann: TeacherAnnouncements,
  },
  student: {
    sdash: StudentDash,
    ssubjects: StudentSubjects,
    sreport: ReportCard,
    satt: StudentAttendance,
    stimetable: StudentTimetable,
    sfees: StudentFees,
  },
};

export default function DashboardShell({ role, section }: DashboardShellProps) {
  /* TODO: Make the principal able to add subjects and remove subjects */

  const router = useRouter();
  const { user, isReady, logout } = useAuth();
  const [modal, setModal] = useState<ModalState>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== role) {
      router.replace(getDashboardHref(user.role, ROLE_DEFAULT_PAGE[user.role]));
    }
  }, [isReady, role, router, user]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  };

  if (!isReady || !user || user.role !== role) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Loading workspace
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, marginTop: 8 }}>
            Bringing your dashboard online
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 8,
            }}
          >
            Checking your session and matching you to the right dashboard.
          </div>
        </div>
      </div>
    );
  }

  const PageComponent =
    VIEW_MAP[role][section] ?? VIEW_MAP[role][ROLE_DEFAULT_PAGE[role]];

  return (
    <div className="dashboard-shell">
      <div className="dashboard-layout">
        <Sidebar role={role} currentSection={section} user={user} />
        <main className="dashboard-main">
          <DashboardHeader
            role={role}
            sectionLabel={getSectionLabel(role, section)}
            user={user}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onLogout={() => {
              logout();
              router.replace("/login");
            }}
          />

          <PageComponent
            onNavigate={(targetSection: string) =>
              router.push(getDashboardHref(role, targetSection))
            }
            onOpenModal={setModal}
          />
        </main>
      </div>

      {modal && <Modal modal={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
