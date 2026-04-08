import { createFileRoute } from '@tanstack/react-router'
import axiosClient from '#/components/client/AxiosClient.ts'
import { isAxiosError } from 'axios'

export const Route = createFileRoute('/api/teacher/classes')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await axiosClient.get('/teacher/classes')
          return Response.json(res.data)
        } catch (error) {
          if (isAxiosError(error)) {
            return Response.json(error.response?.data, {
              status: error.response?.status || 500,
            })
          }
          return Response.json(
            { error: 'Internal server error' },
            { status: 500 },
          )
        }
      },
    },
  },
})
