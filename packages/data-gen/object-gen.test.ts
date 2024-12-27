import { describe, expect, it } from 'bun:test'
import { dataGenerators, inferTypeAndGenerate } from './object-gen'

describe('dataGenerators', () => {
  it('should generate a random string', () => {
    const result = dataGenerators.string()
    expect(typeof result).toBe('string')
  })

  it('should generate a random number', () => {
    const result = dataGenerators.number()
    expect(typeof result).toBe('number')
  })

  it('should generate a random boolean', () => {
    const result = dataGenerators.boolean()
    expect(typeof result).toBe('boolean')
  })

  it('should generate a random date', () => {
    const result = dataGenerators.date()
    expect(result instanceof Date).toBe(true)
  })

  it('should generate a random object', () => {
    const result = dataGenerators.object({
      name: dataGenerators.string,
      age: dataGenerators.number,
      isStudent: dataGenerators.boolean,
    })()
    expect(typeof result.name).toBe('string')
    expect(typeof result.age).toBe('number')
    expect(typeof result.isStudent).toBe('boolean')
  })

  it('should generate a random array', () => {
    const result = dataGenerators.array(dataGenerators.number, 5)()

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(5)
    expect(typeof result[0]).toBe('number')
  })
})

describe('inferTypeAndGenerate', () => {
  it('should generate a string for a string input', () => {
    const result = inferTypeAndGenerate('hello')
    expect(typeof result).toBe('string')
  })

  it('should generate a number for a number input', () => {
    const result = inferTypeAndGenerate(42)
    // expect(result).toEqual(dataGenerators.number());
    expect(typeof result).toBe('number')
  })

  it('should generate a boolean for a boolean input', () => {
    const result = inferTypeAndGenerate(true)
    expect(typeof result).toBe('boolean')
  })

  it('should generate a date for a Date input', () => {
    const date = new Date()
    const result = inferTypeAndGenerate(date)
    expect(result instanceof Date).toBe(true)
  })

  it('should generate an array for an array input', () => {
    const input = [1, 2, 3]
    const result = inferTypeAndGenerate(input)
    const inferredTypeGenerator = inferTypeAndGenerate(input[0])

    expect(result.length).toEqual(input.length)

    expect(typeof result[0]).toBe(typeof inferredTypeGenerator)
    expect(typeof input[0]).toEqual(typeof result[0])
  })

  it('should generate an object for an object input', () => {
    const input = { name: 'John', age: 30 }
    const result = inferTypeAndGenerate(input)
    const expected = dataGenerators.object(input)()
    // validate that the types of each key value, match the expected key/value types
    for (const key in expected) {
      // @ts-ignore
      expect(typeof result[key]).toBe(typeof expected[key])
    }
  })
})
