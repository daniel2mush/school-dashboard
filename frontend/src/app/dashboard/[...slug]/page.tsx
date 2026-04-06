"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar/Sidebar";
import { getDashboardHref, getSectionLabel } from "@/constants/navigation";
import useUserStore from "@/store/UserStore";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Dashboard.module.scss";
import Loading from "@/components/Loading/Loading";
import { useEffect } from "react";
import { User } from "@/types/Types";
import {
  AdminAnalytics,
  AdminAttendance,
  AdminAnnouncements,
  AdminFees,
  AdminOverview,
  AdminTimetable,
  AdminUsers,
  AdminYearGroups,
} from "@/components/dashboard/views/Admin";
import {
  StudentAttendance,
  StudentDashboard,
  StudentFeesStatus,
  StudentReportCard,
  StudentSubjects,
  StudentTimetable,
} from "@/components/dashboard/views/Student";
import {
  TeachAnnouncements,
  TeachAttendance,
  TeachGrading,
  TeachMyYearGroups,
  TeachSubjectsContent,
} from "@/components/dashboard/views/Teach";
import AdminCurriculum from "@/components/dashboard/views/Admin/AdminCurriculum";

const VIEW_MAP: Record<User["role"], Record<string, React.ReactNode>> = {
  ADMIN: {
    overview: <AdminOverview />,
    yeargroups: <AdminYearGroups />,
    users: <AdminUsers />,
    fees: <AdminFees />,
    timetable: <AdminTimetable />,
    announcements: <AdminAnnouncements />,
    analytics: <AdminAnalytics />,
    attendance: <AdminAttendance />,
    curriculum: <AdminCurriculum />,
  },
  TEACHER: {
    tmy: <TeachMyYearGroups />,
    tsubjects: <TeachSubjectsContent />,
    tgrades: <TeachGrading />,
    tattend: <TeachAttendance />,
    tann: <TeachAnnouncements />,
  },
  STUDENT: {
    sdash: <StudentDashboard />,
    ssubjects: <StudentSubjects />,
    sreport: <StudentReportCard />,
    satt: <StudentAttendance />,
    stimetable: <StudentTimetable />,
    sfees: <StudentFeesStatus />,
  },
};

export default function DashboardRolePage() {
  const userStore = useUserStore();
  const pathName = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const sectionPath = pathName.split("/")[2];

  const { user } = userStore;

  useEffect(() => {
    if (user && !sectionPath) {
      router.replace(getDashboardHref(user.role));
    } else if (!user) {
      router.replace("/login");
    }
  }, [user, sectionPath, router]);

  async function logout() {
    userStore.clearUser();
    // Use window.location to force a full reload and clear any state
    window.location.href = "/login";
  }

  if (!user || !sectionPath) {
    return <Loading />;
  }
  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <DashboardHeader
            role={user.role}
            sectionLabel={getSectionLabel(user.role, sectionPath)}
            user={user}
            isDark={isDark}
            onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
            onLogout={() => {
              logout();
            }}
          />
          <section className={styles.content}>
            {VIEW_MAP[user.role][sectionPath]}
          </section>
        </main>
      </div>

      {/* {modal && <Modal modal={modal} onClose={() => setModal(null)} />} */}
    </div>
  );
}
