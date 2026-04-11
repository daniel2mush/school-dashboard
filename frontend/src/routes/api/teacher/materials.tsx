import axiosClient from '#/components/client/AxiosClient'
import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'

export const Route = createFileRoute('/api/teacher/materials')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await axiosClient.get('/teacher/materials')
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

      POST: async ({ request }) => {
        console.log('This was called')

        const formData = await request.formData()

        console.log('FormData received:', Array.from(formData.entries()))

        try {
          const res = await axiosClient.post('/teacher/materials', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
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
