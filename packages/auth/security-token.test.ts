import { describe, it } from 'bun:test'
import { expect } from 'bun:test'
import { getTokenExpireEpoch, createToken, verifyToken, createSecurityToken } from '.'

describe('Token Utilities', () => {
  describe('getTokenExpireEpoch', () => {
    it('should return the correct expiration epoch', () => {
      const date = new Date('2023-10-26T12:00:00Z')
      const tokenValidTimeSec = 3600 // 1 hour in seconds
      const expected = date.getTime() + tokenValidTimeSec * 1000 // convert seconds to milliseconds
      const result = getTokenExpireEpoch(date, tokenValidTimeSec)

      expect(result).toEqual(expected)
    })
  })
  describe('verifyToken', () => {
    it('should verify the token correctly', async () => {
      const salt = 'randomSalt'
      const originalString = 'testToken'
      const hashedToken = await createToken(originalString, salt)
      const isVerified = await verifyToken(originalString, salt, hashedToken)
      expect(isVerified).toBe(true)
    })
  })

  describe('createToken', () => {
    it('should create a hashed token', async () => {
      const salt = 'randomSalt'
      const originalString = 'testToken'
      const hashedToken = await createToken(originalString, salt)
      expect(hashedToken).toBeTruthy()
      expect(hashedToken).not.toEqual(originalString) // Ensure the hashed token is not the same as the original string
    })
  })

  describe('createSecurityToken', () => {
    it('should create a security token with default expiration time', async () => {
      const result = await createSecurityToken(5000)
      expect(result.securityToken).toBeTruthy()
      expect(result.tokenId).toBeTruthy()
      expect(result.tokenExpireEpoch).toBeGreaterThan(Date.now())
    })

    it('should create a security token with specified expiration time', async () => {
      const currentTime = new Date()
      const tokenValidTime = 60 * 15 // 15 minutes
      const result = await createSecurityToken(tokenValidTime, currentTime)
      const expectedExpiration = currentTime.getTime() + tokenValidTime * 1000
      expect(result.tokenExpireEpoch).toBeCloseTo(expectedExpiration, -2) // -2 is for a precision of 10 milliseconds
    })
  })
})
