import { describe, expect, test } from 'bun:test'
import { jwtClient } from './jwt-client'

const base64url = (source: Buffer) => {
  // Encode in classical base64
  let encodedSource = source.toString('base64')

  // Remove padding equal characters
  encodedSource = encodedSource.replace(/=+$/, '')

  // Replace characters according to base64url specifications
  encodedSource = encodedSource.replace(/\+/g, '-')
  encodedSource = encodedSource.replace(/\//g, '_')

  return encodedSource
}

describe('jwtClientSideFactory', () => {
  const jwtService = jwtClient()

  test('decodeJwt decodes a JWT', () => {
    const token =
      base64url(Buffer.from('{"alg":"HS256","typ":"JWT"}')) +
      '.' +
      base64url(Buffer.from('{"sub":"1234567890","name":"John Doe","roles":["admin"],"exp":1609459200}'))
    const decodedToken = jwtService.decodeJwt(token)
    expect(decodedToken.header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(decodedToken.payload).toEqual({
      sub: '1234567890',
      name: 'John Doe',
      roles: ['admin'],
      exp: 1609459200,
    })
  })

  test('isJwtExpired checks if a JWT is expired', () => {
    const expiredToken =
      base64url(Buffer.from('{"alg":"HS256","typ":"JWT"}')) +
      '.' +
      base64url(Buffer.from('{"sub":"1234567890","name":"John Doe","roles":["admin"],"exp":1609459200}'))
    const unexpiredToken =
      base64url(Buffer.from('{"alg":"HS256","typ":"JWT"}')) +
      '.' +
      base64url(Buffer.from('{"sub":"1234567890","name":"John Doe","roles":["admin"],"exp":1909459200}'))
    expect(jwtService.isJwtExpired(expiredToken)).toBeTruthy()
    expect(jwtService.isJwtExpired(unexpiredToken)).toBeFalsy()
  })

  test('hasRole checks if a JWT contains a role', () => {
    const token =
      base64url(Buffer.from('{"alg":"HS256","typ":"JWT"}')) +
      '.' +
      base64url(Buffer.from('{"sub":"1234567890","name":"John Doe","roles":["admin"],"exp":1609459200}'))
    expect(jwtService.hasRole(token, 'admin')).toBeTruthy()
    expect(jwtService.hasRole(token, 'user')).toBeFalsy()
  })

  test('setRefreshToken and getRefreshToken manage the refresh token', () => {
    jwtService.setRefreshToken('refreshToken')
    expect(jwtService.getRefreshToken()).toBe('refreshToken')
  })

  test('clearRefreshToken clears the refresh token', () => {
    jwtService.setRefreshToken('refreshToken')
    jwtService.clearRefreshToken()
    expect(jwtService.getRefreshToken()).toBeNull()
  })
})
