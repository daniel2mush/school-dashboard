import { createFileRoute } from '@tanstack/react-router'
import { TeacherSidebarTimetable } from '#/components/dashboard/Sidebar/TeacherSidebarTimetable.tsx'

export const Route = createFileRoute('/dashboard/teacher/ttimetable')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TeacherSidebarTimetable />
}
