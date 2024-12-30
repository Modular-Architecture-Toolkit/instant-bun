### Registering Error Handling Plugin With Router

```ts
import { Router, ErrorHandlingPlugin, ApiError} from '@bnk/router';

async function createRouter() {
  const router = new Router({
    onError: (error, req) => {
      // If you want the plugin to handle everything, just return null here
      // or rely entirely on the plugin. The plugin will handle errors anyway.
      return null;
    },
  });

  // Register the plugin
  await router.registerPlugin(
    new ErrorHandlingPlugin({
      logErrors: true,
      exposeStackTrace: false, // set to true only if needed
      logger: (error) => {
        console.error(`[ErrorHandlingPlugin]`, error);
      },
    })
  );

  // Example route throwing a custom ApiError
  await router.get('/throw-error', {}, async () => {
    throw new ApiError('This is a test error', 400, 'TEST_ERROR', {
      additional: 'info',
    });
  });

  // Another route using the json.error helper directly
  await router.get('/manual-error', {}, async () => {
    return json.error('Manual error message', 403, { reason: 'Forbidden' });
  });

  return router;
}

export { createRouter };
```

### Handling Errors With Third-Party APIs

```ts
import { ApiError } from '@bnk/server-router';

interface ThirdPartyCallOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

export async function handleThirdPartyCall<T>(
  fn: () => Promise<T>,
  opts: ThirdPartyCallOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 200
  } = opts;

  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;
      // Exponential backoff
      await new Promise(res => setTimeout(res, baseDelayMs * Math.pow(2, attempt)));
    }
  }

  // After all retries failed, throw a typed ApiError
  throw new ApiError(
    'Third-party request failed',
    503, // or 502, or any relevant status
    'THIRD_PARTY_FAILURE',
    { cause: (lastError as Error)?.message }
  );
}
```
