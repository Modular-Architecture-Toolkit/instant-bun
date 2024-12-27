# Files and Folder Module Usage Guide

## Introduction

The Files-Folder module in Bun Nook Kit (BNK) is a versatile suite for managing files and directories in JavaScript applications. It enhances file operations like reading, creating, updating, searching, and validating files and directories. This guide will focus on how this module improves built-in utilities and facilitates frontend references to files in a given directory, including directory search capabilities.

## Features

### File Editing Utilities

- **Save or Update Files**: Easily create or update files with new content.
- **Update Multiple Files**: Update multiple files simultaneously with the same content.

### File Path Utilities

- **Get Full Path**: Retrieve the full path of a file or directory, with an option to resolve relative paths.

### File Reading Utilities

- **List Files and Folders**: Enumerate files and folders in a specified directory.
- **Read Text from Multiple Files**: Asynchronously read text from multiple files.
- **Read JSON**: Efficiently read and parse JSON files.

### File Search Utilities

- **Search Directory for File Name**: Locate files with a specific name within a directory.

### File Validation Utilities

- **File and Directory Existence Check**: Confirm the existence of files and directories.
- **Delete Path**: Safely delete files or directories.
x
## Usage Examples

### Creating or Updating a File

```javascript
import { saveOrUpdateFile } from 'bnkit/files-folders/file-editing-utils';

await saveOrUpdateFile({
  filePath: 'path/to/file.txt',
  content: 'Hello World'
});
```

### Reading JSON File

```javascript
import { readJson } from 'bnkit/files-folders/file-reading-utils';

const data = await readJson('path/to/data.json');
console.log(data);
```

### Searching for Files in a Directory

```javascript
import { searchDirForFileName } from 'bnkit/files-folders/file-search-utils';

const files = await searchDirForFileName('path/to/directory', 'searchedFileName.txt');
console.log(files);
```

### Checking if a File Exists

```javascript
import { fileExists } from 'bnkit/files-folders/file-validation-utils';

const exists = await fileExists('path/to/file.txt');
console.log(exists ? 'File exists' : 'File does not exist');
```