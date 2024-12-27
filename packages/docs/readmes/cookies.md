# Cookies Module

## Overview

The **Cookie Factory** provides utility functions to manage cookies on both the client and server sides. This all-encompassing module allows for easy setting, getting, deleting, and checking the existence of cookies in various contexts.

## Table of Contents

- [Cookies Module](#cookies-module)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Client-Side 🍪 Usage](#client-side--usage)
  - [Server-Side 🍪 Usage](#server-side--usage)
  - [API](#api)
    - [Client-Side 🍪 API](#client-side--api)
    - [Server-Side 🍪 API](#server-side--api)
  - [Testing](#testing)
  - [Full Stack 🍪 Implementation Example](#full-stack--implementation-example)

## Installation

1🍪 Copy the `cookie-factory.ts` (combined client and server functionality) to your source directory.
2🍪 Import the module using the appropriate import syntax:

```typescript
import {
  createClientCookieFactory,
  createServerCookieFactory,
} from "./path-to/cookie-factory";
```

## Client-Side 🍪 Usage 

First, create an instance of the client-side cookie factory:

```typescript
const clientCookieFactory = createClientCookieFactory();
```

Then, use the methods provided by the factory to manipulate cookies.

## Server-Side 🍪 Usage

Similarly, initialize the server-side cookie factory:

```typescript
const serverCookieFactory = createServerCookieFactory();
```

Utilize the provided methods to manage server-side cookies.

## API

### Client-Side 🍪 API

- **setCookie(name: string, value: string, options: CookieOptions = {})**: Sets a cookie.
- **getCookie(name: string)**: Retrieves the value of a specific cookie.
- **deleteCookie(name: string)**: Deletes a cookie.
- **checkCookie(name: string)**: Checks the existence of a cookie.

### Server-Side 🍪 API

- **setCookie(res: Response, name: string, value: string, options?: CookieOptions)**: Sets a cookie on the server's response object.
- **getCookie(req: Request, name: string)**: Retrieves a cookie's value from the server's request object.
- **deleteCookie(res: Response, name: string)**: Deletes a cookie.
- **checkCookie(req: Request, name: string)**: Checks if a cookie exists on the server's request.

## Testing

- Client-side: The testing file provides a mock for the document object and tests the functionality of each client-side method.
  
- Server-side: The module comes with server-side tests using the `bun:test` library.

## Full Stack 🍪 Implementation Example 

```typescript
// Client
const clientCookieFactory = createClientCookieFactory();

clientCookieFactory.setCookie("session", "abcd1234", { maxAge: 3600, httpOnly: true });

const sessionValue = clientCookieFactory.getCookie("session");

// Server
const serverCookieFactory = createServerCookieFactory();

// route config example 
// ... const routes = {
"/check-session": {
  get: (req) => {
    const session = serverCookieFactory.getCookie(req, "session");
    if (session) {
      res.send("Session is valid!");
    } else {
      res.send("No valid session found.");
    }
  }
}
```

In this example, the client sets a "session" cookie and the server checks for its existence upon a request. This is a basic representation, and actual implementation details might vary based on your stack and requirements.