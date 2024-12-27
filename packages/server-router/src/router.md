Here's a comprehensive guide on how to use the Router utility:

# Router Usage Guide

## Basic Setup

```typescript
import { Router } from './router';

const router = new Router({
  cors: {
    allowedOrigins: ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  debug: true,
});
```

## Route Registration

### Basic Routes

```typescript
// Simple GET route
router.get('/users', {}, async (req) => {
  return new Response(JSON.stringify({ users: [] }));
});

// POST route with body validation
router.post('/users', {
  validation: {
    body: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
  },
}, async (req, { body }) => {
  return new Response(JSON.stringify({ user: body }));
});
```

### Routes with Authentication

```typescript
// Protected route requiring authentication
router.get('/profile', {
  auth: true, // Requires authentication
}, async (req) => {
  const userId = req.auth?.userId;
  return new Response(JSON.stringify({ userId }));
});

// Custom auth configuration
router.get('/admin', {
  auth: {
    roles: ['admin'],
    customCheck: (auth) => auth.isAdmin === true,
  },
}, async (req) => {
  return new Response('Admin only content');
});
```

### Validation Examples

```typescript
// Route with full validation schema
router.post('/items', {
  validation: {
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      filter: z.string().optional(),
    }),
    headers: z.object({
      'x-custom-header': z.string(),
    }),
    body: z.object({
      name: z.string(),
      price: z.number(),
    }),
  },
}, async (req, { params, query, headers, body }) => {
  return new Response(JSON.stringify({ 
    params, 
    query, 
    headers, 
    body 
  }));
});
```

## Middleware

### Global Middleware

```typescript
// Add middleware for all routes
router.use(async (req) => {
  console.log(`${req.method} ${req.url}`);
  return null; // Continue to next middleware/route
});
```

### Path-Specific Middleware

```typescript
// Add middleware for specific path
router.use(async (req) => {
  // Rate limiting logic
  return null;
}, '/api/');
```

## Error Handling

```typescript
const router = new Router({
  onError: (error, req) => {
    console.error(`Error handling ${req.url}:`, error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  },
});
```

## CORS Configuration

```typescript
const router = new Router({
  cors: {
    allowedOrigins: ['https://myapp.com'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Custom-Header'],
    maxAge: 86400,
    credentials: true,
  },
});
```

## Authentication Configuration

```typescript
router.configureAuth({
  verify: async (req) => {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) throw new Error('No token provided');
    
    // Verify token and return auth data
    return {
      userId: 'user_123',
      roles: ['user'],
    };
  },
  onError: (error) => {
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 401 }
    );
  },
});
```

## Handling Requests

```typescript
// In your server code
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const response = await router.handle(req);
    return response || new Response('Not Found', { status: 404 });
  },
});
```

## Type Safety

The router provides full TypeScript support:

```typescript
type UserData = {
  name: string;
  email: string;
};

const validation = {
  body: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
} as const;

router.post<typeof validation>('/users', {
  validation,
}, async (req, { body }) => {
  // body is typed as UserData
  return new Response(JSON.stringify(body));
});
```

## Best Practices

1. Always define validation schemas for request data
2. Use TypeScript for better type safety
3. Implement proper error handling
4. Use middleware for cross-cutting concerns
5. Configure CORS appropriately for your application
6. Keep route handlers focused and simple
7. Use authentication when dealing with sensitive data

This router implementation provides a robust foundation for building type-safe, secure, and well-structured HTTP APIs in Bun/Node.js environments.
