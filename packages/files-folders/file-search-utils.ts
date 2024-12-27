import fsPromise from 'fs/promises'

import path from 'path'
import { FileDirInfo, FileWithContent } from './file-types'

export type FileSearchConfig = {
  [key: string]: boolean
}

export const defaultDirIgnore = {
  node_modules: true,
  '.git': true,
  '.vscode': true,
  '.idea': true,
  cache: true,
}

export const defaultExtIgnore = {
  log: true,
  localstorage: true,
  DS_Store: true,
  testing: true,
}

export const readFileInfo = (filePath: string): FileDirInfo => {
  const bunFileInfo = Bun.file(filePath)

  const extension = path.extname(bunFileInfo?.name || '').slice(1)

  return {
    type: 'file',
    name: filePath.split('/').pop() || '',
    fullPath: filePath,
    size: bunFileInfo.size,
    extension,
  }
}

export type FileSearchParams<T extends boolean> = {
  directory: string
  searchString: string
  ignoreDirectories?: object
  ignoreFileTypes?: object
  searchContent?: T
}

export const recursiveDirSearch = async <T extends boolean = false>(
  params: FileSearchParams<T>
): Promise<T extends true ? FileWithContent[] : FileDirInfo[]> => {
  const {
    directory,
    searchString,
    ignoreDirectories = defaultDirIgnore,
    ignoreFileTypes = defaultExtIgnore,
    searchContent = false,
  } = params

  const results = []
  const entries = await fsPromise.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory() && !ignoreDirectories[entry.name as keyof typeof ignoreDirectories]) {
      const nestedResults = await recursiveDirSearch({
        ...params,
        directory: fullPath,
      })
      results.push(...nestedResults)
    } else if (entry.isFile()) {
      const extension = path.extname(entry.name).slice(1)

      if (ignoreFileTypes[extension as keyof typeof ignoreFileTypes]) continue

      if (searchContent) {
        const content = await Bun.file(fullPath).text()
        if (content.includes(searchString)) {
          const bunFileInfo = Bun.file(fullPath)
          results.push({
            type: 'file',
            name: entry.name,
            fullPath,
            size: bunFileInfo.size,
            extension,
            content,
          })
        }
      } else if (entry.name.includes(searchString)) {
        const bunFileInfo = Bun.file(fullPath)
        results.push({
          type: 'file',
          name: entry.name,
          fullPath,
          size: bunFileInfo.size,
          extension,
        })
      }
    }
  }

  return results as T extends true ? FileWithContent[] : FileDirInfo[]
}

export async function searchDirForFileName(startingDir: string, fileName: string): Promise<string | null> {
  async function searchFn(dir: string): Promise<string | null> {
    const entries = await fsPromise.readdir(dir, { withFileTypes: true })
    for (let entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (await searchFn(fullPath)) {
          return fullPath + '/' + fileName
        }
      } else if (entry.name === fileName) {
        return fullPath + '/' + fileName
      }
    }
    return null
  }
  return searchFn(startingDir)
}
