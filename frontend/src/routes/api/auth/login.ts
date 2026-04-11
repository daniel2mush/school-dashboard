import axios, { isAxiosError } from 'axios'
import type { LoginFormData } from '#/components/validation/authValidation'
import type { LoginResponse } from '#/types/Types'
import { setCookie } from '@tanstack/react-start/server'
import { createFileRoute } from '@tanstack/react-router'
import axiosClient from '#/components/client/AxiosClient'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request: req }) => {
        try {
          // 1. Extract the data from the incoming Reques
          const data: LoginFormData = await req.json()
          if (!data) {
            return new Response(JSON.stringify({ error: 'No data provided' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }
          // 2. Send the data to your backend
          const res = await axiosClient.post('/auth/login', data)
          const newdata = res.data as LoginResponse
          // 3. Set the access token (which comes from the response body)
          setCookie('accessToken', newdata.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
          })
          // 4. Extract the refresh token from Axios's "set-cookie" header array
          const setCookieHeaders = res.headers['set-cookie']
          if (setCookieHeaders) {
            // Find the specific string that starts with your token name
            const refreshTokenCookie = setCookieHeaders.find((cookie) =>
              cookie.startsWith('refreshToken='),
            )
            if (refreshTokenCookie) {
              // Extract just the value (e.g., pulling "abc123xyz" out of "refreshToken=abc123xyz; Path=/; HttpOnly")
              const tokenValue = refreshTokenCookie.split(';')[0].split('=')[1]
              setCookie('refreshToken', tokenValue, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
              })
            }
          }
          return new Response(JSON.stringify(newdata), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Login Error:', error)
          if (isAxiosError(error)) {
            const statusCode = error.response?.status || 500
            return new Response(
              JSON.stringify(error.response?.data || { error: 'Login failed' }),
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

// app/routes/api/hello.ts

// export const Route = createFileRoute('/api/auth/login')({
//   server: {
//     handlers: {
//       POST: async () => {
//         return Response.json('Hello, World!')
//       },
//     },
//   },
// })
