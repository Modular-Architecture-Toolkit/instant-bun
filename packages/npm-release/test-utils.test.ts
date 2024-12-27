import { describe, expect, test } from 'bun:test'
import { isTestFile } from './test-utils'

describe('isTestFile', () => {
  test('returns true when file name ends with test', () => {
    const meta = {
      file: 'utils.test.ts',
      dir: 'utils',
    }
    const result = isTestFile(meta as ImportMeta)
    expect(result).toBe(true)
  })
  test('returns false when file name does not end with test', () => {
    const meta = {
      file: 'utils.ts',
      dir: 'utils',
    }
    const result = isTestFile(meta as ImportMeta)
    expect(result).toBe(false)
  })
})
