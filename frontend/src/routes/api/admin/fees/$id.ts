import { axiosClient } from '#/components/client/AxiosClient'
import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'

export const Route = createFileRoute('/api/admin/fees/$id')({
  server: {
    handlers: {
      PATCH: async ({ params, request: req }) => {
        try {
          const { id } = params
          const body = await req.json()
          const res = await axiosClient.patch(`/admin/fees/${id}`, body)
          return new Response(JSON.stringify(res.data), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Update Fee Error:', error)
          if (isAxiosError(error)) {
            const statusCode = error.response?.status || 500
            return new Response(
              JSON.stringify(
                error.response?.data || { error: 'Failed to update fee' },
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
      DELETE: async ({ params }) => {
        try {
          const { id } = params
          const res = await axiosClient.delete(`/admin/fees/${id}`)
          return new Response(JSON.stringify(res.data), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Delete Fee Error:', error)
          if (isAxiosError(error)) {
            const statusCode = error.response?.status || 500
            return new Response(
              JSON.stringify(
                error.response?.data || { error: 'Failed to delete fee' },
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
