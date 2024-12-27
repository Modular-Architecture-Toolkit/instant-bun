import type { CookieOptions } from './cookie-types'

declare const document: {
  cookie: any
}

export const parseCookieData = <T = string>(data: string | null): T | null => {
  if (data === null) return null
  if (typeof data === 'undefined') return null

  try {
    return JSON.parse(data) as T
  } catch (e) {
    // If parsing fails, assume the data is a string
    return data as unknown as T
  }
}

export const stringifyCookieData = <T>(data: T): string => {
  if (typeof data === 'string') {
    return data
  }

  return JSON.stringify(data)
}

export const retrieveRawCookieValue = (name: string): string | null => {
  const cookieArr = document.cookie.split('; ')

  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split('=')
    if (name === decodeURIComponent(cookiePair[0])) {
      return decodeURIComponent(cookiePair[1])
    }
  }

  return null
}

export const encodeCookie = <T>(cookieKey: string, value: T, options: CookieOptions): string => {
  let cookieString = `${encodeURIComponent(cookieKey)}=${encodeURIComponent(
    typeof value === 'string' ? value : JSON.stringify(value)
  )}`

  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`
  }

  if (options.path) {
    cookieString += `; path=${options.path}`
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`
  }

  if (options.secure) {
    cookieString += '; secure'
  }

  if (options.httpOnly) {
    cookieString += '; httpOnly'
  }

  return cookieString
}

export const setCookie = <T>(cookieKey: string, value: T, options: CookieOptions) => {
  document.cookie = encodeCookie(cookieKey, value, options)
}

export function parseCookies(cookiesString: string) {
  const cookies: { [name: string]: string } = {}
  const pairs = cookiesString.split(';')

  for (const pair of pairs) {
    const [name, ...value] = pair.split('=')
    cookies[name.trim()] = value.join('=').trim()
  }

  return cookies
}

export const getAllCookies = <T extends object>(req: Request): T => {
  const cookies = parseCookies(req?.headers.get('Cookie') || '')
  const parsedCookies: any = {}
  for (const [name, value] of Object.entries(cookies)) {
    parsedCookies[name] = parseCookieData(value) as any
  }

  return parsedCookies as T
}
