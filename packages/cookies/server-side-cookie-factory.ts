import type { CookieOptions } from './cookie-types'
import { encodeCookie, parseCookieData, parseCookies, stringifyCookieData } from './cookie-utils'

export function serverCookieFactory<
  T = string,
  FactoryRequest extends Request = Request,
  FactoryRes extends Response = Response,
>(
  cookieKey: string,
  {
    options: optionsCfg,
    request,
    response,
  }: {
    request?: FactoryRequest
    response?: FactoryRes
    options?: CookieOptions
  } = {}
) {
  const setCookie = (
    value: T,
    {
      options = optionsCfg || {},
      res = response,
    }: {
      options?: CookieOptions
      res?: Response | undefined
    } = {}
  ) => {
    const cookieValue = typeof value === 'string' ? value : stringifyCookieData(value)

    const cookieString = encodeCookie(cookieKey, cookieValue, options)

    if (!res) {
      throw new Error('No response object provided')
    }

    res?.headers.append('Set-Cookie', cookieString)
  }

  const deleteCookie = (res = response) => {
    if (!res) {
      throw new Error('No response object provided')
    }
    setCookie('' as unknown as T, {
      options: { maxAge: -1 },
      res,
    })
  }

  const getCookie = (uriDecode = false, req = request): T | null => {
    if (!req) {
      throw new Error('No request object provided')
    }
    const cookies = parseCookies(req.headers.get('Cookie') || '')
    const cookie = cookies[cookieKey]
    return parseCookieData<T>(uriDecode ? decodeURIComponent(cookie) : cookie)
  }

  const checkCookie = (req = request) => {
    return getCookie(false, req) !== null
  }

  const getRawCookie = (req = request): string | null => {
    if (!req) {
      throw new Error('No request object provided')
    }

    const cookies = parseCookies(req.headers.get('Cookie') || '')
    return cookies[cookieKey] || null
  }

  return {
    setCookie,
    getCookie,
    deleteCookie,
    checkCookie,
    getRawCookie,
  }
}
