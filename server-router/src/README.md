# Router Usage Guide

## Overview

This router provides a flexible and type-safe way to build HTTP APIs. It supports:

- Multiple HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
- Path parameters (e.g., `/users/:id`)
- Request validation (params, query, headers, body)
- Authentication integration
- CORS configuration
- Middleware (global, path-based, and route-level)
- Plugins for extensibility
- Custom error handling
- Built-in JSON response utilities

## Basic Setup

```typescript
import { Router } from '@bnk/router';

const router = new Router({
  // Optional global configurations
  cors: {
    origin: '*',  // or specific origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    headers: ['Content-Type', 'Authorization'],
  },
  debug: true, // Enable debug mode if needed
});
```

## Adding Routes

```typescript
import { z } from 'zod';

// Simple GET route with no validation or auth
await router.get('/health', {}, async () => {
  return new Response(JSON.stringify({ status: 'ok' }));
});

// POST route with body validation using Zod
await router.post('/users', {
  validation: {
    body: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
  },
}, async (req, { body }) => {
  // body is typed and validated
  const newUser = { id: 1, ...body };
  return new Response(JSON.stringify(newUser), { status: 201 });
});
```

### Path Parameters

```typescript
// GET route with path parameters
await router.get('/users/:id', {}, async (_req, { params }) => {
  // params.id is available and can be validated if needed
  return new Response(JSON.stringify({ userId: params.id }));
});
```

## Handling JSON Responses

### Success Responses

Use the `json` utility to return consistently formatted JSON responses. By default, `json(data)` returns a `200` status code with `application/json` content type.

```typescript
import { json } from '@bnk/router';

// Return a simple JSON response
await router.get('/info', {}, async () => {
  return json({ message: 'Hello, world!' });
});

// Custom status code and headers
await router.get('/created', {}, async () => {
  return json({ created: true }, {
    status: 201,
    headers: { 'Cache-Control': 'no-cache' }
  });
});
```

### Error Responses

Use `json.error(message, statusOrOptions, details)` to return JSON error responses. Defaults to `400` if no status is provided.

```typescript
// Basic error response
await router.get('/error-example', {}, async () => {
  return json.error('Something went wrong');
});

// Custom status
await router.get('/not-found', {}, async () => {
  return json.error('Not Found', 404);
});

// Error with details
await router.get('/validation-failed', {}, async () => {
  return json.error('Validation failed', 400, { field: 'email', reason: 'Invalid format' });
});
```

These utilities ensure all JSON responses are properly formatted and typed, making error handling more consistent.

## Authentication

The router supports authentication at a global or route-specific level.

### Global Authentication Configuration

```typescript
router.configureAuth({
  verify: async (req) => {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) throw new Error('No token provided');
    // Verify token and return user data
    return { userId: 'user_123' };
  },
  onError: (error) => {
    return json.error('Authentication failed', 401, { message: error.message });
  }
});
```

### Protected Routes

```typescript
// Route requires authentication
await router.get('/profile', {
  auth: true,
}, async (req) => {
  // req.auth is populated with user data if authentication succeeds
  return json({ userId: req.auth?.userId });
});

// Route with a route-specific auth config
await router.get('/admin', {
  auth: {
    verify: async () => ({ userId: 'admin_1', isAdmin: true }),
    onError: () => json.error('Not authorized', 403)
  }
}, async (req) => {
  return json({ secret: 'admin info' });
});
```

If `auth` is `true`, the global auth configuration is used. If it's an object, that route uses its own auth logic.

## Validation

You can validate `params`, `query`, `headers`, and `body` using [Zod](https://zod.dev/):

```typescript
import { z } from 'zod';

await router.post('/items/:id', {
  validation: {
    params: z.object({ id: z.string().uuid() }),
    query: z.object({ filter: z.string().optional() }),
    headers: z.object({ 'x-api-key': z.string() }),
    body: z.object({ name: z.string(), price: z.number() }),
  },
}, async (req, { params, query, headers, body }) => {
  // All fields are properly validated and typed
  return json({ params, query, headers, body });
});
```

If validation fails, the router returns a `400` error with details about the validation issues.

## Middleware

### Global Middleware

Global middleware run before any route handlers:

```typescript
router.use(async (req) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  return null; // Continue processing
});
```

### Path-Based Middleware

Middleware can also apply only to certain paths:

```typescript
router.use(async (req) => {
  // Rate limit logic
  return null;
}, '/api/');
```

### Route-Level Middleware

Route-level middleware run after global/path-based middleware but before the route handler:

```typescript
await router.get('/secure', {
  middleware: [
    async (req) => {
      if (!req.headers.get('x-secret-key')) {
        return json.error('Forbidden', 403);
      }
      return null;
    }
  ]
}, async (req) => {
  return json({ secure: true });
});
```

## Error Handling

By default, uncaught errors return a `500` response. You can provide a custom global error handler:

```typescript
const router = new Router({
  onError: (error, req) => {
    console.error(`Error on ${req.method} ${req.url}:`, error);
    return json.error('Internal Server Error', 500);
  },
});
```

## CORS

CORS can be configured globally:

```typescript
const router = new Router({
  cors: {
    origin: ['https://myapp.com'],
    methods: ['GET', 'POST'],
    credentials: true,
    headers: ['Content-Type', 'Authorization'],
  },
});
```

Preflight `OPTIONS` requests and response headers are automatically handled.

## Plugins

The router supports plugins to add custom behavior:

```typescript
const myPlugin = {
  name: 'my-plugin',
  onInit(router) { console.log('Plugin initialized'); },
  onRequest(req) {
    // Intercept requests if needed
    return null;
  },
  onError(error, req) {
    // Handle errors
    return null;
  }
};

await router.registerPlugin(myPlugin);
```

## Handling Incoming Requests

In your server code:

```typescript
import { serve } from 'bun';

const server = serve({
  port: 3000,
  async fetch(req) {
    const response = await router.handle(req);
    return response || new Response('Not Found', { status: 404 });
  },
});
```

## Type Safety

Since the router uses TypeScript and Zod, you get full type inference for your route handlers:

```typescript
const validation = {
  body: z.object({
    name: z.string().min(3),
    age: z.number().int().min(18),
  }),
} as const;

await router.post<typeof validation>('/users', { validation }, async (_req, { body }) => {
  // body: { name: string; age: number }
  return json(body, { status: 201 });
});
```

---

## Best Practices

1. **Validate all Inputs:** Ensure `params`, `query`, `headers`, and `body` are validated for every route.
2. **Use the `json` Utility:** Always return JSON responses with `json()` or `json.error()` for consistent formatting.
3. **Handle Errors Gracefully:** Use a global error handler and `json.error()` for predictable error responses.
4. **Modularize Auth & Middleware:** Keep authentication logic and middleware separate from route handlers.
5. **Embrace TypeScript & Zod:** Leverage static types and runtime validation for robust, maintainable APIs.
