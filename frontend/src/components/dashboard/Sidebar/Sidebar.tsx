'use client'
import styles from './Sidebar.module.scss'
import { Avatar } from '../../ui'
import {
  getNavigationConfig,
  getRoleLabel,
} from '#/components/constants/navigation'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import { useSchoolData } from '#/components/providers/SchoolDataProvider'
import useUserStore from '#/components/store/UserStore'
import { NavItem } from '../NavItems/NavItems'

export default function Sidebar() {
  const user = useUserStore((state) => state.user)
  const { school } = useSchoolData()
  const { t, language } = useDashboardTranslation()

  if (!user) return null

  const nav = getNavigationConfig(user.role, language)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandCard}>
        <div className={styles.brandEyebrow}>{t('common.dashboard')}</div>
        <div className={styles.brandTitle}>{school.name}</div>
        <div className={styles.brandMeta}>
          {school.term} - {school.year}
        </div>
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
          <div className={styles.profileRole}>
            {getRoleLabel(user.role, language)}
          </div>
          <div className={styles.profileEmail}>{user.email}</div>
        </div>
      </div>
    </aside>
  )
}
