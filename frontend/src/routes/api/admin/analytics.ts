import { axiosClient } from '#/components/client/AxiosClient'
import { createFileRoute } from '@tanstack/react-router'
import axios, { isAxiosError } from 'axios'

export const Route = createFileRoute('/api/admin/analytics')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await axiosClient.get('/admin/analytics')

          return new Response(JSON.stringify({ data: res.data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Fetch Analytics Error:', error)

          if (isAxiosError(error)) {
            const statusCode = error.response?.status || 500

            return new Response(
              JSON.stringify(
                error.response?.data || { error: 'Failed to fetch analytics' },
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

// export const Route = createFileRoute('/api/admin/analytics')({
//   server: {
//     handlers: {
//       GET: async () => {
//         return Response.json('Hello, World!')
//       },
//     },
//   },
// })
