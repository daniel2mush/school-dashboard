const setCookie = (
  name: string,
  value: string,
  options: {
    maxAge?: number
    path?: string
    secure?: boolean
    sameSite?: string
  } = {},
) => {
  if (typeof document === 'undefined') return

  const cookieParts = [`${name}=${value}`]
  if (options.maxAge) cookieParts.push(`Max-Age=${options.maxAge}`)
  if (options.path) cookieParts.push(`Path=${options.path}`)
  if (options.sameSite) cookieParts.push(`SameSite=${options.sameSite}`)
  if (options.secure) cookieParts.push('Secure')

  document.cookie = cookieParts.join('; ')
}

export const setCookies = (accessToken: string, refreshToken: string) => {
  setCookie('accessToken', accessToken, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  setCookie('refreshToken', refreshToken, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}
