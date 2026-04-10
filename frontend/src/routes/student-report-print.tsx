import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { StudentReportCard } from '#/components/dashboard/views/Student'

export const Route = createFileRoute('/student-report-print')({
  component: RouteComponent,
})

function RouteComponent() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.print()
    }, 250)

    return () => window.clearTimeout(timer)
  }, [])

  return <StudentReportCard printMode />
}
