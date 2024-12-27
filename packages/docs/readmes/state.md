# State Management Module

## Introduction

Managing state efficiently is crucial in many JavaScript applications, be it frontend frameworks or backend services. The State Management Utilities provide a suite of tools to handle state across different data types, offering streamlined interfaces to observe, update, and synchronize state changes, making it more manageable across the application.

## Features

### **State Dispatchers**

- **Array Dispatchers**: Manipulate array values.
- **Boolean Dispatchers**: Update boolean values.
- **Object Dispatchers**: Manage object values.
- **Number Dispatchers**: Handle numerical values.
- **Default Dispatchers**: A general-purpose update function.
- **State Merging**: Merges provided state with a default, handling missing keys.
- **State Dispatcher Creation**: Combines individual dispatchers for overarching state management.

### **State Manager**

- **State Initialization**: Initialize state with a given set of values.
- **State Subscriptions**: Subscribe to global changes.
- **Property-specific Callbacks**: React to changes on specific properties.
- **Conditional Callbacks**: Callbacks based on specific conditions.
- **State Updation**: Update state and notify subscribers.
- **WebSocket Integration**: Real-time state synchronization with WebSocket servers.

## Usage Examples

### 1. Array Dispatchers

```javascript
const key = "items";
const state = ["apple", "banana"];
const updateFunction = (key, value) => {
    console.log("Updated state:", key, value);
};

const arrayDispatch = createArrayDispatchers(key, state, updateFunction);

arrayDispatch.push("cherry");   // Adds "cherry" to the end of the array
arrayDispatch.pop();            // Removes the last item from the array
arrayDispatch.insert(1, "orange"); // Inserts "orange" at index 1 without overwriting
```

### 2. Boolean Dispatchers

```javascript
const key = "isActive";
const state = false;
const updateFunction = (key, value) => {
    console.log("Updated state:", key, value);
};

const boolDispatch = createBooleanDispatchers(key, state, updateFunction);

boolDispatch.toggle();  // Toggles the boolean value
boolDispatch.set(true); // Explicitly sets the value to true
```

### 3. Object Dispatchers

```javascript
const key = "user";
const state = { name: "John", age: 25 };
const updateFunction = (key, value) => {
    console.log("Updated state:", key, value);
};

const objDispatch = createObjectDispatchers(key, state, updateFunction);

objDispatch.set({ name: "Doe", age: 30 }); // Sets the entire object
objDispatch.update({ age: 31 });           // Updates only the age property
```

### 4. Number Dispatchers

```javascript
const key = "count";
const state = 5;
const updateFunction = (key, value) => {
    console.log("Updated state:", key, value);
};

const numDispatch = createNumberDispatchers(key, state, updateFunction);

numDispatch.increment();      // Increments the count by 1 (default)
numDispatch.decrement(2);     // Decrements the count by 2
```

### 5. Merging State with Default

If there are missing keys in the state you want to merge, this function fills in those keys with default values:

```javascript
const defaultState = { a: 1, b: 2, c: 3 };
const currentState = { a: 4, c: 5 };

const mergedState = mergeWithDefault(defaultState, currentState);
console.log(mergedState); // Outputs: { a: 4, b: 2, c: 5 }
```

### 6. Creating State Dispatchers

This function combines all the dispatcher utilities based on the data type of each key in the state:

```javascript
const defaultState = { count: 0, items: [], isActive: false };
const currentState = { count: 5, items: ["apple"], isActive: true };

const updateFunction = (key, value) => {
    console.log("Updated state:", key, value);
};

const stateDispatchers = createStateDispatchers({
    defaultState,
    state: currentState,
    updateFunction
});

stateDispatchers.count.increment();
stateDispatchers.items.push("banana");
stateDispatchers.isActive.toggle();
```

## State Manager

To start, create a state manager for your application by calling the `createStateManager` function with the desired initial state:

```javascript
import { createStateManager } from "./state-manager";

const initialState = {
  count: 0,
  message: "Hello"
};

const stateMachine = createStateManager(initialState);
```

### 2. Subscribing to State Changes

To react to any change in the global state:

```javascript
const unsubscribe = stateMachine.subscribe(() => {
  console.log("State has changed!", stateMachine.state);
});

// To unsubscribe from changes
unsubscribe();
```

### 3. Watching Specific State Properties

If you only want to react to changes in specific state properties:

```javascript
stateMachine.onStateChange("count", (newValue) => {
  console.log("Count has changed to", newValue);
});
```

### 4. Conditional Callbacks

To execute a callback only when a specific condition is met:

```javascript
stateMachine.whenValueIs("count", 5).then(() => {
  console.log("Count has reached 5!");
});
```

### 5. Updating State

Update a specific state property:

```javascript
stateMachine.updateStateAndDispatch("count", 1);
```

Or use a function to derive the new value:

```javascript
stateMachine.updateStateAndDispatch("count", (currentValue) => currentValue + 1);
```

### 6. WebSocket Integration

The provided example demonstrates integrating the state manager with a WebSocket server. It listens for incoming messages to update the state and broadcasts state changes to all connected clients:

```javascript
import { ServerWebSocket, WebSocketHandler } from "bun";
import { createStateManager } from "./state-manager";
import { createWSStateHandler } from "./your-example-file";

const stateMachine = createStateManager(initialState);
const wsHandler = createWSStateHandler(stateMachine);
```

Here, the `createWSStateHandler` function watches for state changes and broadcasts them to all connected WebSocket clients.

## Conclusion

The State Management Utilities combine the power of State Dispatchers and the State Manager to provide a comprehensive approach to handling state in JavaScript applications. These tools facilitate state management across various data types, making it easier to integrate into diverse use cases, from simple UI updates to complex real-time data synchronization with WebSockets.
