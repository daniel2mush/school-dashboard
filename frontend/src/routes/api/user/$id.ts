'use server'

import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { deleteCookie } from '@tanstack/react-start/server'
import axiosClient from '#/components/client/AxiosClient'

// Helper to reduce repetition
const jsonResponse = (data: any, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const Route = createFileRoute('/api/user/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { id } = params

        if (!id) {
          return jsonResponse({ message: 'User ID is required' }, 400)
        }

        try {
          // No need to manually pass headers anymore
          // → The axiosClient interceptor already forwards cookies automatically
          const res = await axiosClient.get(`/user/${id}`)

          return jsonResponse(res.data)
        } catch (error) {
          console.error('Fetch User Error:', error)

          if (isAxiosError(error)) {
            return jsonResponse(
              error.response?.data || { error: 'Failed to fetch user' },
              error.response?.status || 500,
            )
          }

          return jsonResponse({ error: 'Internal server error' }, 500)
        }
      },

      DELETE: async ({ params }) => {
        const { id } = params

        try {
          const res = await axiosClient.delete(`/user/${id}`)

          // Clear auth cookies on successful deletion
          deleteCookie('accessToken')
          deleteCookie('refreshToken')

          return jsonResponse(res.data)
        } catch (error) {
          console.error('Delete User Error:', error)

          if (isAxiosError(error)) {
            return jsonResponse(
              error.response?.data || { error: 'Failed to delete user' },
              error.response?.status || 500,
            )
          }

          return jsonResponse({ error: 'Internal server error' }, 500)
        }
      },
    },
  },
})
