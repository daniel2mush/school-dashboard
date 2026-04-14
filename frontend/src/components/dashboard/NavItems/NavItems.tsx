import { Link } from '@tanstack/react-router'
import styles from './NavItems.module.scss'

export function NavItem({
  item,
  role,
  isCollapsed,
}: {
  item: any
  role: string
  isCollapsed: boolean
}) {
  // We build the path right here.
  // Example: /dashboard/admin/overview
  const targetPath = `/dashboard/${role.toLowerCase()}/${item.id}`

  return (
    <Link
      to={targetPath}
      className={styles.navItem}
      // NO MORE MANUAL ACTIVE LOGIC. The router does this:
      activeProps={{ className: styles.activeNavItem }}
    >
      <div className={styles.icon}>{item.icon}</div>
      <div className={`${styles.label} ${isCollapsed ? styles.collapsed : ''}`}>
        {item.label}
      </div>
    </Link>
  )
}
