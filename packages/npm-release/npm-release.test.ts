import { describe, expect, jest, test } from 'bun:test'
import { getCurrentVersion, npmPublish, updateVersion } from './npm-release'
import { isTestFile } from './test-utils'

describe('getCurrentVersion', () => {
  test('returns the version from the package.json', async () => {
    const packagePath = isTestFile(import.meta) ? import.meta.dir + '/mock-package.json' : './package.json'

    const version = await getCurrentVersion(packagePath)
    const hasThreeParts = version.split('.').length === 3

    expect(hasThreeParts).toBe(true)
  })
})

describe('updateVersion', () => {
  test('increments patch version by default', () => {
    const version = updateVersion({
      currentVersion: '1.0.0',
    })
    expect(version).toEqual('1.0.1')
  })

  test('increments minor version', () => {
    const version = updateVersion({
      currentVersion: '1.0.0',
      increment: 'minor',
    })
    expect(version).toEqual('1.1.0')
  })
  test('increments major version', () => {
    const version = updateVersion({
      currentVersion: '1.0.0',
      increment: 'major',
    })
    expect(version).toEqual('2.0.0')
  })

  test('increments major with alpha', () => {
    const version = updateVersion({
      currentVersion: '1.0.0',
      increment: 'major',
      isAlpha: true,
    })

    expect(version).toContain('alpha')
    expect(version).toStartWith('2.0.0')
  })

  test('increments alpha version with hash', () => {
    const version = updateVersion({
      currentVersion: '1.0.0',
      increment: 'patch',
      isAlpha: true,
    })
    expect(version).toMatch(/1\.0\.1-alpha\.[a-z0-9]{8}/)
  })

  test('increments alpha version with hash', () => {
    const version = updateVersion({
      currentVersion: '1.0.0',
      increment: 'patch',
      isBeta: true,
    })
    expect(version).toMatch(/1\.0\.1-beta\.[a-z0-9]{8}/)
  })
})

describe('npmPublish', () => {
  test('retries on version conflict', async () => {
    // Mock failed publish due to version conflict
    Bun.spawnSync = jest
      .fn()
      .mockReturnValueOnce({
        stdout: '',
        stderr: 'Cannot publish over previously published version',
      })
      .mockReturnValueOnce({
        stdout: 'Published',
        stderr: '',
      })

    await npmPublish({
      packagePath: './package.json',
      isAlpha: false,
      maxRetries: 2,
    })

    expect(Bun.spawnSync).toHaveBeenCalledTimes(2)
  })
})
