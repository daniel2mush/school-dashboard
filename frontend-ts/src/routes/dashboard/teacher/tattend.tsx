import { createFileRoute } from '@tanstack/react-router'
import {TeachAttendance} from "#/components/dashboard/views/Teach";

export const Route = createFileRoute('/dashboard/teacher/tattend')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TeachAttendance/>
}
