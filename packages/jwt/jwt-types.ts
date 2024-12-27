export interface JwtHeader {
  alg: string
  typ: string
}

export type JwtPayload<T extends object> = {
  exp?: number
  roles?: string[]
} & T

export interface RefreshToken {
  token: string
  exp: number
}
