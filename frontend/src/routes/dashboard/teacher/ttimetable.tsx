import { createFileRoute } from '@tanstack/react-router'
import { TeacherTimetable } from '#/components/dashboard/views/Teach/TeacherTimetable'

export const Route = createFileRoute('/dashboard/teacher/ttimetable')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TeacherTimetable />
}
