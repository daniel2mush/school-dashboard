import { axiosClient } from '#/components/client/AxiosClient'
import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'

export const Route = createFileRoute('/api/admin/periods/assign-year-group')({
  server: {
    handlers: {
      POST: async ({ request: req }) => {
        try {
          const body = await req.json()
          const res = await axiosClient.post('/admin/periods/assign-year-group', body)
          return new Response(JSON.stringify(res.data), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Assign Period Error:', error)
          if (isAxiosError(error)) {
            const statusCode = error.response?.status || 500
            return new Response(
              JSON.stringify(
                error.response?.data || { error: 'Failed to assign period' },
              ),
              {
                status: statusCode,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }
          return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
  },
})
