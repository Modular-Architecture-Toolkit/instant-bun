import { describe, expect, it } from 'bun:test'
import {
  base64UrlDecode,
  base64UrlEncode,
  decodeJwt,
  decrypt,
  encodeJwt,
  encrypt,
  isTokenExpired,
  payloadValidator,
  sign,
} from './jwt-server-utils'
import type { JwtHeader, JwtPayload } from './jwt-types'

const secret = 'test-secret' // For testing purposes only
const header: JwtHeader = { alg: 'HS256', typ: 'JWT' }
const payload: JwtPayload = {
  userId: 12345,
  roles: ['user'],
  exp: Math.floor(Date.now() / 1000) + 3600,
}

describe('JWT Utility Functions', () => {
  describe('Encryption & Decryption', () => {
    it('should encrypt and then correctly decrypt data', () => {
      const data = 'testData'
      const encryptedData = encrypt(data, secret)
      expect(encryptedData).not.toBe(data) // Ensure data is encrypted

      const decryptedData = decrypt(encryptedData, secret)
      expect(decryptedData).toBe(data)
    })

    it('should throw error for tampered encrypted data', () => {
      const data = 'testData'
      const encryptedData = encrypt(data, secret)
      const tamperedData = encryptedData.substring(0, encryptedData.length - 10) + 'TAMPER'
      expect(() => decrypt(tamperedData, secret)).toThrow('Unable to decrypt token')
    })
  })

  describe('Base64Url Encoding & Decoding', () => {
    it('should correctly encode and then decode base64Url', () => {
      const testStr = 'Hello, World!'
      const encoded = base64UrlEncode(testStr)
      const decoded = base64UrlDecode(encoded)
      expect(decoded).toBe(testStr)
    })

    it('should handle special characters correctly', () => {
      const testStr = 'Hello+World/='
      const encoded = base64UrlEncode(testStr)
      const decoded = base64UrlDecode(encoded)
      expect(decoded).toBe(testStr)
    })
  })

  describe('JWT Encoding & Decoding', () => {
    it('should correctly encode and then decode JWT', () => {
      const jwt = encodeJwt(header, payload, secret)
      const { header: decodedHeader, payload: decodedPayload } = decodeJwt(jwt, secret)

      expect(decodedHeader).toEqual(header)
      expect(decodedPayload.userId).toBe(payload.userId)
      expect(decodedPayload.roles[0]).toBe(payload.roles[0])
    })

    it('should throw error for tampered JWT signature', () => {
      const jwt = encodeJwt(header, payload, secret)
      const parts = jwt.split('.')
      const tamperedJwt = `${parts[0]}.${parts[1]}.tamperedSignature`
      expect(() => decodeJwt(tamperedJwt, secret)).toThrow('Invalid signature')
    })
  })

  describe('Payload Validation', () => {
    it('should validate non-empty payload', () => {
      const validPayload = { userId: 12345, roles: ['user'] }
      expect(() => payloadValidator(validPayload)).not.toThrow(Error)
    })

    it('should throw error for empty payload', () => {
      expect(() => payloadValidator({})).toThrow('Payload cannot be empty')
    })
  })

  describe('Data Signing', () => {
    it('should sign and verify data correctly', () => {
      const data = 'some random data'
      const signature1 = sign(data, secret)
      const signature2 = sign(data, secret)
      expect(signature1).toBe(signature2)
    })

    it('should produce different signatures for different secrets', () => {
      const data = 'some random data'
      const signature1 = sign(data, secret)
      const signature2 = sign(data, secret + 'tamper')
      expect(signature1).not.toBe(signature2)
    })
  })

  describe('Token Expiry Check', () => {
    it('should correctly identify an unexpired token', () => {
      const unexpiredPayload: JwtPayload = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      expect(isTokenExpired(unexpiredPayload)).toBe(false)
    })

    it('should correctly identify an expired token', () => {
      const expiredPayload: JwtPayload = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) - 3600,
      }
      expect(isTokenExpired(expiredPayload)).toBe(true)
    })

    it('should return false for tokens without expiration', () => {
      const noExpiryPayload: JwtPayload = { userId: 12345, roles: ['user'] }
      expect(isTokenExpired(noExpiryPayload)).toBe(false)
    })
  })
})
