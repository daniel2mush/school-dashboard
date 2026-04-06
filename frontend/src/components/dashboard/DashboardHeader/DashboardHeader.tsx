"use client";

import { Avatar, Badge, Button } from "../../ui";
import { ROLE_LABELS } from "../../../constants/navigation";
import styles from "./DashboardHeader.module.scss";
import { User } from "@/types/Types";
import { DropdownMenu } from "radix-ui";
import { LogOut, MoonStar, SunMedium } from "lucide-react";
import {useLogout} from "@/query/AuthQuery";
import {useCreateAnnouncement} from "@/query/AdminQuery";

type DashboardHeaderProps = {
  role: User["role"];
  sectionLabel: string;
  user: User;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
};

const ROLE_BADGE_VARIANT: Record<User["role"], string> = {
  ADMIN: "blue",
  TEACHER: "green",
  STUDENT: "amber",
};

export default function DashboardHeader({
  role,
  sectionLabel,
  user,
  isDark,
  onToggleTheme,
  onLogout,
}: DashboardHeaderProps) {

  const { mutateAsync:logout} = useLogout()


  const logoutUser =  async ()=>{
    await logout()
  }
  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        <div className={styles.badgeContainer}>
          <Badge variant={ROLE_BADGE_VARIANT[role]}>{ROLE_LABELS[role]}</Badge>
          <span className={styles.sectionEyebrow}>Workspace</span>
        </div>
        <h1 className={styles.heading}>{sectionLabel}</h1>
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={styles.themeButton}
          onClick={onToggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </Button>

        <DropdownMenu.Root >
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className={styles.profileTrigger}
              aria-label="Open account menu"
            >
              <Avatar size={40} fontSize={14} color="var(--accent)" />
              <div className={styles.profileText}>
                <span className={styles.profileName}>{user.name}</span>
                <span className={styles.profileEmail}>{user.email}</span>
              </div>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={styles.menuContent}
              sideOffset={10}
              align="end"
            >
              <div className={styles.menuHeader}>
                <div className={styles.menuName}>{user.name}</div>
                <div className={styles.menuEmail}>{user.email}</div>
              </div>
              <DropdownMenu.Separator className={styles.menuSeparator} />
              <DropdownMenu.Item className={styles.menuItem} onClick={logoutUser}>
                <LogOut size={16} />
                <span>Sign out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
