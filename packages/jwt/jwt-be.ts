import crypto from 'crypto'
import {
  createJwtHeader,
  decodeJwt,
  decrypt,
  encodeJwt,
  encrypt,
  isTokenExpired,
  payloadValidator,
} from './jwt-server-utils'
import type { JwtHeader, JwtPayload, RefreshToken } from './jwt-types'

export interface JwtHandlers {
  getInvalidTokens?: () => Promise<string[]>
  addInvalidToken?: (token: string) => Promise<void>
  getRefreshTokens?: () => Promise<RefreshToken[]>
  saveRefreshToken?: (token: RefreshToken) => Promise<void>
  removeRefreshToken?: (token: string) => Promise<void>
}

// Default implementations
const defaultHandlers: Required<JwtHandlers> = {
  getInvalidTokens: async () => [],
  addInvalidToken: async () => {},
  getRefreshTokens: async () => [],
  saveRefreshToken: async () => {},
  removeRefreshToken: async () => {},
}

export const jwtBackend = <
  Payload extends object,
  FactoryJwtPayload extends JwtPayload<Payload> = JwtPayload<Payload>,
>({
  factorySignSecret,
  handlers = {},
  encryption,
}: {
  factorySignSecret: string
  handlers?: Partial<JwtHandlers>
  encryption?: {
    encryptionSecret: string
  }
}) => {
  const finalHandlers = { ...defaultHandlers, ...handlers }
  async function generateRefreshToken(): Promise<string> {
    const refreshToken = crypto.randomBytes(40).toString('hex')
    const expiresIn = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // Token valid for one week
    const tokenData = { token: refreshToken, exp: expiresIn }
    await finalHandlers.saveRefreshToken(tokenData)
    return refreshToken
  }

  async function validateRefreshToken(token: string): Promise<boolean> {
    if (await isValidToken(token)) {
      return false
    }

    const refreshTokens = await finalHandlers.getRefreshTokens()
    const refreshToken = refreshTokens.find((t) => t.token === token)
    if (!refreshToken) {
      return false
    }
    if (refreshToken.exp < Math.floor(Date.now() / 1000)) {
      await finalHandlers.removeRefreshToken(token)
      return false
    }
    return true
  }

  async function invalidateToken(token: string): Promise<void> {
    await finalHandlers.addInvalidToken(token)
  }

  async function isValidToken(token: string): Promise<boolean> {
    const invalidTokens = await finalHandlers.getInvalidTokens()

    return invalidTokens.includes(token)
  }

  function createJwt<CreatePayload extends Payload = Payload>({
    payload,
    signSecret = factorySignSecret,
    expiresIn = 60 * 60 * 24 * 7, // one week
    encryptionSecret = encryption?.encryptionSecret,
  }: {
    payload: CreatePayload
    signSecret?: string
    expiresIn?: number
    // encryption must be enabled on the factory in order for this to work
    encryptionSecret?: string
  }): string {
    const finalPayload: JwtPayload<CreatePayload> = {
      ...payload,
    }
    try {
      payloadValidator(payload)
    } catch (e) {
      throw new Error('Invalid Payload')
    }

    const header = createJwtHeader()
    finalPayload.exp = Math.floor(Date.now() / 1000) + expiresIn

    // JWT is already sign
    const jwt = encodeJwt(header, finalPayload, signSecret)
    return encryption && encryptionSecret ? encrypt(jwt, encryptionSecret) : jwt
  }

  async function verifyJwt(
    token: string,
    signSecret: string = factorySignSecret,
    // encryption must be enabled on the factory in order for this to work
    encryptionSecret: string | undefined = encryption?.encryptionSecret
  ): Promise<{ header: JwtHeader; payload: FactoryJwtPayload }> {
    let decryptedToken: string = token

    if (encryption && encryptionSecret) {
      decryptedToken = decrypt(token, encryptionSecret)
    }

    if (await isValidToken(token)) {
      throw new Error('This token is blacklisted')
    }

    const { header, payload } = decodeJwt(decryptedToken, signSecret)

    if (isTokenExpired(payload)) {
      throw new Error('Token expired')
    }

    return { header, payload }
  }

  return {
    createJwt,
    verifyJwt,
    generateRefreshToken,
    validateRefreshToken,
    invalidateToken,
  }
}
