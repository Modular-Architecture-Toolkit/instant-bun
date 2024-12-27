# NPM Release Module

## Overview

The `npm-release-factory` module provides a set of utilities to automate the process of publishing packages to the npm registry. It handles tasks such as getting the current version of a package, setting up npm authentication, updating package versions, and publishing the package. It also offers retry mechanisms to handle potential conflicts when publishing.

## Features

1. **Get Current Version**: Fetches the current version of a package.
2. **Setup NPM Authentication**: Sets up npm authentication using the provided npm token.
3. **Update Version**: Updates the package version, with an option to generate an alpha version.
4. **Update Package Version**: Updates the package version in the package.json file.
5. **NPM Publish**: Publishes the package to the npm registry. In case of version conflicts, it will retry with updated versions for a specified number of times.

## Usage Examples

### 1. Setting up the Factory

First, you need to set up the factory with the desired options:

```javascript
import { npmReleaseFactory } from './path-to-npm-release-factory';

const releaseUtils = npmReleaseFactory({
  maxRetries: 5,
  npmToken: 'YOUR_NPM_TOKEN'
});
```

### 2. Get Current Version

To get the current version of a package:

```javascript
const packagePath = './path-to-your-package/package.json';
const currentVersion = await releaseUtils.getCurrentVersion()(packagePath);
console.log(`Current Version: ${currentVersion}`);
```

### 3. Setup NPM Authentication

You can set up npm authentication as follows:

```javascript
releaseUtils.setupNpmAuth();
```

### 4. Update Version

If you want to update a version, for example, to create an alpha version:

```javascript
const newVersion = releaseUtils.updateVersion('1.0.0', true);
console.log(`New Version: ${newVersion}`);
```

### 5. Update Package Version in package.json

To directly update the version in your package.json:

```javascript
const updatedVersion = await releaseUtils.updatePackageVersion(packagePath, true);
console.log(`Updated Version in package.json: ${updatedVersion}`);
```

### 6. Publish Package to NPM

Finally, to publish your package to the npm registry:

```javascript
await releaseUtils.npmPublish({
  isAlpha: true,
  packagePath: packagePath
});
```

## Note

- Ensure that you have the required permissions to publish to the npm registry.
- Always double-check the versions and configurations before publishing to avoid potential conflicts or unwanted changes.
