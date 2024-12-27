import { describe, expect, it } from 'bun:test'
import { getFullPath } from './file-path-utils'

describe('getFullPath', () => {
  it('should return an absolute path when given an absolute path', () => {
    const baseDirectory = '/Users/brandon'
    const filePath = '/Users/brandon/Documents/file.txt'
    const result = getFullPath({ baseDir: baseDirectory, filePath })
    expect(result).toEqual(filePath)
  })
})
