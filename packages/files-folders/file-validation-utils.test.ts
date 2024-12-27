import { describe, expect, it } from 'bun:test'
import { saveOrUpdateFile } from './file-editing-utils'
import { getFullPath } from './file-path-utils'
import { deletePath, directoryExists, fileExists } from './file-validation-utils'

const savePath = process.env.PWD + '/files-folders/test'
const saveFile = savePath + '/test.txt'

describe('fileExists', () => {
  it('should return true and false', async () => {
    await saveOrUpdateFile({ filePath: saveFile, content: 'test test test' })
    expect(await fileExists(saveFile)).toBe(true)
    await deletePath(saveFile)
    expect(await fileExists(saveFile)).toBe(false)
  })

  it('should return false if file does not exist', async () => {
    const filePath = '/path/to/fake-file.txt'

    const result = await fileExists(filePath)
    expect(result).toBe(false)
  })
})

describe('deleteFile', () => {
  it('should delete file', async () => {
    await saveOrUpdateFile({ filePath: saveFile, content: 'test test test' })
    expect(await fileExists(saveFile)).toBe(true)
    await deletePath(saveFile)
    expect(await fileExists(saveFile)).toBe(false)
  })
})

describe('directoryExists', () => {
  it('should create directory if it does not exist', async () => {
    expect(await directoryExists({ path: savePath, createMissingDirs: true })).toBe(true)
  })

  it('should not create directory if it already exists', async () => {
    const directoryPath = 'files-folders/fake'
    const fullPath = getFullPath({
      baseDir: '.',
      filePath: directoryPath,
    })

    Bun.spawnSync({ cmd: ['rm', '-rf', directoryPath] })

    expect(await directoryExists({ path: fullPath })).toBe(false)

    await directoryExists({ path: fullPath, createMissingDirs: true })

    expect(await directoryExists({ path: fullPath })).toBe(true)

    Bun.spawnSync({ cmd: ['rm', '-rf', directoryPath] })
  })
})
