import { AdminCurriculum } from '#/components/dashboard/views/Admin/AdminCurriculum'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/curriculum')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminCurriculum />
}
