# NPM Release Usage
### Overview

- The `npm-release-factory` module automates publishing packages to the npm registry, handling tasks like version retrieval, npm authentication setup, version updating, and package publishing with retry mechanisms for conflicts.

### Features

1. **Get Current Version**: Fetches the current package version.
2. **Setup NPM Authentication**: Sets up npm authentication using an npm token.
3. **Update Version**: Updates the package version with an option for alpha versions.
4. **Update Package Version**: Updates the package version in `package.json`.
5. **NPM Publish**: Publishes the package to npm, retrying if version conflicts arise.

### Usage Examples

#### 1. Setting up the Factory

```javascript
import { npmReleaseFactory } from './path-to-npm-release-factory';

const releaseUtils = npmReleaseFactory({
  maxRetries: 5,
  npmToken: 'YOUR_NPM_TOKEN'
});
```

#### 2. Get Current Version

```javascript
const packagePath = './path-to-your-package/package.json';
const currentVersion = await releaseUtils.getCurrentVersion()(packagePath);
console.log(`Current Version: ${currentVersion}`);
```

#### 3. Setup NPM Authentication

```javascript
releaseUtils.setupNpmAuth();
```

#### 4. Update Version

```javascript
const newVersion = releaseUtils.updateVersion('1.0.0', true);
console.log(`New Version: ${newVersion}`);
```

#### 5. Update Package Version in `package.json`

```javascript
const updatedVersion = await releaseUtils.updatePackageVersion(packagePath, true);
console.log(`Updated Version in package.json: ${updatedVersion}`);
```

#### 6. Publish Package to NPM

```javascript
await releaseUtils.npmPublish({
  isAlpha: true,
  packagePath: packagePath
});
```

### Notes

- Ensure you have the required permissions for publishing to npm.
- Double-check versions and configurations before publishing to avoid conflicts or unintended changes.

### Conclusion

The `npm-release` module is a powerful tool for automating and managing npm package releases. By following these updated guidelines, users can efficiently manage their TypeScript projects' release cycles within the BNK ecosystem.