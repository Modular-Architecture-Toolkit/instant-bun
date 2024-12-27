# Modules
Modules are the core building blocks of Bun Nook Kit, each module was designed to be operate independently. So plug any module into any project that can run Bun or start building your next stack with multiple modules to build your own stack. Of course the [CLI](bnk-cli/bnk-cli-readme) is the quickest way to get started with a BNK project.

---
### [🖥️ CLI](readmes/cli.md)
1. Different from the bash CLI `bnkit`, the the CLI module aims to provide a simple way to build a basic command-line interface for tasks such as project scaffolding or generating configurations. It helps you handle command-line input, parse arguments, and interact with the file system. The  built in CLI doesn't use it so you can use the BNKit with no dependencies at all.

### [🍪 Cookies](readmes/cookies.md)
4. The Cookie module provides utilities for handling cookies on both the client-side and server-side. It allows you to set, get, and delete cookies, as well as manage cookie options such as expiration and domain.

### [💿 Data Gen](readmes/data-gen.md)
6. The Data Gen module is a simple data generator that allows you to create mock data for testing purposes. While it may not replace more robust data generation tools, it provides a quick and easy way to generate sample data.

### [🏗️ Deploy](readmes/deploy.md):
8. The Deploy module provides utilities for deployment, with a focus on GitHub Actions integration. It helps you automate the deployment process for your Bun Nook Kit package.

### [🐶🦴 Fetcher](readmes/fetcher.md):
##### [Fetcher Usage](usage/fetcher-usage.md) 
- The Fetcher module enhances the standard fetch function provided by Bun. It allows you to configure an entire API and provides a TypeScript interface for easy integration with your project. The Fetcher module helps you make HTTP requests and handles data fetching and updating.


### [📂Files Folder](readmes/files-folder.md):
##### [Files Folder Usage](usage/files-folders-usage.md)
- The Files Folder module provides various utilities for working with files and folders. It includes functions for searching for files, validating file paths, and creating references to files. This module can be useful for tasks like building an in-browser file manager.

### [🔐Auth](readmes/auth.md):
- The auth module provides offers utilities for encryption of passwords/data.

### [📜HTMLody](readmes/htmlody.md):
##### [HTMLody Usage](usage/htmlody-usage.md)
- HTMLody is a tool that enables the conversion of JSON structures into valid HTML and CSS, facilitating both dynamic HTML generation and the export of static assets for enhanced web performance. It offers a flexible and maintainable approach to web development, with support for plugins with prebuilt plugins such as Tailwind-like CSS class utilties and a render Markdown plugin utility, easily integrate with libraries like HTMX for dynamic functionality, and a comprehensive TypeScript support for defining and customizing the JSON elements.

### [🔎JWT](readmes/jwt.md):
##### [JWT Usage](usage/jwt-usage.md)
-  The JWT module provides utilities for working with JSON Web Tokens. It allows you to encode and decode JWTs and provides features like token invalidation.

### [🪵Logger](readmes/logger.md):
- The Logger module aims to provide a full-featured logging system for your application. While it is still under development and might be limited in functionality, it can be a useful tool for debugging and error tracking.

### [📦NPM](readmes/npm-release.md)
- Release: The NPM Release module provides utilities for managing NPM packages. It allows you to update the package version, retrieve the package version, and set up npm authentication. This module can be used in conjunction with the Deploy module for publishing NPM packages

### [🌎Server](readmes/server.md)
##### [Server Usage](usage/server-usage.md)
- The Server module is one of the most complex modules in Bun Nook Kit. It helps you set up an HTTP server with various middleware options. It simplifies tasks like handling CORS and provides a TypeScript interface for type-safe request handlers. The goal is to provide seamless and type safe server configurations.

### [📝SQLite](readmes/sqlite.md)
##### [SQLite Usage](usage/sqlite-usage.md)
- The SQLite module builds on top of Bun's SQLite implementation and provides utilities for working with SQLite databases. It includes functions for instantiating databases, creating type-safe schemas, and performing database operations.

###  [🔄State Management](readmes/state.md)
##### [State Management Usage](usage/state-usage.md)
- The State Management module provides an interface for building type-safe state managers. It offers an immutable state management approach and includes dispatcher functions for easy data manipulation. The module also provides a WebSocket state manager for syncing data between the client and server.

###  [🛠️Utils](readmes/utils.md)
- This isn't really a module :) - it does contains various utility functions that can be used across different modules. It includes functions like classy for generating class names, normalizeBytes for converting byte numbers to formatted text, and value checkers for inferring data types.

### [🆔UUID](readmes/uuid.md):
##### [UUID Usage](usage/uuid-usage.md)
- Generate timestamp encoded UUIDs with UUIDv7 spec implementedÏ

### [🧙‍♂️Type Utils](readmes/type-utils.md)
- TypeScript Utilities

### [✅Validation]
- The Validation module aims to provide a comprehensive suite of validation functions. It includes functions for checking the validity of API data and can be used to ensure data integrity and accuracy.