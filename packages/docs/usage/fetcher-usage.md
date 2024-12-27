# Fetcher Usage Guide

## Overview

`createFetchFactory` is a TypeScript utility designed for making HTTP requests. It abstracts the complexity of fetch requests, providing a more structured and type-safe way to interact with APIs.

### Importing the Necessary Utilities

To get started, ensure you import the following from `create-fetch-factory`:

```typescript
import { createFetchFactory, FactoryMethods } from "bnkit/fetcher"
```

### Function Signature

`createFetchFactory` is a generic function with the following signature:

```typescript
export function createFetchFactory<TMap extends TypeMap>({
  baseUrl = "",
  config,
  defaultHeaders,
  debug = false,
}: {
  baseUrl?: string;
  debug?: boolean;
  config: Record<keyof TMap, MappedApiConfig<TMap>>;
  defaultHeaders?: Headers;
}): ReturnType<typeof createFetchFactory>;
```

### Parameters

1. **baseUrl** (optional): The base URL for the API.
2. **config**: Configuration for API endpoints.
3. **defaultHeaders** (optional): Default headers for all requests.
4. **debug** (optional): Enables debug mode for extra logging.

### Usage

1. **Setting Up**: Define the types for your API endpoints and initialize the fetch factory.

    ```typescript
    type MyApiMap = {
      // Define your API endpoints here
    };

    const fetchFactory = createFetchFactory<MyApiMap>({
      baseUrl: 'https://my.api/',
      config: {
        // API endpoint configurations
      },
    });
    ```

2. **Making Requests**: Use the methods provided by the fetch factory to make API requests.

    - **GET Request Example**:

      ```typescript
      fetchFactory.get({
        endpoint: 'myEndpoint',
        // Other configurations
      }).then(response => {
        // Handle response
      });
      ```

    - **POST Request Example**:

      ```typescript
      fetchFactory.post({
        endpoint: 'myEndpoint',
        body: JSON.stringify({ key: 'value' }),
        // Other configurations
      }).then(response => {
        // Handle response
      });
      ```

### Advanced Features

- **Custom Headers**: You can pass custom headers for each request.
- **Debug Mode**: Enable debug mode for additional logging, useful for development.
- **Type Safety**: Leverage TypeScript’s type system for safer and more predictable code.

### Summary

The `createFetchFactory` utility simplifies HTTP requests in TypeScript applications, providing a structured, type-safe way to communicate with APIs. Embrace the power of TypeScript to make your data fetching logic more robust and maintainable!

Happy fetching! 🌐🚀💻
