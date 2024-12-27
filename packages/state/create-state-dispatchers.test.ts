import { beforeEach, describe, expect, it, jest } from 'bun:test'
import { createStateDispatchers } from './create-state-dispatchers'

describe('createStateDispatchers', () => {
  let state: any
  let dispatchers: any
  let updateFunction: jest.Mock = jest.fn()

  const updateAndGetLastCall = () => {
    const calls = updateFunction.mock.calls
    return calls[calls.length - 1]
  }

  beforeEach(async () => {
    state = {
      name: 'John Doe',
      age: 25,
      emails: ['john@example.com', 'doe@example.com'],
      active: true,
      address: {
        street: 'Main street',
        city: 'New York',
      },
    }

    updateFunction = jest.fn()
    dispatchers = createStateDispatchers({
      state,
      defaultState: state,
      updateFunction,
    })
  })

  it('should set string value correctly', () => {
    dispatchers.name.set('Jane Doe')
    const [lastKey, lastValue] = updateAndGetLastCall()
    expect(lastKey).toBe('name')
    expect(lastValue).toBe('Jane Doe')
  })

  it('should handle numbers correctly', () => {
    ;(dispatchers.age as { increment: Function }).increment(5)
    let [lastKey, lastValue] = updateAndGetLastCall()
    expect(lastKey).toBe('age')
    expect(lastValue).toBe(30)
    ;(dispatchers.age as { decrement: Function }).decrement(10)
    ;[lastKey, lastValue] = updateAndGetLastCall()
    expect(lastKey).toBe('age')
    expect(lastValue).toBe(15)
  })

  it('should set boolean value correctly', () => {
    dispatchers.active.set(false)
    const [lastKey, lastValue] = updateAndGetLastCall()
    expect(lastKey).toBe('active')
    expect(lastValue).toBe(false)
  })

  it('should update object values correctly', () => {
    ;(dispatchers.address as { update: Function }).update({
      city: 'Los Angeles',
    })
    const [lastKey, lastValue] = updateAndGetLastCall()
    expect(lastKey).toBe('address')
    expect(lastValue).toEqual({ street: 'Main street', city: 'Los Angeles' })
  })
  it('should handle array push', () => {
    ;(dispatchers.emails as { push: Function }).push('another@example.com')
    const [lastKey, lastValue] = updateAndGetLastCall()
    expect(lastKey).toBe('emails')
    expect(lastValue).toEqual(['john@example.com', 'doe@example.com', 'another@example.com'])
  })

  it('should handle array pop correctly', () => {
    ;(dispatchers.emails as { pop: Function }).pop()
    const [lastKey, lastValue] = updateAndGetLastCall()
    expect(lastKey).toBe('emails')
    expect(lastValue).toEqual(['john@example.com'])
  })

  it('should handle array insert correctly', () => {
    ;(dispatchers.emails as { insert: Function }).insert(1, 'inserted@example.com')
    const [lastKey, lastValue] = updateAndGetLastCall()
    expect(lastKey).toBe('emails')
    expect(lastValue).toEqual(['john@example.com', 'inserted@example.com', 'doe@example.com'])
  })

  it('should handle array replace correctly', () => {
    ;(dispatchers.emails as { replace: Function }).replace(1, 'replaced@example.com')
    const [lastKey, lastValue] = updateAndGetLastCall()
    expect(lastKey).toBe('emails')
    expect(lastValue).toEqual(['john@example.com', 'replaced@example.com'])
  })
})
