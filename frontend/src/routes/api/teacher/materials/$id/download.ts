import { axiosClient } from '#/components/client/AxiosClient'
import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'

export const Route = createFileRoute('/api/teacher/materials/$id/download')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const res = await axiosClient.get(
            `/teacher/materials/${params.id}/download`,
            {
              responseType: 'arraybuffer',
            },
          )

          return new Response(res.data, {
            status: 200,
            headers: {
              'Content-Type':
                res.headers['content-type'] || 'application/octet-stream',
              'Content-Disposition':
                res.headers['content-disposition'] || 'attachment',
            },
          })
        } catch (error) {
          if (isAxiosError(error)) {
            const body =
              error.response?.data instanceof ArrayBuffer
                ? new TextDecoder().decode(error.response.data)
                : error.response?.data

            return Response.json(
              typeof body === 'string' ? { error: body } : body,
              {
                status: error.response?.status || 500,
              },
            )
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
