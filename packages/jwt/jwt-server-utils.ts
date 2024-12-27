import crypto from 'crypto'
import type { JwtHeader, JwtPayload } from './jwt-types'

export function encrypt(data: string, secret: string): string {
  const algorithm = 'aes-256-gcm'
  const key = crypto.createHash('sha256').update(secret).digest() // Ensure 256-bit key
  const iv = crypto.randomBytes(12) // 96-bit IV for AES-GCM
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}.${encrypted}.${authTag.toString('hex')}`
}

export function decrypt(encryptedData: string, secret: string): string {
  try {
    const algorithm = 'aes-256-gcm'
    const key = crypto.createHash('sha256').update(secret).digest()
    const [ivHex, encrypted, authTagHex] = encryptedData.split('.')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (e) {
    if (e instanceof Error && e.message.includes('Unsupported state or unable to authenticate data')) {
      throw new Error('Unable to decrypt token: Data integrity check failed')
    }
    console.error(e)
    throw new Error('Unable to decrypt token')
  }
}

export function payloadValidator<T extends object>(payload: JwtPayload<T>): boolean {
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Payload cannot be empty')
  }
  return true
}

export function sign(data: string, secret: string): string {
  // TODO: maybe use hash factory here?
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(data)
  return hmac.digest('base64')
}

export function createJwtHeader(): JwtHeader {
  return { alg: 'HS256', typ: 'JWT' }
}

export function base64UrlEncode(str: string): string {
  const base64 = Buffer.from(str).toString('base64')
  return base64.replace('+', '-').replace('/', '_').replace(/=+$/, '')
}

export function base64UrlDecode(str: string): string {
  str = str.replace('-', '+').replace('_', '/')
  while (str.length % 4) {
    str += '='
  }
  return Buffer.from(str, 'base64').toString()
}

export function encodeJwt<T extends object>(header: JwtHeader, payload: JwtPayload<T>, secret: string): string {
  const headerEncoded = base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload))
  const signature = sign(`${headerEncoded}.${payloadEncoded}`, secret)
  return `${headerEncoded}.${payloadEncoded}.${base64UrlEncode(signature)}`
}

export function decodeJwt<T extends object>(
  jwt: string,
  secret: string
): { header: JwtHeader; payload: JwtPayload<T> } {
  const [headerEncoded, payloadEncoded, signatureEncoded] = jwt.split('.')
  const signatureToVerify = sign(`${headerEncoded}.${payloadEncoded}`, secret)

  if (base64UrlEncode(signatureToVerify) !== signatureEncoded) {
    throw new Error('Invalid signature')
  }

  return {
    header: JSON.parse(base64UrlDecode(headerEncoded)),
    payload: JSON.parse(base64UrlDecode(payloadEncoded)),
  }
}

export function isTokenExpired(payload: JwtPayload<any>): boolean {
  return !!(payload.exp && payload.exp < Math.floor(Date.now() / 1000))
}
