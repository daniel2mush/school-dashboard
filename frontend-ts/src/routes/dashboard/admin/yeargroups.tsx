import { AdminYearGroups } from '#/components/dashboard/views/Admin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/yeargroups')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminYearGroups />
}
