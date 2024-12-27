# State Management Module Usage Guide

Enhancing the State Management Utilities in the Bun Nook Kit (BNK) with TypeScript type safety adds a robust layer to your application, ensuring that data types are consistent and errors are minimized. This guide shows how to use the state module with TypeScript for added type safety.

## Introduction

In TypeScript, type safety ensures that the values used in your application match the expected types, providing compile-time checks and reducing runtime errors. BNK's State Management Utilities leverage TypeScript's capabilities for robust and error-resistant code.

## Key Features with TypeScript

1. **Type-safe State Dispatchers**:
   - Defined Types for Array, Boolean, Object, and Number Dispatchers
   - Ensured type consistency in state operations

2. **Type-safe State Manager**:
   - Strongly typed state initialization
   - Property-specific and conditional callbacks with type safety

## Usage Examples with TypeScript

### 1. Array Dispatchers with Type Safety

Manage arrays with TypeScript types:

```typescript
type ItemType = string[];
const key: string = "items";
const state: ItemType = ["apple", "banana"];
const updateFunction = (key: string, value: ItemType) => {
    console.log("Updated state:", key, value);
};

const arrayDispatch = createArrayDispatchers<ItemType>(key, state, updateFunction);
arrayDispatch.push("cherry");
arrayDispatch.pop();
arrayDispatch.insert(1, "orange");
```

### 2. Boolean Dispatchers with Type Safety

Handle boolean states:

```typescript
const key: string = "isActive";
const state: boolean = false;
const updateFunction = (key: string, value: boolean) => {
    console.log("Updated state:", key, value);
};

const boolDispatch = createBooleanDispatchers(key, state, updateFunction);
boolDispatch.toggle();
boolDispatch.set(true);
```

### 3. Object Dispatchers with Type Safety

Manage objects with defined types:

```typescript
interface User {
  name: string;
  age: number;
}

const key: string = "user";
const state: User = { name: "John", age: 25 };
const updateFunction = (key: string, value: User) => {
    console.log("Updated state:", key, value);
};

const objDispatch = createObjectDispatchers<User>(key, state, updateFunction);
objDispatch.set({ name: "Doe", age: 30 });
objDispatch.update({ age: 31 });
```

### 4. Number Dispatchers with Type Safety

Type-safe management of numerical values:

```typescript
const key: string = "count";
const state: number = 5;
const updateFunction = (key: string, value: number) => {
    console.log("Updated state:", key, value);
};

const numDispatch = createNumberDispatchers(key, state, updateFunction);
numDispatch.increment();
numDispatch.decrement(2);
```

### 5. Type-safe State Manager

Initialize a state manager with TypeScript:

```typescript
import { createStateManager } from "./state-manager";

interface AppState {
  count: number;
  message: string;
}

const initialState: AppState = {
  count: 0,
  message: "Hello"
};

const stateMachine = createStateManager<AppState>(initialState);
```

### Subscribing to State Changes with Types

Subscribe with type safety:

```typescript
const unsubscribe = stateMachine.subscribe(() => {
  console.log("State has changed!", stateMachine.state);
});

// Unsubscribing
unsubscribe();
```

### Conditional Callbacks with Type Safety

Type-safe conditional callbacks:

```typescript
stateMachine.whenValueIs<number>("count", 5).then(() => {
  console.log("Count has reached 5!");
});
```

### Updating State with Type Safety

Type-safe state updates:

```typescript
stateMachine.updateStateAndDispatch<number>("count", 1);
stateMachine.updateStateAndDispatch<number>("count", (currentValue) => currentValue + 1);
```

## Conclusion

Incorporating TypeScript type safety into BNK's State Management Utilities enhances the robustness and maintainability of your application. By leveraging TypeScript's static typing, developers can prevent many common errors, leading to more reliable and easier-to-maintain codebases.
