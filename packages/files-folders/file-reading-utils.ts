import fsPromise from 'fs/promises'
import path from 'path'
import { FileDirInfo } from './file-types'
export async function readFileContent(filePath: string): Promise<string> {
  try {
    return Bun.file(filePath).text()
  } catch (error) {
    throw error
  }
}

export async function listFilesAndFolderInPath(fullPath: string): Promise<FileDirInfo[]> {
  const entries = await fsPromise.readdir(fullPath, {
    withFileTypes: true,
  })
  const filesAndFolders = entries.map((entry) => {
    const name = entry.name
    const entryFullPath = path.join(fullPath, name)
    const bunFileInfo = Bun.file(entryFullPath)
    const type = entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : 'other'
    let fileExtension = 'folder'
    if (type === 'file') {
      const regex = /(?:\.([^.]+))?$/
      fileExtension = regex.exec(entryFullPath)?.[1] ?? 'file'
    }
    return {
      type,
      name,
      fullPath: entryFullPath,
      extension: fileExtension,
      size: bunFileInfo.size,
    } satisfies FileDirInfo
  })
  return filesAndFolders
}

export async function readTextFromMultipleFiles(filePaths: string[]): Promise<string[]> {
  const promises = filePaths.map(async (filePath) => {
    return readFileContent(filePath)
  })
  return Promise.all(promises)
}

export async function readJson<T = any>(filePath: string): Promise<T> {
  const rawText = await Bun.file(filePath).text()
  return JSON.parse(rawText)
}
