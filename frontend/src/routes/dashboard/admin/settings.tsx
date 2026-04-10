import { AdminSettings } from '#/components/dashboard/views/Admin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminSettings />
}
