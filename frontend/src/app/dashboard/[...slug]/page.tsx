"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar/Sidebar";
import { getSectionLabel } from "@/constants/navigation";
import useUserStore from "@/store/UserStore";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import styles from "./Dashboard.module.scss";
import Loading from "@/components/Loading/Loading";

export default function DashboardRolePage() {
  const userStore = useUserStore();
  const pathName = usePathname();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const sectionPath = pathName.split("/")[2];

  const { user } = userStore;

  async function logout() {}

  if (!user) {
    return <Loading />;
  }
  return (
    <div>
      <div>
        <Sidebar />
        <main>
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
          'Hello world'
        </main>
      </div>

      {/* {modal && <Modal modal={modal} onClose={() => setModal(null)} />} */}
    </div>
  );
}
