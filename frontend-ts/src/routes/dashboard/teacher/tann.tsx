import { createFileRoute } from '@tanstack/react-router'
import {TeachAnnouncements} from "#/components/dashboard/views/Teach";

export const Route = createFileRoute('/dashboard/teacher/tann')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TeachAnnouncements/>
}
