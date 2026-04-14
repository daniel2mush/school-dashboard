'use client'
import styles from './Sidebar.module.scss'
import { Avatar, Button } from '../../ui'
import {
  getNavigationConfig,
  getRoleLabel,
} from '#/components/constants/navigation'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import useUserStore from '#/components/store/UserStore'
import { NavItem } from '../NavItems/NavItems'
import { useSchoolData } from '#/components/store/SchoolDatatStore'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Sidebar() {
  const user = useUserStore((state) => state.user)
  const { school } = useSchoolData()
  const { t, language } = useDashboardTranslation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (!user) return null

  const nav = getNavigationConfig(user.role, language)

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={styles.toggleButton}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </Button>
      <div className={styles.brandCard}>
        <div className={styles.miniLogo}>
          {school.name.slice(0, 2).toUpperCase()}
        </div>
        <div className={styles.brandFullContent}>
          <div className={styles.brandEyebrow}>{t('common.dashboard')}</div>
          <div className={styles.brandTitle}>{school.name}</div>
          <div className={styles.brandMeta}>
            {school.term} - {school.year}
          </div>
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
              isCollapsed={isCollapsed}
              // We pass the role so NavItem can build the path correctly
              role={user.role}
            />
          ),
        )}
      </nav>
    </aside>
  )
}
