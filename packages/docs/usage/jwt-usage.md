# JWT Usage Guide

Easily handle JWTs accross the stack to 

### Setting the Stage

First, ensure you have the necessary imports from your JWT utilities:

```typescript
import {
  createJwtHeader,
  decodeJwt,
  encrypt,
  encodeJwt,
  decrypt,
  isTokenExpired,
  payloadValidator,
} from "./jwt-server-utils";
import { JwtHeader, JwtPayload, RefreshToken } from "./jwt-types";
```

### Creating a JWT Factory

Let's start by creating a JWT factory function. This factory will be your go-to for creating, validating, and managing JWTs.

```typescript
export const jwtBack = <Payload extends object>({
  factorySignSecret,
  handlers,
  encryption,
}: {
  factorySignSecret: string;
  handlers: JwtHandlers;
  encryption?: {
    encryptionSecret: string;
  };
}) => {
  // ... functions go here
};
```

### Generating Refresh Tokens

Refreshing tokens keeps sessions secure. Here's how to generate them:

```typescript
async function generateRefreshToken(): Promise<string> {
  const refreshToken = crypto.randomBytes(40).toString("hex");
  // Token valid for one week
  const expiresIn = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; 
  const tokenData = { token: refreshToken, exp: expiresIn };
  await handlers.saveRefreshToken(tokenData);
  return refreshToken;
}
```

### Creating JWTs

When creating JWTs, it's important to validate payloads and set expiration times.

```typescript
function createJwt<CreatePayload extends Payload>({
  payload,
  signSecret = factorySignSecret,
  expiresIn = 60 * 60, // Default: 1 hour
  encryptionSecret = encryption?.encryptionSecret,
}): string {
  const finalPayload: JwtPayload<CreatePayload> = { ...payload };
  payloadValidator(payload); // Ensure payload is valid

  const header = createJwtHeader();
  finalPayload.exp = Math.floor(Date.now() / 1000) + expiresIn;

  const jwt = encodeJwt(header, finalPayload, signSecret);
  return encryption && encryptionSecret ? encrypt(jwt, encryptionSecret) : jwt;
}
```

### Verifying JWTs

To verify JWTs, you'll need to decrypt them (if encrypted), check if they're valid or expired, and decode them.

```typescript
async function verifyJwt(
  token: string,
  signSecret: string = factorySignSecret,
  encryptionSecret: string | undefined = encryption?.encryptionSecret
): Promise<{ header: JwtHeader; payload: FactoryJwtPayload }> {
  let decryptedToken: string = token;

  if (encryption && encryptionSecret) {
    decryptedToken = decrypt(token, encryptionSecret);
  }

  if (await isValidToken(token)) {
    throw new Error("This token is blacklisted");
  }

  const { header, payload } = decodeJwt(decryptedToken, signSecret);

  if (isTokenExpired(payload)) {
    throw new Error("Token expired");
  }

  return { header, payload };
}
```

### Blacklisting Tokens

Invalidate tokens as needed to maintain security.

```typescript
async function invalidateToken(token: string): Promise<void> {
  await handlers.addInvalidToken(token);
}
```

### Typed JWTs and Custom Data

- **Typed JWTs**: Ensure your JWTs are typed by extending the `Payload` generic parameter. This allows for IntelliSense and compile-time checks on the payload structure.
- **Inserting Custom Data**: Customize your JWT payloads as needed. Just ensure they adhere to the expected type structure.

### Summary

With these tools, you're well-equipped to handle JWTs on the backend with TypeScript. Remember to handle tokens securely, manage expirations appropriately, and leverage TypeScript's type system for robust and error-free code. Happy coding! 🚀🔒💻
