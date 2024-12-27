import { describe, expect, it } from 'bun:test'
import { randFromArray, randNum } from './rand-num'

describe('randNum', () => {
  it('should return a number between the min and max values', () => {
    const result = randNum(1, 10)
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(10)
  })
})

describe('randFromArray', () => {
  it('should return a random element from the array', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = randFromArray(arr)
    expect(arr).toContain(result)
  })
})
