import axios, { isAxiosError } from 'axios'
import { deleteCookie } from '@tanstack/react-start/server'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async () => {
        try {
          // Send the logout request to the backend
          const res = await axios.post(
            'http://localhost:3001/api/auth/logout',
            {},
            {
              withCredentials: true, // This ensures cookies are sent
            },
          )

          // Clear the frontend cookies
          deleteCookie('accessToken')
          deleteCookie('refreshToken')

          // Return the backend response
          return new Response(JSON.stringify(res.data), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Logout Error:', error)

          // Even if the backend request fails, we should clear the frontend cookies
          deleteCookie('accessToken')
          deleteCookie('refreshToken')

          if (isAxiosError(error)) {
            const statusCode = error.response?.status || 500
            return new Response(
              JSON.stringify(
                error.response?.data || { error: 'Logout failed' },
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
