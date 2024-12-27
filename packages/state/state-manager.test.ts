import { beforeEach, describe, expect, it, jest } from 'bun:test'
import { createStateManager } from './state-manager' // Adjust path

describe('createStateManager', () => {
  type TestState = {
    count: number
    flag: boolean
    items: string[]
  }

  let stateManager: ReturnType<typeof createStateManager<TestState>>

  beforeEach(() => {
    stateManager = createStateManager<TestState>({
      count: 0,
      flag: false,
      items: [],
    })
  })

  it('should initialize state correctly', () => {
    expect(stateManager.state.count).toBe(0)
    expect(stateManager.state.flag).toBe(false)
    expect(stateManager.state.items).toEqual([])
  })

  it('should update state and dispatch changes', () => {
    stateManager.updateStateAndDispatch('count', 5)
    expect(stateManager.state.count).toBe(5)
  })

  it('should listen to state changes with onStateChange', () => {
    const mockCallback = jest.fn()
    stateManager.onStateChange('count', mockCallback)

    stateManager.updateStateAndDispatch('count', 10)
    expect(mockCallback).toHaveBeenCalled()
  })

  it('should handle conditional state changes with whenValueIs', (done) => {
    stateManager.whenValueIs('count', 15).then(() => {
      done() // Complete the test when this condition is met
    })

    stateManager.updateStateAndDispatch('count', 15)
  })

  it('should handle subscriptions', () => {
    const mockSubscription = jest.fn()
    const unsubscribe = stateManager.subscribe(mockSubscription)

    stateManager.updateStateAndDispatch('count', 20)
    expect(mockSubscription).toHaveBeenCalled()

    unsubscribe()

    stateManager.updateStateAndDispatch('count', 25)
    expect(mockSubscription).toHaveBeenCalledTimes(1) // Shouldn't be called again after unsubscribe
  })
})
