import { expect, test } from 'bun:test'
import classy from './classy'
test('test single string argument', () => {
  expect(classy('hello')).toBe('hello')
})

test('test multiple string arguments', () => {
  expect(classy('hello', 'world')).toBe('hello world')
})

test('test single number argument', () => {
  expect(classy(123)).toBe('123')
})

// Tests that passing a single boolean argument returns an empty string
test('test single boolean argument', () => {
  expect(classy(true)).toBe('')
})

test('test single null argument', () => {
  expect(classy(null)).toBe('')
})

test('test single undefined argument', () => {
  expect(classy(undefined)).toBe('')
})

test('test object classes', () => {
  expect(classy({ hello: true, world: false })).toBe('hello')
})
