## Deploy Module Usage

### Overview

The `deploy` module in the Bun Nook Kit (BNK) is designed to facilitate deployment processes, specifically integrating with GitHub Actions for streamlined deployment workflows. Based on the `github-actions.ts` script, here's how the module can be effectively utilized.

### Key Features

1. **Logging Standard Output**: Captures and logs the standard output from subprocesses.
2. **GitHub Actions Factory**: Provides functions to create and manage GitHub Actions.
3. **Git Command Execution**: Executes Git commands with logging.
4. **Commit and Push Workflow**: Automates the process of committing changes and pushing to a GitHub repository.
5. **Git Configuration Setup**: Configures Git with user name and email, particularly for GitHub Actions automation.

### Detailed Guide

#### 1. Initializing the Module

Import and initialize the module to access its functionalities:

```typescript
import { createGitHubActionsFactory } from 'path-to-deploy-module';

const githubActions = createGitHubActionsFactory({
  sshRepoUrl: 'your-ssh-repository-url',
});
```

#### 2. Logging Standard Output

To log the standard output from subprocesses:

```typescript
import { logStdOutput } from 'path-to-deploy-module';

const proc = /* your subprocess */;
await logStdOutput(proc);
```

#### 3. Git Command Execution

Run Git commands with the ability to log output:

```typescript
await githubActions.gitCmd(['status']); // Example: Git status
```

#### 4. Commit and Push Workflow

Automate the commit and push process:

```typescript
await githubActions.commitAndPush('Your commit message');
```

#### 5. Setup Git Configuration

Configure Git for GitHub Actions:

```typescript
await githubActions.setupGitConfig({
  githubUsername: 'your-github-username',
  githubEmail: 'your-github-email'
});
```

### Notes

- Ensure that the SSH URL and GitHub credentials are correctly configured for secure and accurate deployment.
- The module is designed to work seamlessly with GitHub Actions, but can be adapted for other CI/CD pipelines.
- Always test the deployment scripts in a controlled environment before integrating into production workflows.

### Conclusion

The `deploy` module within BNK simplifies the deployment process, especially when using GitHub Actions. By utilizing its features, developers can automate and streamline their deployment workflows, ensuring consistent and efficient updates to their projects.
