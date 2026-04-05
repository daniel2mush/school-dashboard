"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar/Sidebar";
import { getSectionLabel } from "@/constants/navigation";
import useUserStore from "@/store/UserStore";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

export default function DashboardRolePage() {
  const userStore = useUserStore();
  const pathName = usePathname();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const sectionPath = pathName.split("/")[2];

  const { user } = userStore;

  async function logout() {}

  if (!user) {
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
  return (
    <div className="dashboard-shell">
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
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

          {/* <PageComponent
              onNavigate={(targetSection: string) =>
                router.push(getDashboardHref(role, targetSection))
              }
              onOpenModal={setModal}
            /> */}
        </main>
      </div>

      {/* {modal && <Modal modal={modal} onClose={() => setModal(null)} />} */}
    </div>
  );
}
