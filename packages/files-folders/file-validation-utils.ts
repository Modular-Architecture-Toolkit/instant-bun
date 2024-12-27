import fsPromise from 'fs/promises'
import path from 'path'
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    return await Bun.file(filePath).exists()
  } catch (error) {
    return false
  }
}

export async function deletePath(targetPath: string) {
  let dirData

  try {
    dirData = await fsPromise.stat(targetPath)
  } catch (error) {
    console.error(error)
  }

  if (dirData && dirData.isDirectory()) {
    for (const file of await fsPromise.readdir(targetPath)) {
      await deletePath(path.join(targetPath, file))
    }
    await fsPromise.rm(targetPath)
  } else if (dirData && dirData.isFile()) {
    // delete file
    await fsPromise.unlink(targetPath)
  } else {
    console.info(`deletePath: Path does not exist: ${targetPath}`)
  }
}
export async function directoryExists({
  createMissingDirs = false,
  path,
}: {
  path: string
  createMissingDirs?: boolean
}): Promise<void | boolean> {
  try {
    const stat = await fsPromise.stat(path)
    return stat.isDirectory()
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      if (!createMissingDirs && typeof createMissingDirs !== 'boolean') {
        console.error(
          `directoryExists: Directory does not exist: ${path}, but createMissingDirs is false, set to true to create the directory.`
        )
        return false
      }

      if (createMissingDirs) {
        await fsPromise.mkdir(path, { recursive: true })
        console.info(`directoryExists: Created directory: ${path}`)
        return true
      }

      return false
    } else {
      throw error
    }
  }
}
