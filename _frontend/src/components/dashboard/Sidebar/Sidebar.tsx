"use client";
import styles from "./Sidebar.module.scss";
import { NAV_CONFIG, getDashboardHref } from "../../../constants/navigation";
import { Avatar } from "../../ui";
import useUserStore from "@/store/UserStore";
import { usePathname } from "next/navigation";
import { NavItem } from "../NavItems/NavItems";

export default function Sidebar() {
  const pathName = usePathname();

  const sectionPath = pathName.split("/")[2];

  const user = useUserStore().user;

  if (!user) return;

  const nav = NAV_CONFIG[user.role!];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandCard}>
        <div className={styles.brandEyebrow}>School Dashboard</div>
        <div className={styles.brandTitle}>Sunridge Academy</div>
        <div className={styles.brandMeta}>Term 2 - 2026</div>
      </div>

      <nav className={styles.nav}>
        {nav.map((item, i) =>
          "section" in item ? (
            <div key={i} className={styles.sectionLabel}>
              {item.section}
            </div>
          ) : (
            <NavItem
              key={item.id}
              item={item}
              active={sectionPath === item.id}
              href={getDashboardHref(user.role, item.id)}
            />
          ),
        )}
      </nav>

      <div className={styles.profileCard}>
        <Avatar size={42} fontSize={14} color="var(--accent)" />
        <div className={styles.profileDetails}>
          <div className={styles.profileName}>{user.name}</div>
          <div className={styles.profileRole}>{user.role}</div>
          <div className={styles.profileEmail}>{user.email}</div>
        </div>
      </div>
    </aside>
  );
}
