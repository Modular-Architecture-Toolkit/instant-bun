/// <reference lib="dom" />

type JsonResponseOptions = {
  status?: number;
  headers?: Record<string, string | string[]>;
};

const headersToObject = (headers: Headers): Record<string, string> => {
  const obj: Record<string, string> = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

/**
 * Creates a JSON response with consistent formatting
 * 
 * @example
 * // Success response
 * return json({ name: "John" });
 * 
 * // Error response
 * return json.error("Not found", 404);
 * 
 * // Success with options
 * return json({ data: [] }, { 
 *   status: 201,
 *   headers: { 'Cache-Control': 'no-cache' }
 * });
 */
export const json = Object.assign(
  // Main function for success responses
  function json<T>(
    data: T,
    options: JsonResponseOptions = {}
  ): Response {
    const { status = 200, headers = {} } = options;
    const responseHeaders = new Headers();

    // Set default Content-Type
    responseHeaders.set('Content-Type', 'application/json');

    // Handle headers
    Object.entries(headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // For multiple values (like Set-Cookie), append each one
        value.forEach(v => responseHeaders.append(key, v));
      } else {
        responseHeaders.set(key, value);
      }
    });

    return new Response(JSON.stringify(data === undefined ? null : data), {
      status,
      headers: responseHeaders
    });
  },
  {
    // Method for error responses
    error(
      message: string,
      statusOrOptions?: number | JsonResponseOptions,
      details?: unknown
    ): Response {
      const options: JsonResponseOptions = typeof statusOrOptions === 'number' 
        ? { status: statusOrOptions }
        : statusOrOptions || {};

      const { status = 400, headers = {} } = options;
      
      const errorResponse = {
        error: message,
        ...(details !== undefined && { details })
      };

      return json(errorResponse, { status, headers });
    }
  }
); 