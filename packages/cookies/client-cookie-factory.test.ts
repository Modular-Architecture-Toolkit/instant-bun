import { beforeEach, describe, expect, jest, test } from 'bun:test'
import { clientCookieFactory } from './client-cookie-factory'

declare var document: {
  cookie: any
}

const mockDocument = {
  _cookie: '',
  get cookie() {
    return this._cookie
  },
  set cookie(value) {
    this._cookie = value
  },
}

Object.defineProperty(globalThis, 'document', {
  value: mockDocument,
  writable: true,
  configurable: true,
})

describe('createClientCookieFactory', () => {
  const cookieFactory = clientCookieFactory('test')

  // Mock document.cookie
  let mockCookie = ''

  beforeEach(() => {
    // Reset the mock document.cookie before each test
    mockCookie = ''
  })

  Object.defineProperty(document, 'cookie', {
    get: jest.fn(() => mockCookie),
    set: jest.fn((newCookie) => {
      mockCookie = newCookie
    }),
  })

  test('setCookie sets a cookie', () => {
    cookieFactory.setCookie('value')
    expect(document.cookie).toBe('test=value')
  })

  test('getCookie returns the value of a cookie', () => {
    document.cookie = 'test=value'
    const value = cookieFactory.getRawCookie()
    expect(value).toBe('value')
  })

  test('deleteCookie sets a cookie with Max-Age=-1', () => {
    cookieFactory.deleteCookie()
    expect(document.cookie).toBe('test=; max-age=-1')
  })

  test('checkCookie returns true if a cookie exists', () => {
    document.cookie = 'test=value'
    const exists = cookieFactory.checkCookie()
    expect(exists).toBe(true)
  })

  test('checkCookie returns false if a cookie does not exist', () => {
    const exists = cookieFactory.checkCookie()
    expect(exists).toBe(false)
  })
})
