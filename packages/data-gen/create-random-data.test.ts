import { describe, expect, it } from 'bun:test'
import { createRandomData } from './create-random-data'

describe('createRandomData', () => {
  it('should return an object with the correct keys', () => {
    const config = {
      firstName: { type: 'firstName' },
      lastName: { type: 'lastName' },
      age: { type: 'num', min: 18, max: 65 },
    } as const
    const result = createRandomData(config)
    expect(result).toHaveProperty('firstName')
    expect(result).toHaveProperty('lastName')
    expect(result).toHaveProperty('age')
  })

  it('should return a number within the specified range for num type config', () => {
    const config = {
      age: { type: 'num', min: 18, max: 65 },
    } as const
    const result = createRandomData(config)
    expect(result.age).toBeGreaterThanOrEqual(18)
    expect(result.age).toBeLessThanOrEqual(65)
  })

  it('should return a string for non-num type config', () => {
    const config = {
      firstName: { type: 'firstName' },
      lastName: { type: 'lastName' },
    } as const
    const result = createRandomData(config)
    expect(typeof result.firstName).toBe('string')
    expect(typeof result.lastName).toBe('string')
  })
})
