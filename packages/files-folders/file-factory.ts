import { saveOrUpdateFile } from './file-editing-utils'
import { getFullPath } from './file-path-utils'
import { listFilesAndFolderInPath, readJson, readTextFromMultipleFiles } from './file-reading-utils'
import { searchDirForFileName } from './file-search-utils'
import { deletePath, directoryExists, fileExists } from './file-validation-utils'

export function fileFactory({ baseDirectory }: { baseDirectory: string }) {
  return {
    updateFiles: (relativePaths: string[], data: string) => {
      const promises = relativePaths.map(async (relativePath) => {
        const fullPath = await getFullPath({
          baseDir: baseDirectory,
          filePath: relativePath,
        })
        return saveOrUpdateFile({
          filePath: fullPath,
          content: data,
        })
      })
      return Promise.all(promises)
    },
    readTextFromMultipleFiles: (relativePaths: string[]) => {
      const fullPaths = relativePaths.map((relativePath) =>
        getFullPath({ baseDir: baseDirectory, filePath: relativePath })
      )
      return readTextFromMultipleFiles(fullPaths)
    },
    searchDirForFile: (fileName: string, relativePath?: string) => {
      let fullPath = baseDirectory

      if (relativePath) {
        fullPath = getFullPath({
          baseDir: baseDirectory,
          filePath: relativePath,
        })
      }

      return searchDirForFileName(fullPath, fileName)
    },
    fileExists: (relativePath: string) => {
      const fullPath = getFullPath({
        baseDir: baseDirectory,
        filePath: relativePath,
      })

      return fileExists(fullPath)
    },
    deleteFile: (relativePath: string) => {
      return deletePath(getFullPath({ baseDir: baseDirectory, filePath: relativePath }))
    },
    readJson: (relativePath: string) => {
      return readJson(getFullPath({ baseDir: baseDirectory, filePath: relativePath }))
    },
    saveJson: (content: object, relativePath: string) => {
      return saveOrUpdateFile({
        filePath: getFullPath({
          baseDir: baseDirectory,
          filePath: relativePath,
        }),
        content,
        isJson: true,
      })
    },
    directoryExists,
    createFile: (content: string, relativePath: string) => {
      return saveOrUpdateFile({
        filePath: getFullPath({
          baseDir: baseDirectory,
          filePath: relativePath,
        }),
        content,
      })
    },

    listFilesAndFolderInPath: (dirPath: string) => {
      const fullPath = getFullPath({
        baseDir: baseDirectory,
        filePath: dirPath,
      })

      return listFilesAndFolderInPath(fullPath)
    },
  }
}
