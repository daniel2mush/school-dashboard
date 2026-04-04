"use client";

import Sidebar from "@/components/Sidebar";
import useUserStore from "@/store/UserStore";

export default function DashboardRolePage() {
  const userStore = useUserStore();

  const { user } = userStore;

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
        <Sidebar currentSection={""} user={user} />
        <main className="dashboard-main">
          {/* <DashboardHeader
              role={role}
              sectionLabel={getSectionLabel(role, section)}
              user={user}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onLogout={() => {
                logout();
                router.replace("/login");
              }}
            /> */}

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
