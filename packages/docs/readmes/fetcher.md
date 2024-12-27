# Fetcher Module

## Introduction

The Fetcher Module in the Bun Nook Kit is a versatile and type-safe HTTP request tool, enabling developers to make HTTP requests with TypeScript-inferred types. It allows for precise type configurations on fetch operations, ensuring that API interactions are predictable and robust.

## Key Features

### Type-Safe Fetch Operations

- **Type Mapping**: Define TypeScript types for API response and request body structures.
- **Dynamic Endpoint Configurations**: Configure different endpoints with specific request and response types.

### Customizable Request Methods

- **Support for Various HTTP Methods**: Includes methods like `GET`, `POST`, `DELETE`, and more.
- **Form Submission Support**: Specialized functionality for submitting forms with `multipart/form-data`.

### File Downloads and Event Streaming

- **File Download Utility**: Facilitates downloading files directly from the browser.
- **Event Stream Creation**: Enables setting up EventSource for server-sent events.

### Debugging and Error Handling

- **Debug Mode**: Includes a debug flag for logging request and response details.
- **Robust Error Handling**: Provides mechanisms to handle and throw errors based on response statuses.

## Usage Examples

### [Fetcher Usage](usage/fetcher-usage.md) 

### Configuring and Using the Fetcher Factory

```typescript
import { createFetchFactory, HttpMethod } from 'bnkit/fetcher';

const apiConfig = {
  myEndpoint: {
    method: HttpMethod.GET,
    endpoint: "/api/data",
    response: {} as MyResponseType,
  },
  // other endpoints
};

const fetchFactory = createFetchFactory({
  baseUrl: "https://example.com",
  config: apiConfig,
});

// Using the fetcher for 'myEndpoint'
fetchFactory.fetcher({
  endpoint: "myEndpoint",
  params: { /* query params */ },
}).then((response) => {
  // handle response
});
```

### Creating a File Download

```typescript
// Using the fileDownload utility
fetchFactory.fileDownload({
  endpoint: "/api/download",
  filename: "example.pdf",
});
```

### Setting Up an Event Stream

```typescript
// Creating an event stream
fetchFactory.createEventStream("/api/events", {
  message: (event) => console.log(event.data),
});
```
