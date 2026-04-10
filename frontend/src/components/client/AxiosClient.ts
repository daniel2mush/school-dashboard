import axios from 'axios'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { getRequestHeaders } from '@tanstack/react-start/server'

const getCookieValue = (name: string) => {
  // Server-side cookie reading
  return getCookie(name)
}

const setCookieServer = (
  name: string,
  value: string,
  options: {
    maxAge?: number
    path?: string
    secure?: boolean
    sameSite?: string
  } = {},
) => {
  // Server-side cookie setting (adds Set-Cookie to response)
  setCookie(name, value, {
    ...options,
    path: options.path ?? '/',
    sameSite: 'strict',
  })
}

/**
 * Server Axios Client – TanStack Start API Routes
 */
export const axiosClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor – automatically forwards cookies from the incoming request
axiosClient.interceptors.request.use(async (config) => {
  const headers = getRequestHeaders()
  config.headers = { ...config.headers, ...headers }
  return config
})

/**
 * Response Interceptor: Token Rotation (exactly as you wanted)
 */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 1. Guard against non-401 errors and infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        console.info('Getting new token')

        const refreshToken = getCookieValue('refreshToken')

        if (!refreshToken) {
          return Promise.reject(error)
        }

        // 2. Refresh token request (exactly your code)
        const response = await axios.post(
          'http://localhost:3001/api/auth/refresh-token',
          {},
          {
            headers: {
              Cookie: `refreshToken=${refreshToken}`, // ← as you specified
            },
          },
        )

        const { accessToken } = response.data.data

        // 3. Update Access Token
        setCookieServer('accessToken', accessToken, {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })

        // 4. Update Refresh Token from backend Set-Cookie header
        const setCookieHeaders = response.headers['set-cookie']

        if (setCookieHeaders) {
          const refreshTokenCookie = setCookieHeaders.find((cookie) =>
            cookie.startsWith('refreshToken='),
          )

          if (refreshTokenCookie) {
            const tokenValue = refreshTokenCookie.split(';')[0].split('=')[1]

            setCookieServer('refreshToken', tokenValue, {
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'Strict',
              path: '/',
              maxAge: 60 * 60 * 24 * 7,
            })
          }
        }

        // 5. Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`

        console.info('New Token Successfully set')

        return axiosClient(originalRequest)
      } catch (refreshError) {
        console.error('Token rotation failed:', refreshError)
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosClient
