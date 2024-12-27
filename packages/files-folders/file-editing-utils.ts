import fsPromise from 'fs/promises'
import path from 'path'
import { directoryExists } from './file-validation-utils'

type SaveOptions = {
  filePath: string
  content: string | object
  isJson?: boolean
}

export async function saveOrUpdateFile({ filePath, content, isJson = false }: SaveOptions): Promise<void> {
  try {
    const dirPath = path.dirname(filePath)
    await directoryExists({ path: dirPath, createMissingDirs: true })

    let dataToWrite = content

    if (isJson) {
      dataToWrite = JSON.stringify(content, null, 2)
    }

    await fsPromise.writeFile(filePath, dataToWrite as string)
  } catch (err: any) {
    throw new Error(`saveOrUpdateFile: Failed to save or update file at path ${filePath}: ${err?.message}`)
  }
}

export async function updateMultipleFiles(filePaths: string[], content: string): Promise<void[]> {
  return Promise.all(filePaths.map((filePath) => saveOrUpdateFile({ filePath, content })))
}
