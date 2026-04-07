'use client'
import styles from './Sidebar.module.scss'
import { Avatar } from '../../ui'
import { NAV_CONFIG } from '#/components/constants/navigation'
import useUserStore from '#/components/store/UserStore'
import { NavItem } from '../NavItems/NavItems'

export default function Sidebar() {
  const user = useUserStore((state) => state.user)

  if (!user) return null

  const nav = NAV_CONFIG[user.role] || []

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandCard}>
        <div className={styles.brandEyebrow}>School Dashboard</div>
        <div className={styles.brandTitle}>Sunridge Academy</div>
        <div className={styles.brandMeta}>Term 2 - 2026</div>
      </div>

      <nav className={styles.nav}>
        {nav.map((item, i) =>
          'section' in item ? (
            <div key={i} className={styles.sectionLabel}>
              {item.section}
            </div>
          ) : (
            <NavItem
              key={item.id}
              item={item}
              // We pass the role so NavItem can build the path correctly
              role={user.role}
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
  )
}
