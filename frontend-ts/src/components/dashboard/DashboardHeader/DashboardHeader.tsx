'use client'

import { ROLE_LABELS } from '#/components/constants/navigation'
import { useLogout } from '#/components/query/AuthQuery'
import { Avatar, Badge, Switch } from '#/components/ui'
import { useTheme } from '#/components/theme/ThemeProvider'
import type { User } from '#/types/Types'
import { SunMedium, MoonStar, LogOut } from 'lucide-react'
import styles from './DashboardHeader.module.scss'
import { DropdownMenu } from 'radix-ui'

type DashboardHeaderProps = {
  role: User['role']
  sectionLabel: string
  user: User
}

const ROLE_BADGE_VARIANT: Record<User['role'], string> = {
  ADMIN: 'blue',
  TEACHER: 'green',
  STUDENT: 'amber',
}

export default function DashboardHeader({
  role,
  sectionLabel,
  user,
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const { mutateAsync: logoutMutation } = useLogout()

  const logoutUser = async () => {
    try {
      await logoutMutation()
    } catch (e) {
      console.error('Logout failed', e)
    }
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
        <div className={styles.themeToggleWrapper}>
          <SunMedium
            size={16}
            className={isDark ? styles.inactiveIcon : styles.activeIcon}
          />
          <Switch
            checked={isDark}
            onChange={(checked: boolean) =>
              setTheme(checked ? 'dark' : 'light')
            }
            ariaLabel="Toggle theme"
          />
          <MoonStar
            size={16}
            className={isDark ? styles.activeIcon : styles.inactiveIcon}
          />
        </div>

        <DropdownMenu.Root>
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
              <DropdownMenu.Item
                className={styles.menuItem}
                onClick={logoutUser}
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
