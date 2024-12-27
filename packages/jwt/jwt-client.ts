// frontend
export const jwtClient = () => {
  function decodeJwt(token: string) {
    const [headerEncoded, payloadEncoded] = token.split('.')
    const headerJson = Buffer.from(headerEncoded, 'base64').toString()
    const payloadJson = Buffer.from(payloadEncoded, 'base64').toString()

    return {
      header: JSON.parse(headerJson),
      payload: JSON.parse(payloadJson),
    }
  }

  function isJwtExpired(token: string) {
    const { payload } = decodeJwt(token)
    const currentTime = Math.floor(Date.now() / 1000)

    return payload.exp && payload.exp < currentTime
  }

  function hasRole(token: string, role: string) {
    const { payload } = decodeJwt(token)
    return payload.roles && payload.roles.includes(role)
  }

  let refreshToken: string | null = null

  function setRefreshToken(token: string) {
    refreshToken = token
  }

  function getRefreshToken() {
    return refreshToken
  }

  function clearRefreshToken() {
    refreshToken = null
  }

  return {
    decodeJwt,
    isJwtExpired,
    hasRole,
    setRefreshToken,
    getRefreshToken,
    clearRefreshToken,
  }
}
