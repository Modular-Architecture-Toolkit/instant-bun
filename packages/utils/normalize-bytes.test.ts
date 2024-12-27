import { describe, expect, test } from 'bun:test'
import { normalizeBytes } from './normalize-bytes'

describe('normalizeBytes function', () => {
  test('should return 0 Bytes for input 0', () => {
    const result = normalizeBytes(0)
    expect(result.value).toBe(0)
    expect(result.unit).toBe('Bytes')
  })

  test('should correctly normalize Bytes', () => {
    const result = normalizeBytes(500)
    expect(result.value).toBe(500)
    expect(result.unit).toBe('Bytes')
  })

  test('should correctly normalize KB', () => {
    const result = normalizeBytes(1500)
    expect(result.value).toBe(1.46) // 1500/1024 = 1.46484375, which becomes 1.46 after rounding to 2 decimals
    expect(result.unit).toBe('KB')
  })

  test('should correctly normalize MB', () => {
    const result = normalizeBytes(10485760) // 10*1024*1024
    expect(result.value).toBe(10)
    expect(result.unit).toBe('MB')
  })

  test('should correctly normalize GB', () => {
    const result = normalizeBytes(10737418240) // 10*1024*1024*1024
    expect(result.value).toBe(10)
    expect(result.unit).toBe('GB')
  })

  test('should correctly normalize with more than 2 decimals', () => {
    const result = normalizeBytes(1500, 4)
    expect(result.value).toBe(1.4648) // Rounded to 4 decimals
    expect(result.unit).toBe('KB')
  })

  test('should correctly normalize with no decimals', () => {
    const result = normalizeBytes(1500, 0)
    expect(result.value).toBe(1) // Rounded to 0 decimals
    expect(result.unit).toBe('KB')
  })

  test('should handle negative decimals (edge case)', () => {
    const result = normalizeBytes(1500, -2)
    expect(result.value).toBe(1.46) // Should revert to default behavior of 2 decimals
    expect(result.unit).toBe('KB')
  })
})
