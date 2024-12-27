import path from 'path'

export function getFullPath({
  baseDir,
  filePath,
  isAbsolute = false,
}: {
  baseDir: string
  filePath: string
  isAbsolute?: boolean
}): string {
  try {
    if (isAbsolute || path.isAbsolute(filePath)) {
      return filePath
    } else {
      return path.resolve(baseDir, filePath)
    }
  } catch (e) {
    throw e
  }
}
