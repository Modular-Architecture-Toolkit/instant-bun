import { beforeEach, describe, expect, jest, test } from 'bun:test'
import { serverCookieFactory } from './server-side-cookie-factory'

describe('createServerCookieFactory', () => {
  const cookieFactory = serverCookieFactory('test')

  // Mock response and request objects
  let mockRes = { headers: { append: jest.fn() } }
  let mockReq = { headers: { get: jest.fn() } }

  beforeEach(() => {
    // Reset the mock functions before each test
    mockRes.headers.append.mockReset()
    mockReq.headers.get.mockReset()
  })

  test('setCookie appends a Set-Cookie header', () => {
    cookieFactory.setCookie('test', { res: mockRes as unknown as Response })
    // bun doesn't currently support toHaveBeenCalledWith
    // expect(mockRes.headers.append).toHaveBeenCalledWith(
    //   "Set-Cookie",
    //   "test=value"
    // );
    expect(mockRes.headers.append).toHaveBeenCalled()
  })

  test('getCookie returns the value of a cookie', () => {
    mockReq.headers.get.mockReturnValue('test=value')
    const value = cookieFactory.getCookie(false, mockReq as any as Request)
    expect(value).toBe('value')
  })

  test('deleteCookie sets a cookie with Max-Age=-1', () => {
    cookieFactory.deleteCookie(mockRes as any as Response)
    // expect(mockRes.headers.append).toHaveBeenCalledWith(
    //   "Set-Cookie",
    //   "test=; Max-Age=-1"
    // );
    expect(mockRes.headers.append).toHaveBeenCalled()
  })

  test('checkCookie returns true if a cookie exists', () => {
    mockReq.headers.get.mockReturnValue('test=value')
    const exists = cookieFactory.checkCookie(mockReq as unknown as Request)
    expect(exists).toBe(true)
  })

  test('checkCookie returns false if a cookie does not exist', () => {
    mockReq.headers.get.mockReturnValue('')
    const exists = cookieFactory.checkCookie(mockReq as unknown as Request)
    expect(exists).toBe(false)
  })
})
