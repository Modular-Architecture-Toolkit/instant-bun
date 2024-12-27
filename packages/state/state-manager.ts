import type { FilteredKeys } from '../../type-utils'
import { createStateDispatchers } from './create-state-dispatchers'

export type AllowedStateKeys = boolean | string | number

export const createStateManager = <State extends object>(initialState: State) => {
  const currentState: State = initialState

  const stateChangeCallbacks: {
    [Key in keyof State]?: Array<(newValue: State[Key]) => void>
  } = {}

  const listeners: Array<() => void> = []

  function broadcast() {
    for (const fn of listeners) {
      fn()
    }
  }

  function subscribe(listener: () => void) {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
  }

  function onStateChange<Key extends keyof State>(key: Key, callback: (newValue: State[Key]) => void) {
    ;(stateChangeCallbacks[key] ??= []).push(callback)
  }

  function updateStateAndDispatch(
    key: keyof State,
    updater: ((currentState: State[keyof State]) => State[keyof State]) | State[keyof State]
  ) {
    const newValue =
      typeof updater === 'function'
        ? (updater as (currentState: State[keyof State]) => State[keyof State])(currentState[key])
        : updater
    currentState[key] = newValue

    stateChangeCallbacks[key]?.forEach((callback) => callback(newValue))

    broadcast()
  }

  const whenValueIs = <
    Key extends keyof State = FilteredKeys<State, AllowedStateKeys>,
    ExpectedVal extends State[Key] = State[Key],
  >(
    key: Key,
    expectedValue: ExpectedVal
  ) => {
    const value = currentState[key]
    return {
      then: (callback: () => void) => {
        if (value === expectedValue) callback()
        else {
          onStateChange(key, (newValue) => {
            if (newValue === expectedValue) {
              callback()
              stateChangeCallbacks[key] = stateChangeCallbacks[key]?.filter((c) => c !== callback)
            }
          })
        }
      },
    }
  }

  const dispatchers = createStateDispatchers({
    defaultState: initialState,
    state: currentState,
    updateFunction: updateStateAndDispatch,
  })

  return {
    state: currentState,
    dispatch: dispatchers,
    onStateChange,
    updateStateAndDispatch,
    whenValueIs,
    subscribe,
  }
}
