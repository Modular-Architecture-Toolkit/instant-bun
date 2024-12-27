# Auth Module

## Introduction

The Auth module is a foundational component of the Bun Nook Kit, designed to streamline the creation and verification of security tokens. This module ensures robust authentication mechanisms, facilitating secure user sessions and API requests within applications built using Bun Nook Kit.

## Features

- **Token Generation:** Utilize modern cryptographic algorithms to generate secure tokens, uniquely identifying user sessions or requests.
- **Token Verification:** Verify the authenticity of tokens with efficient and secure methods, ensuring they are valid and untampered.
- **Token Expiration Management:** Automatically calculate and manage token expiration times to maintain the integrity of the authentication process.

## Usage

To use the Auth module within your Bun Nook Kit project, you can import the necessary functions as follows:

```typescript
import {
  createSecurityToken,
  verifyToken,
  getTokenExpireEpoch
} from 'bnkit/auth';
```

Here's a quick example to create and verify a token:

```typescript
import { createSecurityToken, verifyToken } from 'bnkit/auth';

async function demoAuth() {
  // Create a new security token
  const token = await createSecurityToken(3600); // Token valid for 1 hour

  // Verify the token
  const isValid = await verifyToken(token, 'your-salt', 'stored-hash');
  console.log(isValid ? 'Token is valid!' : 'Token is invalid.');
}
```

## API Reference

Below is the detailed API reference for each function available in the Auth module:

- `createSecurityToken(tokenValidTime: number, currentDate?: Date)`: Generates a new security token with a specified validity period.
- `verifyToken(tokenString: string, salt: string, storedHash: string)`: Verifies a token against a stored hash using a salt.
- `getTokenExpireEpoch(date: Date, tokenValidTimeSec: number)`: Calculates the expiration epoch time for a given token.
