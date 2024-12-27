# Files-Folder Module

## Introduction

The Files-Folder module is a comprehensive suite for managing files and directories in JavaScript applications. It simplifies file operations such as reading, creating, updating, searching, and validating files and directories, making it an essential utility for developers dealing with file systems.

## Features

### File Editing Utilities

- **Save or Update Files**: Create or update files with new content.
- **Update Multiple Files**: Simultaneously update multiple files with the same content.

### File Path Utilities

- **Get Full Path**: Retrieve the full path of a file or directory, optionally resolving relative paths.

### File Reading Utilities

- **List Files and Folders**: Enumerate files and folders in a specified directory.
- **Read Text from Multiple Files**: Asynchronously read text from multiple files.
- **Read JSON**: Read and parse JSON files.

### File Search Utilities

- **Search Directory for File Name**: Search for files with a specific name within a directory.

### File Validation Utilities

- **File and Directory Existence Check**: Verify the existence of files and directories.
- **Delete Path**: Safely delete files or directories.

## Usage Examples
### [Files Folder Usage](usage/files-folders-usage.md)

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

