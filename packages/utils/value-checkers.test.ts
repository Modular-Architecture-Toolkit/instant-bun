import { describe, expect, test } from 'bun:test'
import { isArray, isBool, isNum, isObj, isStr } from './value-checkers'

describe('value-checkers tests', () => {
  test('isArray', () => {
    expect(isArray([1, 2, 3])).toBe(true)
    expect(isArray('not an array')).toBe(false)
  })

  test('isObj', () => {
    expect(isObj({ hello: 'world' })).toBe(true)
    expect(isObj(123)).toBe(false)
  })

  test('isNum', () => {
    expect(isNum(123)).toBe(true)
    expect(isNum('not a number')).toBe(false)
  })

  test('isBool', () => {
    expect(isBool(true)).toBe(true)
    expect(isBool(false)).toBe(true)
    expect(isBool('not a bool')).toBe(false)
  })

  test('isStr', () => {
    expect(isStr('a string')).toBe(true)
    expect(isStr(123)).toBe(false)
  })
})
