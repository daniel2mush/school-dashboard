import { AdminFees } from '#/components/dashboard/views/Admin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/fees')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminFees />
}
