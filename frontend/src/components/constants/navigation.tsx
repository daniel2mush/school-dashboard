import {
  LayoutDashboard,
  Layers,
  Users,
  Banknote,
  CalendarDays,
  Megaphone,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  UserCheck,
  FileText,
  Wallet,
  PieChart,
  BookText,
  Settings,
} from 'lucide-react'
import type { UserRole } from '@/types/Types'
import type { DashboardLanguage } from '#/components/dashboard/i18n'
import { translate } from '#/components/dashboard/i18n'

export type NavGroupLabel = {
  section: string
}

export type NavPageItem = {
  id: string
  label: string
  icon: React.ReactNode
}

export type NavItem = NavGroupLabel | NavPageItem

export const ROLE_DEFAULT_PAGE: Record<UserRole, string> = {
  ADMIN: 'overview',
  TEACHER: 'tmy',
  STUDENT: 'sdash',
}

const NAV_CONFIG: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { section: 'platform' },
    { id: 'overview', label: 'Overview', icon: <PieChart size={20} /> },
    { id: 'yeargroups', label: 'Year Groups', icon: <Layers size={20} /> },
    { id: 'users', label: 'Staff & Students', icon: <Users size={20} /> },
    { id: 'fees', label: 'Fee Management', icon: <Banknote size={20} /> },
    { section: 'school' },
    { id: 'timetable', label: 'Timetable', icon: <CalendarDays size={20} /> },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: <Megaphone size={20} />,
    },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'attendance', label: 'Attendance', icon: <UserCheck size={20} /> },
    { id: 'curriculum', label: 'Curriculum', icon: <BookText size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ],
  TEACHER: [
    { section: 'myClasses' },
    { id: 'tmy', label: 'My Year Groups', icon: <Layers size={20} /> },
    {
      id: 'tsubjects',
      label: 'Class Content',
      icon: <BookOpen size={20} />,
    },
    { id: 'tgrades', label: 'Grading', icon: <ClipboardCheck size={20} /> },
    { id: 'tattend', label: 'Attendance', icon: <UserCheck size={20} /> },
    { id: 'ttimetable', label: 'Timetable', icon: <CalendarDays size={20} /> },
    { section: 'communication' },
    { id: 'tann', label: 'Announcements', icon: <Megaphone size={20} /> },
  ],
  STUDENT: [
    { section: 'mySchool' },
    { id: 'sdash', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'ssubjects', label: 'My Subjects', icon: <BookOpen size={20} /> },
    { id: 'sreport', label: 'Report Card', icon: <FileText size={20} /> },
    { id: 'satt', label: 'Attendance', icon: <UserCheck size={20} /> },
    { id: 'stimetable', label: 'Timetable', icon: <CalendarDays size={20} /> },
    { id: 'sfees', label: 'Fee Status', icon: <Wallet size={20} /> },
  ],
}

export function isRole(value: string): value is UserRole {
  return value in NAV_CONFIG
}

export function isNavPageItem(item: NavItem): item is NavPageItem {
  return 'id' in item
}

export function getRolePages(role: UserRole): NavPageItem[] {
  return NAV_CONFIG[role].filter(isNavPageItem)
}

export function getRoleLabel(role: UserRole, language: DashboardLanguage) {
  return translate(language, `role.${role}`)
}

export function getNavigationConfig(
  role: UserRole,
  language: DashboardLanguage,
) {
  return NAV_CONFIG[role].map((item) =>
    'section' in item
      ? { section: translate(language, `nav.${item.section}`) }
      : { ...item, label: translate(language, `nav.${item.id}`) },
  )
}

export function isValidSection(role: UserRole, section: string) {
  return getRolePages(role).some((item) => item.id === section)
}

export function getSectionLabel(
  role: UserRole,
  section: string,
  language: DashboardLanguage,
) {
  const match = getRolePages(role).find((item) => item.id === section)
  return match ? translate(language, `nav.${match.id}`) : 'Dashboard'
}

export function getDashboardHref(
  role: UserRole,
  section = ROLE_DEFAULT_PAGE[role],
) {
  return `/dashboard/${role.toLowerCase()}/${section}`
}
