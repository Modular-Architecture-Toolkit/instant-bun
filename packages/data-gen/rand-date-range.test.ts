import { describe, expect, it } from 'bun:test'
import { randDateRange } from './rand-date-range'

describe('randDateRange', () => {
  it('should return a date between the start and end dates', () => {
    const startDate = new Date('2021-01-01')
    const endDate = new Date('2021-12-31')
    const result = randDateRange(startDate, endDate)
    expect(result).toBeInstanceOf(Date)
    expect(result.getTime()).toBeGreaterThanOrEqual(startDate.getTime())
    expect(result.getTime()).toBeLessThanOrEqual(endDate.getTime())
  })
})
