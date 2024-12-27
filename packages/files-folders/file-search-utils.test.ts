import { describe, expect, it } from 'bun:test'
import { saveOrUpdateFile } from './file-editing-utils'
import { recursiveDirSearch, searchDirForFileName } from './file-search-utils'
import { deletePath } from './file-validation-utils'

const testDir = process.env.PWD + '/files-folders/test'
const nestedDir = testDir + '/nestedDir'

describe('Search Utilities', () => {
  it('should search directory and return matched files', async () => {
    // Setup
    const testFile1 = testDir + '/test1.txt'
    const testFile2 = nestedDir + '/test2.txt'

    await saveOrUpdateFile({ filePath: testFile1, content: 'Hello, world!' })
    await saveOrUpdateFile({ filePath: testFile2, content: 'Goodbye, world!' })

    // Test recursiveDirSearch
    const results = await recursiveDirSearch({
      directory: testDir,
      searchString: 'test',
    })

    expect(results.length).toEqual(2)
    expect(results.map((r) => r.fullPath)).toContain(testFile1)
    expect(results.map((r) => r.fullPath)).toContain(testFile2)

    // Test searchDirForFile
    const foundPath = await searchDirForFileName(testDir, 'test2.txt')
    expect(foundPath).toEqual(testFile2)

    // Cleanup
    await deletePath(testFile1)
    await deletePath(testFile2)
  })
})
