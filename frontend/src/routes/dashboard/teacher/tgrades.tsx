import { createFileRoute } from '@tanstack/react-router'
import {TeachGrading} from "#/components/dashboard/views/Teach";

export const Route = createFileRoute('/dashboard/teacher/tgrades')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TeachGrading/>
}
