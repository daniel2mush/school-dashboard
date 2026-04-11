import axiosClient from '#/components/client/AxiosClient'
import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'

export const Route = createFileRoute('/api/teacher/materials/$id')({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
        try {
          const res = await axiosClient.delete(
            `/teacher/materials/${params.id}`,
          )
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
