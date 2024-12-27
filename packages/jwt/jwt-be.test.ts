import { afterAll, afterEach, describe, expect, it, jest } from 'bun:test'
import { jwtBackend } from './jwt-be'
import { base64UrlDecode, base64UrlEncode, sign } from './jwt-server-utils'
import { createJwtFileHandlers } from './jwt-token-file-handlers'

describe('JWT Server Side Factory', () => {
  const factorySecret = 'test-secret' // For testing purposes only
  const jwtFactory = jwtBackend({
    handlers: createJwtFileHandlers('./jwt-tokens.json'),
    factorySignSecret: factorySecret,
  })
  const testPayload = { userId: 12345, roles: ['user'] }

  afterAll(() => {
    Bun.spawnSync({
      cmd: ['rm', 'jwt-tokens.json'],
    })
  })

  describe('JWT Creation & Verification', () => {
    it('should create and verify JWT correctly', async () => {
      const jwt = jwtFactory.createJwt({
        payload: testPayload,
      })
      expect(jwt).not.toBe(null)

      const { header, payload } = await jwtFactory.verifyJwt(jwt, factorySecret)
      expect(header).toEqual({ alg: 'HS256', typ: 'JWT' })
      expect(payload.userId).toBe(testPayload.userId)
      expect(payload.roles[0]).toBe(testPayload.roles[0])
    })
  })

  describe('JWT Encryption & Decryption', () => {
    it('should throw error for tampered JWT', async () => {
      const jwt = await jwtFactory.createJwt({
        payload: testPayload,
      })
      const tamperedJwt = jwt.substring(0, 10) + 'XX' + jwt.substring(12) // Tampering the JWT
      expect(async () => await jwtFactory.verifyJwt(tamperedJwt, factorySecret)).toThrow(Error)
    })
  })

  describe('Utility Functions', () => {
    it('should correctly encode and then decode base64Url', () => {
      const testStr = 'Hello, World!'
      const encoded = base64UrlEncode(testStr)
      const decoded = base64UrlDecode(encoded)
      expect(decoded).toBe(testStr)
    })

    it('should sign and verify data correctly', () => {
      const data = 'some random data'
      const signature = sign(data, factorySecret)
      const verification = sign(data, factorySecret)
      expect(signature).toBe(verification)
    })

    it('should throw error for wrong signature', () => {
      const data = 'some random data'
      const signature = sign(data, factorySecret + 'tamper')
      const verification = sign(data, factorySecret)
      expect(signature).not.toBe(verification)
    })
  })

  describe('Edge Cases', () => {
    it('should invalidate and then check and throw error for a token', async () => {
      const jwt = await jwtFactory.createJwt({
        payload: testPayload,
      })
      await jwtFactory.invalidateToken(jwt)

      expect(async () => await jwtFactory.verifyJwt(jwt, factorySecret)).toThrow(Error)
    })
  })

  describe('Token Blacklisting', () => {
    it('should not allow invalidated token to be used', async () => {
      const jwt = await jwtFactory.createJwt({
        payload: testPayload,
      })
      await jwtFactory.invalidateToken(jwt)
      expect(async () => await jwtFactory.verifyJwt(jwt, factorySecret)).toThrow(Error)
    })
  })

  describe('Token Structure', () => {
    it('should have a valid JWT structure', async () => {
      const jwt = await jwtFactory.createJwt({
        payload: testPayload,
      })
      expect(jwt.split('.').length).toBe(3)
    })

    it('should throw an error for tampered encrypted tokens', async () => {
      const jwt = await jwtFactory.createJwt({
        payload: testPayload,
      })
      const tamperedJwt = jwt.substring(0, 10) + 'XX' + jwt.substring(12)
      expect(async () => await jwtFactory.verifyJwt(tamperedJwt, factorySecret)).toThrow()
    })
  })

  describe('Refresh Tokens', () => {
    it('should invalidate token and check it', async () => {
      const refreshToken = await jwtFactory.generateRefreshToken()
      await jwtFactory.invalidateToken(refreshToken)
      expect(await jwtFactory.validateRefreshToken(refreshToken)).toBeFalsy()
    })
  })

  describe('Signature', () => {
    it('should throw error for tampered JWT signature', async () => {
      const jwt = await jwtFactory.createJwt({
        payload: testPayload,
      })
      const parts = jwt.split('.')
      const tamperedJwt = `${parts[0]}.${parts[1]}.tamperedSignature`
      expect(async () => await jwtFactory.verifyJwt(tamperedJwt, factorySecret)).toThrow('Invalid signature')
    })
  })

  describe('JWT Expiration', () => {
    // Mock Date.now() to simulate the passage of time
    const _DateNow = Date.now
    function mockDateNow(mockedTime: number) {
      Date.now = jest.fn(() => mockedTime)
    }

    afterEach(() => {
      Date.now = _DateNow
    })

    it('should verify JWT correctly before expiration', () => {
      // Create a JWT that expires in 2 seconds
      const jwt = jwtFactory.createJwt({
        expiresIn: 2,
        payload: testPayload,
      })
      expect(() => jwtFactory.verifyJwt(jwt, factorySecret)).not.toThrow()
    })

    it('should throw error for expired JWT', async () => {
      // Create a JWT that expires in 2 seconds
      const jwt = jwtFactory.createJwt({
        expiresIn: 2,
        payload: testPayload,
      })

      // Simulate the passage of 3 seconds
      mockDateNow(_DateNow() + 3000)

      // Now, the token should be expired
      expect(async () => await jwtFactory.verifyJwt(jwt, factorySecret)).toThrow('Token expired')
    })
  })
})

describe('new tokens not on invalid list', () => {
  const factorySecret = 'test-secret' // For testing purposes only
  const jwtFactory = jwtBackend({
    handlers: createJwtFileHandlers('./jwt-tokens.json'),
    factorySignSecret: factorySecret,
  })
  const testPayload = { userId: 12345, roles: ['user'] }

  it('newly created token should not be on the blacklist', async () => {
    const jwt = await jwtFactory.createJwt({
      payload: testPayload,
    })
    expect(async () => jwtFactory.verifyJwt(jwt, factorySecret)).not.toThrow()
  })
})
