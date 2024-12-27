import { v7 as uuid } from '../uuid'

export const getTokenExpireEpoch = (date: Date, tokenValidTimeSec: number) => {
  const expireEpoch = date.getTime() + tokenValidTimeSec * 1000

  return expireEpoch
}

export async function verifyToken(tokenString: string, salt: string, storedHash: string) {
  const fullPassword = tokenString + salt
  const isMatch = await Bun.password.verify(fullPassword, storedHash)

  return isMatch
}

export async function createToken(string: string, salt: string) {
  const fullPassword = string + salt
  return await Bun.password.hash(fullPassword, {
    algorithm: 'argon2id',
    memoryCost: 65536,
    timeCost: 3,
  })
}

export const createSecurityToken = async (tokenValidTime: number, currentDate?: Date) => {
  const salt = uuid()
  const [tokenId, timestamp] = uuid({
    returnTimestamp: true,
    dateTime: currentDate,
  })

  const securityToken = await createToken(tokenId, salt)
  const tokenExpireEpoch = getTokenExpireEpoch(timestamp, tokenValidTime)

  return {
    securityToken,
    tokenId,
    tokenExpireEpoch,
  }
}
