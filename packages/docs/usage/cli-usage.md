# CLI Module for Bun Nook Kit

## Overview

The Bun Nook Kit's `cli-factory` module is an essential tool for building command-line interfaces (CLIs). It is designed to streamline the process of parsing command-line arguments, collecting user inputs, and executing predefined actions. Additionally, this module facilitates file system interactions, such as checking the existence of directories and file creation.

## Features

1. **Command-Line Argument Parsing**: Simplifies the process of interpreting command-line arguments into a structured format.
2. **User Input Collection**: Efficiently collects user inputs in an asynchronous manner.
3. **Action Selection**: Enables users to select from a list of predefined actions.
4. **File Operations**: Offers capabilities for interacting with the file system, including directory checks and file creation.

## Usage Examples

### 1. Setting up the CLI Factory

To initialize the CLI factory, use the `createCliFactory` function:

```javascript
import { createCliFactory } from './path-to-cli-factory';

const cli = createCliFactory({
  inputPrompt: "Enter your command:",
  actionsConfig: {
    list: "List all items",
    create: "Create a new item",
    delete: "Delete an item"
  },
  logger: console.log
});
```

### 2. Process Command-Line Inputs

For processing command-line arguments and user input:

```javascript
const { commandLineArgs, userInput } = await cli.processInput();
console.log(`Command Line Args: ${JSON.stringify(commandLineArgs)}`);
console.log(`User Input: ${userInput}`);
```

### 3. Execute Actions

To prompt and execute user-selected actions:

```javascript
const { additionalPrompt, chosenActions } = await cli.executeActions();
console.log(`Additional Input: ${additionalPrompt}`);
console.log(`Chosen Actions: ${chosenActions.join(", ")}`);
```

### 4. Handle Files

For checking the existence of directories and creating files:

```javascript
cli.handleFiles({
  filePath: "./path-to-directory/filename.txt",
  fileContent: "This is the content of the file"
});
```

## Note

- Ensure you have the required permissions for file system operations when handling files.
- Always validate user inputs and handle potential errors to prevent unintended operations.