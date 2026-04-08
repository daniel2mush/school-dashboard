import { createFileRoute } from '@tanstack/react-router'
import axiosClient from '#/components/client/AxiosClient.ts'
import { isAxiosError } from 'axios'

export const Route = createFileRoute('/api/teacher/grades')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const data = await request.json()

        console.log(data, 'Data ')
        try {
          const res = await axiosClient.post('/teacher/grades', { data })
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
