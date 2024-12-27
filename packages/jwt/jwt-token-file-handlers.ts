import type { JwtHandlers } from './jwt-be'
import type { RefreshToken } from './jwt-types'

export interface StoredRefreshToken extends RefreshToken {
  token: string
  exp: number
}

export interface JwtStorage {
  invalidTokens: string[]
  refreshTokens: StoredRefreshToken[]
}

async function getJwtStorage(filePath: string): Promise<JwtStorage> {
  const storageFile = Bun.file(filePath)
  if (storageFile.size === 0) return { invalidTokens: [], refreshTokens: [] }
  const content = await storageFile.text()
  return JSON.parse(content)
}

async function saveJwtStorage(data: JwtStorage, filePath: string): Promise<void> {
  const storageFile = Bun.file(filePath)
  await Bun.write(storageFile, JSON.stringify(data))
}

async function getRefreshTokens(filePath: string): Promise<StoredRefreshToken[]> {
  const storage = await getJwtStorage(filePath)
  return storage.refreshTokens
}

async function saveRefreshToken(token: StoredRefreshToken, filePath: string): Promise<void> {
  const storage = await getJwtStorage(filePath)
  storage.refreshTokens.push(token)
  await saveJwtStorage(storage, filePath)
}

async function removeRefreshToken(token: string, filePath: string): Promise<void> {
  const storage = await getJwtStorage(filePath)
  storage.refreshTokens = storage.refreshTokens.filter((t) => t.token !== token)
  await saveJwtStorage(storage, filePath)
}

async function getInvalidTokens(filePath: string): Promise<string[]> {
  const storage = await getJwtStorage(filePath)
  return storage.invalidTokens
}

async function addInvalidToken(token: string, filePath: string): Promise<void> {
  const storage = await getJwtStorage(filePath)
  storage.invalidTokens.push(token)
  await saveJwtStorage(storage, filePath)
}

export function createJwtFileHandlers(defaultFilePath: string): JwtHandlers {
  return {
    addInvalidToken: (token: string) => addInvalidToken(token, defaultFilePath),
    getInvalidTokens: () => getInvalidTokens(defaultFilePath),
    getRefreshTokens: () => getRefreshTokens(defaultFilePath),
    removeRefreshToken: (token: string) => removeRefreshToken(token, defaultFilePath),
    saveRefreshToken: (token: StoredRefreshToken) => saveRefreshToken(token, defaultFilePath),
  }
}
