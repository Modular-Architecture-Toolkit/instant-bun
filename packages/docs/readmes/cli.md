# CLI Module

## Overview

The `cli-factory` module offers utilities for building command-line interfaces (CLIs). It provides functions to parse command-line arguments, get user inputs, and execute a set of predefined actions. The module also interacts with the file system, enabling operations like checking for the existence of directories and creating files.

## Features

1. **Command-Line Argument Parsing**: Parse command-line arguments into an easily manageable object.
2. **User Input Collection**: Collect user inputs asynchronously.
3. **Action Selection**: Allow users to choose from a set of predefined actions.
4. **File Operations**: Interact with the file system, including checking directories and creating files.

## Usage Examples

### 1. Setting up the CLI Factory

To set up the CLI factory, you can utilize the `createCliFactory` function:

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

To process the command-line arguments and get user input:

```javascript
const { commandLineArgs, userInput } = await cli.processInput();
console.log(`Command Line Args: ${JSON.stringify(commandLineArgs)}`);
console.log(`User Input: ${userInput}`);
```

### 3. Execute Actions

To prompt the user for the actions they want to perform and execute them:

```javascript
const { additionalPrompt, chosenActions } = await cli.executeActions();
console.log(`Additional Input: ${additionalPrompt}`);
console.log(`Chosen Actions: ${chosenActions.join(", ")}`);
```

### 4. Handle Files

To check if a directory exists and create a file:

```javascript
cli.handleFiles({
  filePath: "./path-to-directory/filename.txt",
  fileContent: "This is the content of the file"
});
```

## Note

- Ensure that you have the necessary permissions to interact with the file system when handling files.
- Always validate user inputs and handle potential errors to prevent unwanted operations.
