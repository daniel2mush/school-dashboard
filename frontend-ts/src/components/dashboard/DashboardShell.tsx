// "use client";

// import { useEffect, useState } from "react";
// import { useNavigate } from "@tanstack/react-router";
// import type { ComponentType } from "react";
// import useUserStore from "@/store/UserStore";

// import Sidebar from "../Sidebar";
// import Modal from "../Modal";
// import DashboardHeader from "./DashboardHeader";
// import {
//   getDashboardHref,
//   getSectionLabel,
//   ROLE_DEFAULT_PAGE,
//   type AppRole,
// } from "../../constants/navigation";

// import {
//   Overview,
//   YearGroups,
//   UsersPage,
//   FeesPage,
//   TimetablePage,
//   AnnouncementsPage,
//   AnalyticsPage,
// } from "../../views/principal";
// import {
//   TeacherYears,
//   TeacherSubjects,
//   GradingPage,
//   AttendancePage,
//   TeacherAnnouncements,
// } from "../../views/teacher";
// import {
//   StudentDash,
//   StudentSubjects,
//   ReportCard,
//   StudentAttendance,
//   StudentTimetable,
//   StudentFees,
// } from "../../views/student";

// type DashboardShellProps = {
//   role: AppRole;
//   section: string;
// };

// type ModalState = {
//   type: string;
//   data?: unknown;
// } | null;

// const VIEW_MAP: Record<AppRole, Record<string, ComponentType<any>>> = {
//   principal: {
//     overview: Overview,
//     yeargroups: YearGroups,
//     users: UsersPage,
//     fees: FeesPage,
//     timetable: TimetablePage,
//     announcements: AnnouncementsPage,
//     analytics: AnalyticsPage,
//   },
//   teacher: {
//     tmy: TeacherYears,
//     tsubjects: TeacherSubjects,
//     tgrades: GradingPage,
//     tattend: AttendancePage,
//     tann: TeacherAnnouncements,
//   },
//   student: {
//     sdash: StudentDash,
//     ssubjects: StudentSubjects,
//     sreport: ReportCard,
//     satt: StudentAttendance,
//     stimetable: StudentTimetable,
//     sfees: StudentFees,
//   },
// };

// export default function DashboardShell() {

//   const { user, clearUser: logout } = useUserStore();
//   const { theme, setTheme } = useTheme();

//   const [modal, setModal] = useState<ModalState>(null);

//   const toggleTheme = () => {
//     setTheme(theme === "light" ? "dark" : "light");
//   };

//   const PageComponent =
//     VIEW_MAP[role][section] ?? VIEW_MAP[role][ROLE_DEFAULT_PAGE[role]];

//   return (
//     <div className="dashboard-shell">
//       <div className="dashboard-layout">
//         <Sidebar currentSection={""} user={user} />
//         <main className="dashboard-main">
//           <DashboardHeader

//             user={user}
//             onLogout={() => {
//               logout();
//               router.replace("/login");
//             }}
//           />

{
  /* <PageComponent
            onNavigate={(targetSection: string) =>
              router.push(getDashboardHref(role, targetSection))
            }
            onOpenModal={setModal}
          /> */
}
//         </main>
//       </div>

//       {/* {modal && <Modal modal={modal} onClose={() => setModal(null)} />} */}
//     </div>
//   );
// }
