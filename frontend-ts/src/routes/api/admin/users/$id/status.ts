'use server'
import axiosClient from '#/components/client/AxiosClient'
import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'

export const Route = createFileRoute('/api/admin/users/$id/status')({
  server: {
    handlers: {
      PATCH: async ({ params, request: req }) => {
        const { id } = params
        if (!id) {
          return new Response(JSON.stringify({ message: 'User id required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        try {
          const body = await req.json()
          const res = await axiosClient.patch(`/admin/users/${id}/status`, body)
          return new Response(JSON.stringify(res.data), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Update user status error:', error)
          if (isAxiosError(error)) {
            const statusCode = error.response?.status || 500
            return new Response(
              JSON.stringify(
                error.response?.data || { error: 'Failed to update status' },
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
