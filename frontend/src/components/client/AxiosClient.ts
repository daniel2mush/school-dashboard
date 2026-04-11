import axios from 'axios'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { getRequestHeaders } from '@tanstack/react-start/server'

const getCookieValue = (name: string) => {
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
  setCookie(name, value, {
    ...options,
    path: options.path ?? '/',
    sameSite: 'strict',
  })
}

// ✅ Use import.meta.env for Vite/TanStack Start
const BASE_URL = import.meta.env.VITE_API_URL

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use(async (config) => {
  const headers = getRequestHeaders()
  config.headers = { ...config.headers, ...headers }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        console.info('Getting new token')

        const refreshToken = getCookieValue('refreshToken')

        if (!refreshToken) {
          return Promise.reject(error)
        }

        // ✅ FIXED: Changed process.env.API_URL to BASE_URL
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          {
            headers: {
              Cookie: `refreshToken=${refreshToken}`,
            },
          },
        )

        const { accessToken } = response.data.data

        // ✅ FIXED: Using import.meta.env for production check
        const isProd = import.meta.env.PROD

        setCookieServer('accessToken', accessToken, {
          secure: isProd,
          sameSite: 'Strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })

        const setCookieHeaders = response.headers['set-cookie']

        if (setCookieHeaders) {
          const refreshTokenCookie = setCookieHeaders.find((cookie) =>
            cookie.startsWith('refreshToken='),
          )

          if (refreshTokenCookie) {
            const tokenValue = refreshTokenCookie.split(';')[0].split('=')[1]

            setCookieServer('refreshToken', tokenValue, {
              secure: isProd,
              sameSite: 'Strict',
              path: '/',
              maxAge: 60 * 60 * 24 * 7,
            })
          }
        }

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
