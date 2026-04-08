import { createFileRoute } from '@tanstack/react-router'
import {TeachMyYearGroups} from "#/components/dashboard/views/Teach";

export const Route = createFileRoute('/dashboard/teacher/tmy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TeachMyYearGroups/>
}
