# Server Module

## Introduction

The Bun Nook Kit Server Module is a robust solution for building servers in Bun-based applications, emphasizing type safety and modularity. It provides functionalities for request handling, dynamic routing, middleware management, CORS configurations, and server utilities.

## Key Components

### Middleware

Middleware functions process requests before they reach the route handlers. They can modify the request, add data, or perform checks.

### Routes

Routes define the endpoints of your API and their corresponding handlers.

### Server Factory

The serverFactory function creates and configures the server with middleware and routes.

## Usage Examples

### Basic Server Setup

Here's a basic example of setting up a server:

```typescript
import { serverFactory, Routes } from 'bnkit/server';

const routes = {
  '/': {
    get: (request) => {
      return new Response('Hello, World!');
    }
  },
  '/api/data': {
    get: (request) => {
      return new Response(JSON.stringify({ message: 'This is some data' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
} satisfies Routes;

const { start } = serverFactory({ routes });

start(3000);
```

### Setting up Middleware

To set up middleware, you can use the `middlewareFactory`:

```typescript
import { serverFactory, middlewareFactory, Routes, InferMiddlewareDataMap } from 'bnkit/server';

const middleware = {
  auth: async (request, next) => {
    // Perform authentication
    const user = await authenticateUser(request);
    await next();
    return { user };
  },
  logger: async (request, next) => {
    console.log(Request to ${request.url});
    await next();
    return { loggedAt: new Date() };
  },
} satisfies MiddlewareConfigMap;

const middlewareControl = middlewareFactory(middleware);

type MyMiddlewareData = InferMiddlewareDataMap<typeof middleware>;

const routes = {
  '/': {
    get: (request, middlewareData: MyMiddlewareData) => {
      return new Response('Hello, World!');
    }
  },
  '/api/data': {
    get: (request, middlewareData: MyMiddlewareData) => {
      return new Response(JSON.stringify({ message: 'This is some data' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
} satisfies Routes<{ middleware: typeof middleware }>;

const { start } = serverFactory({
  middleware: middlewareControl,
  routes,
});

start(3000);
```

### Configuring and Starting the Server with Middleware

Here's how to set up and start the server with middleware:

```typescript
import { serverFactory, middlewareFactory, MiddlewareConfigMap } from 'bnkit/server';
import { authenticateUser } from './authentication';

const middleware = {
  auth: async (request, next) => {
    // Perform authentication
    const user = await authenticateUser(request);
    await next();
    return { user };
  },
  logger: async (request, next) => {
    console.log(Request to ${request.url});
    await next();
    return { loggedAt: new Date() };
  },
} satisfies MiddlewareConfigMap;


const { start } = serverFactory({
  middleware: middlewareControl,
  routes,
});

start(3000);
```

## CORS Configuration

To configure CORS, you can use the `configCorsMW` function. Here's a full example of how to set up a server with CORS middleware:

```typescript
import { serverFactory, middlewareFactory, configCorsMW, Routes, InferMiddlewareDataMap } from 'bnkit/server';

// Configure CORS middleware
const corsMiddleware = configCorsMW({
  allowedOrigins: ['http://example.com'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
});

// Set up middleware
const middleware = {
  cors: corsMiddleware
} satisfies MiddlewareConfigMap;

// Create middleware control
const middlewareControl = middlewareFactory(middleware);

type MyMiddlewareData = InferMiddlewareDataMap<typeof middleware>;

// Define your routes
const routes = {
  '/': {
    get: (request, middlewareData: MyMiddlewareData) => {
      return new Response('Hello, World!');
    }
  },
  '/api/data': {
    get: (request, middlewareData: MyMiddlewareData) => {
      return new Response(JSON.stringify({ message: 'This is some data' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
} satisfies Routes<{ middleware: typeof middleware }>;

// Create and start the server
const { start } = serverFactory({
  middleware: middlewareControl,
  routes
});

start(3000);
```

This example sets up a server with two routes and CORS middleware. The CORS middleware is configured to:

- Allow requests from 'http://example.com'
- Allow GET, POST, PUT, and DELETE methods
- Allow the 'Content-Type' header
- Allow credentials (cookies, HTTP authentication) to be sent with cross-origin requests

The server will start on port 3000 and apply the CORS middleware to all incoming requests before routing them to the appropriate handler.

## Server Utilities

The server module provides several utility functions:



These utilities include:
- `parseQueryParams`: Parse query parameters from a request
- `parseRequestHeaders`: Parse headers from a request
- `jsonRes`: Create a JSON response
- `htmlRes`: Create an HTML response
- `redirectRes`: Create a redirect response

## Type Safety

The Server Module leverages TypeScript to provide strong type checking:

- Middleware functions are typed with their input and output.
- Routes are typed to match the middleware configuration.
- The serverFactory ensures type consistency between middleware and routes.


## Route Types

The Server Module provides type-safe route definitions using the `Routes` type. Here's an example of how to use it:

```typescript
import type { MiddlewareConfigMap, Routes, RouteHandler, InferMiddlewareDataMap } from 'bnkit/server'
import { serverFactory } from 'bnkit/server'


// Define your routes with type-safe handlers
const routes = {
  '/': {
    get: (request ) => {
      const loggedAt = new Date()
      return new Response(`Hello, test user! Request logged at ${loggedAt}`) 
    },
  },
  '/api/data': {
    get: (request) => {
      // Use middleware data in your handler
      return new Response(
        JSON.stringify({
          message: 'Data',
          user: request.user,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    },
  },
}  satisfies Routes
// if you have middleware, you can add it to the routes like this
//satisfies Routes<{ middleware: typeof middleware }>

// Use the routes in your server factory
const { start } = serverFactory({
  routes,
})

start(3000)

```


This ensures that your routes are correctly typed based on your middleware configuration.

## Integration with Other Modules

The Server Module integrates well with other Bun Nook Kit modules:

- HTMLody for HTML templating
- JWT for authentication
- Cookie for session management
- Files and Folders for static file serving
- Auth for user authentication
- SQLite for database operations

For more detailed usage examples, refer to the individual module documentation.
