import { describe, expect, test } from "bun:test";
import { z } from 'zod';
import {
  matchRoute,
  validateRequest,
  ValidationFailedError,
} from './router-utils';
import { getAllowedOrigin, addCorsHeaders } from "./cors-utils";
import { CorsOptions } from "./router-types";

describe("router-utils", () => {

  describe("matchRoute", () => {
    test("matches exact paths without parameters", () => {
      const params = matchRoute('/test', '/test');
      expect(params).toEqual({});
    });

    test("returns null when paths do not match", () => {
      const params = matchRoute('/test', '/not-test');
      expect(params).toBeNull();
    });

    test("extracts single path parameter", () => {
      const params = matchRoute('/users/123', '/users/:id');
      expect(params).toEqual({ id: '123' });
    });

    test("extracts multiple path parameters", () => {
      const params = matchRoute('/users/123/posts/456', '/users/:userId/posts/:postId');
      expect(params).toEqual({ userId: '123', postId: '456' });
    });

    test("returns null when number of segments differ", () => {
      const params = matchRoute('/users/123', '/users/:id/profile');
      expect(params).toBeNull();
    });

    test("returns null when static segments do not match", () => {
      const params = matchRoute('/users/123', '/profiles/:id');
      expect(params).toBeNull();
    });

    test("handles root path", () => {
      const params = matchRoute('/', '/');
      expect(params).toEqual({});
    });

    test("ignores leading and trailing slashes", () => {
      const params = matchRoute('/test/', '/test');
      expect(params).toEqual({});
    });

    test("matches paths with query strings (ignores query)", () => {
      const params = matchRoute('/test?query=1', '/test');
      expect(params).toEqual({});
    });
  });

  describe("validateRequest", () => {
    test("returns parsed data when validation schema is not provided", async () => {
      const req = new Request('http://localhost/test');
      const result = await validateRequest(req, {});
      expect(result).toEqual({
        params: {},
        query: {},
        headers: {},
        body: undefined
      });
    });

    test("validates and returns parsed params successfully", async () => {
      const req = new Request('http://localhost/test');
      const params = { id: '123' };
      const validation = {
        params: z.object({
          id: z.string().min(3)
        })
      };
      const result = await validateRequest(req, params, validation);
      expect(result).toEqual({
        params: { id: '123' },
        query: {},
        headers: {},
        body: undefined
      });
    });

    test("validates and returns parsed query parameters successfully", async () => {
      const req = new Request('http://localhost/test?page=2&limit=10');
      const params = {};
      const validation = {
        query: z.object({
          page: z.string().transform(Number).refine(n => n > 0),
          limit: z.string().transform(Number).refine(n => n > 0)
        })
      };
      const result = await validateRequest(req, params, validation);
      expect(result).toEqual({
        params: {},
        query: { page: 2, limit: 10 },
        headers: {},
        body: undefined
      });
    });

    test("validates and returns parsed headers successfully", async () => {
      const req = new Request('http://localhost/test', {
        headers: { 'x-custom-header': 'value' }
      });
      const params = {};
      const validation = {
        headers: z.object({
          'x-custom-header': z.string()
        })
      };
      const result = await validateRequest(req, params, validation);
      expect(result).toEqual({
        params: {},
        query: {},
        headers: { 'x-custom-header': 'value' },
        body: undefined
      });
    });

    test("validates and returns parsed body successfully", async () => {
      const body = { name: 'John', age: 30 };
      const req = new Request('http://localhost/test', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });
      const params = {};
      const validation = {
        body: z.object({
          name: z.string(),
          age: z.number()
        })
      };
      const result = await validateRequest(req, params, validation);
      expect(result).toEqual({
        params: {},
        query: {},
        headers: { 'content-type': 'application/json' },
        body
      });
    });

    test("throws ValidationFailedError when params are invalid", async () => {
      const req = new Request('http://localhost/test');
      const params = { id: '12' };
      const validation = {
        params: z.object({
          id: z.string().min(3)
        })
      };
      await expect(validateRequest(req, params, validation)).rejects.toThrow(ValidationFailedError);
    });

    test("throws ValidationFailedError when query parameters are invalid", async () => {
      const req = new Request('http://localhost/test?page=-1&limit=10');
      const params = {};
      const validation = {
        query: z.object({
          page: z.string().transform(Number).refine(n => n > 0),
          limit: z.string().transform(Number).refine(n => n > 0)
        })
      };
      await expect(validateRequest(req, params, validation)).rejects.toThrow(ValidationFailedError);
    });

    test("throws ValidationFailedError when headers are invalid", async () => {
      const req = new Request('http://localhost/test');
      const params = {};
      const validation = {
        headers: z.object({
          'x-custom-header': z.string()
        })
      };
      await expect(validateRequest(req, params, validation)).rejects.toThrow(ValidationFailedError);
    });

    test("throws ValidationFailedError when body is invalid", async () => {
      const body = { name: 'John' }; // Missing 'age'
      const req = new Request('http://localhost/test', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });
      const params = {};
      const validation = {
        body: z.object({
          name: z.string(),
          age: z.number()
        })
      };
      await expect(validateRequest(req, params, validation)).rejects.toThrow(ValidationFailedError);
    });

    test("aggregates multiple validation errors", async () => {
      const body = { name: 'Jo' }; // Invalid 'name' and missing 'age'
      const req = new Request('http://localhost/test?page=-1', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {}
      });
      const params = { id: '12' }; // Invalid 'id'
      const validation = {
        params: z.object({
          id: z.string().min(3)
        }),
        query: z.object({
          page: z.string().transform(Number).refine(n => n > 0)
        }),
        body: z.object({
          name: z.string().min(3),
          age: z.number()
        }),
        headers: z.object({
          'content-type': z.string()
        })
      };
      try {
        await validateRequest(req, params, validation);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFailedError);
        const validationError = error as ValidationFailedError;
        expect(validationError.errors.length).toBe(4);
        const errorTypes = validationError.errors.map(e => e.type);
        expect(errorTypes).toContain('params');
        expect(errorTypes).toContain('query');
        expect(errorTypes).toContain('body');
        expect(errorTypes).toContain('headers');
      }
    });

    test("throws ValidationFailedError when body contains invalid JSON", async () => {
      const req = new Request("http://localhost/test", {
        method: "POST",
        body: "Invalid JSON",
        headers: { "Content-Type": "application/json" },
      });
      const validation = {
        body: z.object({
          name: z.string(),
          age: z.number(),
        }),
      };
      await expect(validateRequest(req, {}, validation)).rejects.toThrow(
        ValidationFailedError
      );
    });

    test("returns validation error when body is empty but expected", async () => {
      const req = new Request("http://localhost/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const validation = {
        body: z.object({
          name: z.string(),
        }),
      };
      await expect(validateRequest(req, {}, validation)).rejects.toThrow(
        ValidationFailedError
      );
    });

    test("handles non-JSON content types appropriately", async () => {
      const req = new Request("http://localhost/test", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "Invalid body",
      });
      const validation = {
        body: z.object({
          data: z.string(),
        }),
      };
      await expect(validateRequest(req, {}, validation)).rejects.toThrow(
        ValidationFailedError
      );
    });

    test("provides query parameters to handler when validation is not specified", async () => {
      const req = new Request("http://localhost/test?term=test&sort=asc");
      const result = await validateRequest(req, {});
      expect(result.query).toEqual({ term: "test", sort: "asc" });
    });

    test("handles URL-encoded characters in path parameters", async () => {
      const params = { query: "test%2Fsearch" };
      const validation = {
        params: z.object({
          query: z.string(),
        }),
      };
      const result = await validateRequest(new Request("http://localhost/test"), params, validation);
      expect(result.params.query).toBe("test%2Fsearch");
    });
  });

  describe("getAllowedOrigin", () => {
    test("returns '*' when origin is '*'", () => {
      const corsOptions: CorsOptions = { origin: '*' };
      const allowedOrigin = getAllowedOrigin('http://example.com', corsOptions);
      expect(allowedOrigin).toBe('*');
    });

    test("returns request origin when it matches allowed origin", () => {
      const corsOptions: CorsOptions = { origin: 'http://allowed.com' };
      const allowedOrigin = getAllowedOrigin('http://allowed.com', corsOptions);
      expect(allowedOrigin).toBe('http://allowed.com');
    });

    test("returns empty string when request origin doesn't match allowed origin", () => {
      const corsOptions: CorsOptions = { origin: 'http://allowed.com' };
      const allowedOrigin = getAllowedOrigin('http://example.com', corsOptions);
      expect(allowedOrigin).toBe('');
    });

    test("returns request origin when origin includes request origin", () => {
      const corsOptions: CorsOptions = { origin: ['http://allowed.com', 'http://example.com'] };
      const allowedOrigin = getAllowedOrigin('http://example.com', corsOptions);
      expect(allowedOrigin).toBe('http://example.com');
    });

    test("returns empty string when origin does not include request origin", () => {
      const corsOptions: CorsOptions = { origin: ['http://allowed.com'] };
      const allowedOrigin = getAllowedOrigin('http://example.com', corsOptions);
      expect(allowedOrigin).toBe('');
    });

    test("returns request origin when origin function returns true", () => {
      const corsOptions: CorsOptions = {
        origin: (origin: string) => origin.endsWith('.example.com')
      };
      const allowedOrigin = getAllowedOrigin('http://sub.example.com', corsOptions);
      expect(allowedOrigin).toBe('http://sub.example.com');
    });

    test("returns empty string when origin function returns false", () => {
      const corsOptions: CorsOptions = {
        origin: (origin: string) => origin.endsWith('.allowed.com')
      };
      const allowedOrigin = getAllowedOrigin('http://example.com', corsOptions);
      expect(allowedOrigin).toBe('');
    });
  });

  describe("addCorsHeaders", () => {
    test("adds CORS headers to the response", async () => {
      const response = new Response('OK');
      const req = new Request('http://localhost', {
        headers: { 'origin': 'http://example.com' }
      });
      const corsOptions: CorsOptions = {
        origin: '*',
        methods: ['GET', 'POST'],
        headers: ['Content-Type'],
        credentials: true
      };
      const newResponse = await addCorsHeaders(response, req, corsOptions);
      expect(newResponse.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(newResponse.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST');
      expect(newResponse.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
      expect(newResponse.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    test("does not modify headers when origin is not provided", async () => {
      const response = new Response('OK');
      const req = new Request('http://localhost');
      const corsOptions: CorsOptions = { origin: '*' };
      const newResponse = await addCorsHeaders(response, req, corsOptions);
      expect(newResponse.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    test("sets Access-Control-Allow-Origin based on getAllowedOrigin", async () => {
      const response = new Response('OK');
      const req = new Request('http://localhost', {
        headers: { 'origin': 'http://allowed.com' }
      });
      const corsOptions: CorsOptions = { origin: 'http://allowed.com' };
      const newResponse = await addCorsHeaders(response, req, corsOptions);
      expect(newResponse.headers.get('Access-Control-Allow-Origin')).toBe('http://allowed.com');
    });

    test("handles empty allowed origin", async () => {
      const response = new Response('OK');
      const req = new Request('http://localhost', {
        headers: { 'origin': 'http://disallowed.com' }
      });
      const corsOptions: CorsOptions = { origin: 'http://allowed.com' };
      const newResponse = await addCorsHeaders(response, req, corsOptions);
      expect(newResponse.headers.get('Access-Control-Allow-Origin')).toBe('');
    });

    test("does not modify response body or status", async () => {
      const response = new Response('Original Body', { status: 201 });
      const req = new Request('http://localhost', {
        headers: { 'origin': 'http://example.com' }
      });
      const corsOptions: CorsOptions = { origin: '*' };
      const newResponse = await addCorsHeaders(response, req, corsOptions);
      expect(newResponse.status).toBe(201);
      expect(await newResponse.text()).toBe('Original Body');
    });

    test("handles preflight requests correctly", async () => {
      const response = new Response(null, { status: 204 });
      const req = new Request('http://localhost', {
        method: 'OPTIONS',
        headers: {
          'origin': 'http://example.com',
          'access-control-request-method': 'POST'
        }
      });
      const corsOptions: CorsOptions = {
        origin: '*',
        methods: ['GET', 'POST']
      };
      const newResponse = await addCorsHeaders(response, req, corsOptions);
      expect(newResponse.status).toBe(204);
      expect(newResponse.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(newResponse.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST');
    });

    test("handles preflight requests with unallowed methods", async () => {
      const req = new Request("http://localhost/test", {
        method: "OPTIONS",
        headers: {
          Origin: "http://example.com",
          "Access-Control-Request-Method": "DELETE",
        },
      });
      const corsOptions: CorsOptions = {
        origin: "*",
        methods: ["GET", "POST"],
      };
      const response = new Response(null, { status: 204 });
      const corsResponse = await addCorsHeaders(response, req, corsOptions);
      expect(corsResponse.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST");
    });

    test("handles trailing slashes in paths", async () => {
      const req1 = new Request("http://localhost/test");
      const req2 = new Request("http://localhost/test/");

      const params1 = matchRoute("/test", "/test");
      const params2 = matchRoute("/test/", "/test/");

      expect(params1).toEqual({});
      expect(params2).toEqual({});
    });
  });

});
