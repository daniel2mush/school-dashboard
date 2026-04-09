'use server'

import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import axiosClient from '#/components/client/AxiosClient'

const jsonResponse = (data: any, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const Route = createFileRoute('/api/user/school-settings')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await axiosClient.get('/user/school-settings')
          return jsonResponse(res.data)
        } catch (error) {
          if (isAxiosError(error)) {
            return jsonResponse(
              error.response?.data || {
                error: 'Failed to fetch school settings',
              },
              error.response?.status || 500,
            )
          }

          return jsonResponse({ error: 'Internal server error' }, 500)
        }
      },
    },
  },
})
