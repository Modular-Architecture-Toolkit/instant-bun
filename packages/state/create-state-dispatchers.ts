import type { Dispatchers } from '../../types'
import { isArray, isBool, isNum, isObj } from '../utils/value-checkers'

export function createArrayDispatchers<Key, T, Options extends object = {}>(
  key: Key,
  state: readonly T[], // mark it as readonly
  updateFunction: (key: Key, value: T[], opts?: Options) => void
) {
  return {
    set: (value: T[], opts?: Options) => {
      updateFunction(key, value, opts)
    },
    push: (value: T, opts?: Options) => {
      const existingState = state || []
      const newArr = [...existingState, value]
      updateFunction(key, newArr, opts)
    },
    pop: (opts?: Options) => {
      const newArr = state.slice(0, -1)
      updateFunction(key, newArr, opts)
    },
    insert: (index: number, value: T, overwrite = false, opts?: Options) => {
      if (!state) state = []

      const newArr = [...state]

      if (overwrite) {
        newArr[index] = value
      } else {
        newArr.splice(index, 0, value)
      }

      updateFunction(key, newArr, opts)
    },
    replace: (index: number, value: T, opts?: Options) => {
      if (!state) state = []

      const updatedState = [...state]

      updatedState[index] = value

      updateFunction(key, updatedState, opts)
    },
  }
}

export function createBooleanDispatchers<Key, Options extends object = {}>(
  key: Key,
  state: boolean,
  updateFunction: (key: Key, value: any, opts?: Options) => void
) {
  return {
    set: (value: boolean, opts?: Options) => {
      updateFunction(key, value, opts)
    },
    toggle: (opts?: Options) => {
      updateFunction(key, !state, opts)
    },
  }
}

export function createObjectDispatchers<Key, T, Options extends object = {}>(
  key: Key,
  state: T,
  updateFunction: (key: Key, value: any, opts?: Options) => void
) {
  return {
    set: (value: T, opts?: Options) => {
      updateFunction(key, value, opts)
    },
    update: (value: Partial<T>, opts?: Options) => {
      const newValue = { ...state, ...value }
      updateFunction(key, newValue, opts)
    },
  }
}

export function createNumberDispatchers<Key, Options extends object = {}>(
  key: Key,
  state: number,
  updateFunction: (key: Key, value: any, opts?: Options) => void
) {
  return {
    set: (value: number, opts?: Options) => {
      updateFunction(key, value, opts)
    },
    increment: (amount: number = 1, opts?: Options) => {
      updateFunction(key, state + amount, opts)
    },
    decrement: (amount: number = 1, opts?: Options) => {
      updateFunction(key, state - amount, opts)
    },
  }
}

export function createDefaultDispatchers<Key, T, Options extends object = {}>(
  key: Key,
  updateFunction: (key: Key, value: any, opts?: Options) => void
) {
  return {
    set: (value: T, opts?: Options) => {
      updateFunction(key, value, opts)
    },
  }
}

export function mergeWithDefault<State extends object>(
  defaultState: Readonly<State>, // mark it as readonly
  state: Readonly<State> // mark it as readonly
): State {
  const mergedState: Partial<State> = {}
  const missingKeys: (keyof State)[] = []

  for (const key in defaultState) {
    if (key in state) {
      mergedState[key] = state[key]
    } else {
      mergedState[key] = defaultState[key]
      missingKeys.push(key)
    }
  }

  // Log missing keys
  if (missingKeys.length > 0) {
    console.info('Missing keys from state:', missingKeys.join(', '))
  }

  return mergedState as State
}

export function createStateDispatchers<State extends object, UpdateFnOpts extends object = {}>({
  defaultState,
  state,
  updateFunction,
}: {
  state: State
  defaultState: State
  updateFunction: (key: keyof State, value: any, opts?: UpdateFnOpts) => void
}): Dispatchers<State> {
  const mergedState = mergeWithDefault<State>(defaultState, state)

  return (Object.keys(mergedState) as (keyof State)[]).reduce(
    (acc, key) => {
      const k = key as keyof State
      const currentValue = mergedState[k]

      if (isArray(currentValue)) {
        acc[k] = createArrayDispatchers(k, currentValue, updateFunction) as any
      } else if (isObj(currentValue)) {
        acc[k] = createObjectDispatchers(k, currentValue, updateFunction) as any
      } else if (isNum(currentValue)) {
        acc[k] = createNumberDispatchers(k, currentValue, updateFunction) as any
      } else if (isBool(currentValue)) {
        acc[k] = createBooleanDispatchers(k, currentValue, updateFunction) as any
      } else {
        acc[k] = createDefaultDispatchers(k, updateFunction) as any
      }

      return acc
    },
    {} as Dispatchers<State>
  )
}
