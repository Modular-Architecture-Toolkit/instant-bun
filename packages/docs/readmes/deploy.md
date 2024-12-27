# Deploy - GitHub Actions Utility Module

## Introduction

This GitHub Actions Utility Module is designed for automating Git operations in Node.js applications, particularly within the context of GitHub Actions. Leveraging the power of the Bun runtime, this module simplifies executing Git commands, logging outputs, and configuring Git settings, making it an ideal tool for continuous integration and deployment workflows.

## Features

### Standard Output Logging

- **`logStdOutput(proc: SyncSubprocess)`**: Logs the standard output and standard error of a subprocess, returning both as a response.

### GitHub Actions Factory

- **`createGitHubActionsFactory({ sshRepoUrl })`**: Generates a set of Git command utilities for GitHub Actions, using a provided SSH repository URL.
- **Git Command Execution**: Execute Git commands with optional logging.
- **Commit and Push**: Commit changes and push to the main branch.
- **Setup Git Config**: Configure Git with custom or default GitHub Actions bot user details.

## Usage Examples

### Logging Standard Output

```javascript
import { logStdOutput, SyncSubprocess } from 'bnkit/deploy';

const process = new SyncSubprocess('your-command');
logStdOutput(process);
```

### Creating GitHub Actions Factory

```javascript
import { createGitHubActionsFactory } from 'bnkit/deploy';

const gitUtils = createGitHubActionsFactory({
  sshRepoUrl: 'git@github.com:user/repo.git',
});

// Commit and push changes
gitUtils.commitAndPush('Your commit message');
```

### Configuring Git for GitHub Actions

```javascript
import { createGitHubActionsFactory } from 'bnkit/deploy';

const gitUtils = createGitHubActionsFactory({ 
  sshRepoUrl: 'git@github.com:user/repo.git' 
});

// Setup Git with the default GitHub Actions bot user
gitUtils.setupGitConfig();
```
