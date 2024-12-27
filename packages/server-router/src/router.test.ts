import { describe, expect, test } from "bun:test";
import { Router } from "./router";
import { z } from "zod";
import { CorsPlugin } from "./cors-plugin";
import { HttpMethod } from '@bnk/cors';

describe("Router", () => {
  test("handles GET request with exact path match", async () => {
    const router = new Router();
    router.get("/test", {}, (req) => new Response("test response"));

    const request = new Request("http://localhost/test", {
      method: "GET",
    });
    const response = await router.handle(request);

    expect(response).not.toBeNull();
    expect(await response?.text()).toBe("test response");
  });

  test("matches exact paths correctly", async () => {
    const router = new Router();
    await router.get("/test", {}, () => new Response("test"));

    const match = router.matchRouteHandler("GET", "/test");
    expect(match).toBeTruthy();
    expect(match?.params).toEqual({});
  });

  test("matches paths with parameters", async () => {
    const router = new Router();
    await router.get("/users/:id", {}, () => new Response());

    const match = router.matchRouteHandler("GET", "/users/123");
    expect(match).toBeTruthy();
    expect(match?.params).toEqual({ id: "123" });
  });

  test("returns null for unmatched paths", async () => {
    const router = new Router();
    await router.get("/test", {}, () => new Response());

    const match = router.matchRouteHandler("GET", "/nonexistent");
    expect(match).toBeNull();
  });

  test("handles POST request with exact path match", async () => {
    const router = new Router();
    router.post("/submit", {}, (req) => new Response("submitted"));

    const request = new Request("http://localhost/submit", {
      method: "POST",
    });
    const response = await router.handle(request);

    expect(response).not.toBeNull();
    expect(await response?.text()).toBe("submitted");
  });

  test("handles path parameters correctly", async () => {
    const router = new Router();
    router.get("/users/:id", {}, (req, { params }) => {
      return new Response(`User ${params.id}`);
    });

    const request = new Request("http://localhost/users/123", {
      method: "GET",
    });
    const response = await router.handle(request);

    expect(response).not.toBeNull();
    expect(await response?.text()).toBe("User 123");
  });

  test("returns 404 response for unmatched path", async () => {
    const router = new Router();
    const request = new Request("http://localhost/nonexistent", {
      method: "GET",
    });
    const response = await router.handle(request);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(404);
    const body = await response?.json();
    expect(body).toEqual({ error: "Not Found" });
  });

  test("returns 404 response for unmatched method", async () => {
    const router = new Router();
    const request = new Request("http://localhost/test", {
      method: "POST",
    });
    const response = await router.handle(request);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(404);
    const body = await response?.json();
    expect(body).toEqual({ error: "Not Found" });
  });

  test("handles multiple path parameters", async () => {
    const router = new Router();
    router.get("/users/:userId/posts/:postId", {}, (req, { params }) => {
      return new Response(`User ${params.userId}, Post ${params.postId}`);
    });

    const request = new Request("http://localhost/users/123/posts/456", {
      method: "GET",
    });
    const response = await router.handle(request);

    expect(response).not.toBeNull();
    expect(await response?.text()).toBe("User 123, Post 456");
  });

  test("should handle basic routes", async () => {
    const router = new Router();
    router.get("/test", {}, () => new Response("test"));

    const req = new Request("http://localhost/test");
    const res = await router.handle(req);

    expect(res?.status).toBe(200);
    expect(await res?.text()).toBe("test");
  });

  test("should handle path parameters", async () => {
    const router = new Router();
    router.get("/test/:id", {}, (_, { params }) => new Response(params.id));

    const req = new Request("http://localhost/test/123");
    const res = await router.handle(req);

    expect(res?.status).toBe(200);
    expect(await res?.text()).toBe("123");
  });

  test("should validate request parameters", async () => {
    const router = new Router();
    router.get(
      "/test/:id",
      {
        validation: {
          params: z.object({
            id: z.string().min(3)
          })
        }
      },
      (_, { params }) => new Response(params.id)
    );

    // Valid request
    const validReq = new Request("http://localhost/test/123");
    const validRes = await router.handle(validReq);
    expect(validRes?.status).toBe(200);
    expect(await validRes?.text()).toBe("123");

    // Invalid request
    const invalidReq = new Request("http://localhost/test/12");
    const invalidRes = await router.handle(invalidReq);
    expect(invalidRes?.status).toBe(400);
    const errorBody = await invalidRes?.json() as { error: string; details: Array<{ type: string }> };
    expect(errorBody.error).toBe("Validation failed");
    expect(errorBody.details[0].type).toBe("params");
  });

  test("should validate request body", async () => {
    const router = new Router();
    router.post(
      "/test",
      {
        validation: {
          body: z.object({
            name: z.string().min(3),
            age: z.number().min(18)
          })
        }
      },
      async () => new Response("success")
    );

    // Valid request
    const validReq = new Request("http://localhost/test", {
      method: "POST",
      body: JSON.stringify({ name: "John", age: 25 })
    });
    const validRes = await router.handle(validReq);
    expect(validRes?.status).toBe(200);

    // Invalid request - missing required field
    const invalidReq = new Request("http://localhost/test", {
      method: "POST",
      body: JSON.stringify({ name: "Jo" })
    });
    const invalidRes = await router.handle(invalidReq);
    expect(invalidRes?.status).toBe(400);
    const errorBody = await invalidRes?.json();
    expect(errorBody.error).toBe("Validation failed");
    expect(errorBody.details[0].type).toBe("body");
  });

  test("should validate query parameters", async () => {
    const router = new Router();
    router.get(
      "/test",
      {
        validation: {
          query: z.object({
            page: z.string().transform(Number).refine((n) => n > 0),
            limit: z.string().transform(Number).refine((n) => n > 0)
          })
        }
      },
      () => new Response("success")
    );

    // Valid request
    const validReq = new Request("http://localhost/test?page=1&limit=10");
    const validRes = await router.handle(validReq);
    expect(validRes?.status).toBe(200);

    // Invalid request
    const invalidReq = new Request("http://localhost/test?page=0&limit=10");
    const invalidRes = await router.handle(invalidReq);
    expect(invalidRes?.status).toBe(400);
    const errorBody = await invalidRes?.json();
    expect(errorBody.error).toBe("Validation failed");
    expect(errorBody.details[0].type).toBe("query");
  });
});

describe("Router with global middleware", () => {
  test("global middleware runs for all routes", async () => {
    const router = new Router();
    const executionOrder: string[] = [];

    router.use(async (req) => {
      executionOrder.push('global');
      return null;
    });

    router.get("/route1", {}, (req) => {
      executionOrder.push('route1');
      return new Response("route1");
    });

    router.get("/route2", {}, (req) => {
      executionOrder.push('route2');
      return new Response("route2");
    });

    await router.handle(new Request("http://localhost/route1", { method: "GET" }));
    expect(executionOrder).toEqual(['global', 'route1']);

    executionOrder.length = 0; // Clear array

    await router.handle(new Request("http://localhost/route2", { method: "GET" }));
    expect(executionOrder).toEqual(['global', 'route2']);
  });

  test("global middleware can block requests before reaching routes", async () => {
    const router = new Router();

    router.use(async (req) => {
      return new Response("Blocked by global middleware", { status: 403 });
    });

    router.get("/test", {}, (req) => new Response("test"));

    const response = await router.handle(
      new Request("http://localhost/test", { method: "GET" })
    );

    expect(response).not.toBeNull();
    expect(response?.status).toBe(403);
    expect(await response?.text()).toBe("Blocked by global middleware");
  });
});

describe("Router DELETE method", () => {
  test("handles DELETE request with exact path match", async () => {
    const router = new Router();
    router.delete("/resource", {}, (req) => new Response("deleted", { status: 200 }));

    const request = new Request("http://localhost/resource", {
      method: "DELETE",
    });
    const response = await router.handle(request);

    expect(response).not.toBeNull();
    expect(response?.status).toBe(200);
    expect(await response?.text()).toBe("deleted");
  });

  test("handles DELETE request with path parameters", async () => {
    const router = new Router();
    router.delete("/users/:id", {}, (req, { params }) => {
      return new Response(`Deleted user ${params.id}`, { status: 200 });
    });

    const request = new Request("http://localhost/users/123", {
      method: "DELETE",
    });
    const response = await router.handle(request);

    expect(response).not.toBeNull();
    expect(await response?.text()).toBe("Deleted user 123");
  });
});

describe("Router PATCH method", () => {
  test("handles PATCH request with exact path match", async () => {
    const router = new Router();
    router.patch("/resource", {}, async (req) => {
      const body = await req.json();
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });

    const request = new Request("http://localhost/resource", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updated: true })
    });
    const response = await router.handle(request);

    expect(response).not.toBeNull();
    expect(response?.status).toBe(200);
    const body = await response?.json();
    expect(body).toEqual({ updated: true });
  });

  test("handles PATCH request with path parameters", async () => {
    const router = new Router();
    router.patch("/users/:id", {}, async (req, { params }) => {
      const body = await req.json() as Record<string, unknown>;
      return new Response(JSON.stringify({
        id: params.id,
        ...body
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });

    const request = new Request("http://localhost/users/123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Name" })
    });
    const response = await router.handle(request);

    expect(response).not.toBeNull();
    const body = await response?.json();
    expect(body).toEqual({
      id: "123",
      name: "Updated Name"
    });
  });
});

describe("Router method interaction", () => {
  test("different methods with same path are handled correctly", async () => {
    const router = new Router();

    router.get("/resource", {}, (req) => new Response("GET"));
    router.post("/resource", {}, (req) => new Response("POST"));
    router.patch("/resource", {}, (req) => new Response("PATCH"));
    router.delete("/resource", {}, (req) => new Response("DELETE"));

    // Test GET
    const getResponse = await router.handle(
      new Request("http://localhost/resource", { method: "GET" })
    );
    expect(await getResponse?.text()).toBe("GET");

    // Test POST
    const postResponse = await router.handle(
      new Request("http://localhost/resource", { method: "POST" })
    );
    expect(await postResponse?.text()).toBe("POST");

    // Test PATCH
    const patchResponse = await router.handle(
      new Request("http://localhost/resource", { method: "PATCH" })
    );
    expect(await patchResponse?.text()).toBe("PATCH");

    // Test DELETE
    const deleteResponse = await router.handle(
      new Request("http://localhost/resource", { method: "DELETE" })
    );
    expect(await deleteResponse?.text()).toBe("DELETE");
  });
});

describe("Router with Authentication", () => {
  test("handles successful authentication", async () => {
    const router = new Router();
    const mockUser = { userId: "123" };

    router.configureAuth({
      verify: async (req) => mockUser,
    });

    router.get(
      "/protected",
      {
        auth: true
      },
      (req) => {
        expect(req.auth).toEqual(mockUser);
        return new Response("protected data");
      }
    );

    const request = new Request("http://localhost/protected");
    const response = await router.handle(request);

    expect(response).not.toBeNull();
    expect(response?.status).toBe(200);
    expect(await response?.text()).toBe("protected data");
  });

  test("handles failed authentication", async () => {
    const router = new Router();
    const errorMessage = "Invalid access token";

    router.configureAuth({
      verify: async () => {
        throw new Error(errorMessage);
      },
      onError: (error) => new Response("Custom error response", { status: 401 })
    });

    router.get(
      "/protected",
      {
        auth: true
      },
      () => new Response("protected data")
    );

    const request = new Request("http://localhost/protected");
    const response = await router.handle(request);

    expect(response?.status).toBe(401);
    expect(await response?.text()).toBe("Custom error response");
  });


  // TODO: FIX THIS TEST
  // test("handles route-specific authentication", async () => {
  //   const router = new Router();
  //   const mockUser = { userId: "123" };

  //   // Route-specific auth config
  //   const routeAuth = {
  //     verify: async () => mockUser,
  //     onError: (error: unknown) => new Response("Route-specific error", { status: 401 })
  //   };

  //   router.get(
  //     "/protected",
  //     {
  //       auth: routeAuth
  //     },
  //     (req) => {
  //       expect(req.auth).toEqual(mockUser);
  //       return new Response("protected data");
  //     }
  //   );

  //   const request = new Request("http://localhost/protected");
  //   const response = await router.handle(request);

  //   expect(response?.status).toBe(200);
  //   expect(await response?.text()).toBe("protected data");
  // });

  test("bypasses authentication for routes without auth config", async () => {
    const router = new Router();

    router.configureAuth({
      verify: async () => {
        throw new Error("Should not be called");
      }
    });

    router.get("/public", {}, () => new Response("public data"));

    const request = new Request("http://localhost/public");
    const response = await router.handle(request);

    expect(response?.status).toBe(200);
    expect(await response?.text()).toBe("public data");
  });

  // TODO: FIX THIS TEST
  // test("handles missing global auth config", async () => {
  //   const router = new Router();

  //   router.get(
  //     "/protected",
  //     {
  //       auth: true
  //     },
  //     () => new Response("protected data")
  //   );

  //   const request = new Request("http://localhost/protected");
  //   const response = await router.handle(request);

  //   expect(response?.status).toBe(500);
  //   const body = await response?.json();
  //   expect(body.message).toBe("Authentication is required but no auth config was provided");
  // });
});

describe("Router with Middleware", () => {
  test("executes route middleware before handler", async () => {
    const router = new Router();
    const executionOrder: string[] = [];

    const middleware = async (req: Request) => {
      executionOrder.push('route middleware');
      return null;
    };

    router.get(
      "/test",
      {
        middleware: [middleware]
      },
      (req) => {
        executionOrder.push('handler');
        return new Response("test");
      }
    );

    await router.handle(new Request("http://localhost/test"));
    expect(executionOrder).toEqual(['route middleware', 'handler']);
  });

  test("middleware can block request", async () => {
    const router = new Router();
    const middleware = async (req: Request) => {
      return new Response("Blocked by middleware", { status: 403 });
    };

    router.get(
      "/test",
      {
        middleware: [middleware]
      },
      (req) => new Response("test")
    );

    const response = await router.handle(new Request("http://localhost/test"));
    expect(response?.status).toBe(403);
    expect(await response?.text()).toBe("Blocked by middleware");
  });
});

describe("Router with CORS", () => {
  test("adds CORS headers to regular responses", async () => {
    const router = new Router();
    await router.registerPlugin(new CorsPlugin({
      origin: 'http://localhost:4200'
    }));

    router.get("/test", {}, () => new Response("test"));

    const request = new Request("http://localhost/test", {
      method: "GET",
      headers: {
        'Origin': 'http://localhost:4200'
      }
    });

    const response = await router.handle(request);
    expect(response?.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:4200');
  });

  test("includes CORS headers on 404 when CORS is enabled", async () => {
    const router = new Router();
    await router.registerPlugin(new CorsPlugin({
      origin: 'http://localhost:3000'
    }));

    const req = new Request("http://localhost/unknown", {
      method: "GET",
      headers: {
        "Origin": "http://localhost:3000"
      }
    });
    const res = await router.handle(req);
    expect(res?.status).toBe(404);
    expect(res?.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
  });
});

describe("Router Error Handling", () => {
  test("handles uncaught errors with default handler", async () => {
    const router = new Router();

    router.get(
      "/error",
      {},
      () => {
        throw new Error("Test error");
      }
    );

    const response = await router.handle(new Request("http://localhost/error"));
    expect(response?.status).toBe(500);

    const body = await response?.json();
    expect(body.error).toBe("Internal Server Error");
  });

  test("uses custom error handler when provided", async () => {
    const router = new Router({
      onError: (error, req) => new Response(
        JSON.stringify({ customError: (error as Error).message }),
        { status: 400 }
      )
    });

    router.get(
      "/error",
      {},
      () => {
        throw new Error("Custom error");
      }
    );

    const response = await router.handle(new Request("http://localhost/error"));
    expect(response?.status).toBe(400);

    const body = await response?.json();
    expect(body.customError).toBe("Custom error");
  });

  test("handles different error types appropriately", async () => {
    const router = new Router();

    router.get("/error-string", {}, () => {
      throw "String error";
    });

    router.get("/error-object", {}, () => {
      throw new Error("Object error");
    });

    const stringResponse = await router.handle(
      new Request("http://localhost/error-string")
    );
    expect(stringResponse?.status).toBe(500);
    const stringBody = await stringResponse?.json();
    expect(stringBody.message).toBe("An unexpected error occurred.");

    const objectResponse = await router.handle(
      new Request("http://localhost/error-object")
    );
    expect(objectResponse?.status).toBe(500);
    const objectBody = await objectResponse?.json();
    expect(objectBody.message).toBe("Object error");
  });
});

describe("Router with Multiple Global Middlewares", () => {
  test("executes multiple global middlewares in order", async () => {
    const router = new Router();
    const executionOrder: string[] = [];

    router.use(async () => { executionOrder.push('global1'); return null; });
    router.use(async () => { executionOrder.push('global2'); return null; });

    router.get("/test", {}, () => {
      executionOrder.push('handler');
      return new Response("ok");
    });

    const req = new Request("http://localhost/test");
    await router.handle(req);

    expect(executionOrder).toEqual(['global1', 'global2', 'handler']);
  });

  test("global middleware stops execution when returning response", async () => {
    const router = new Router();
    const executionOrder: string[] = [];

    router.use(async () => {
      executionOrder.push('global1');
      return new Response("stopped", { status: 403 });
    });
    router.use(async () => { executionOrder.push('global2'); return null; });

    router.get("/test", {}, () => {
      executionOrder.push('handler');
      return new Response("ok");
    });

    const req = new Request("http://localhost/test");
    const res = await router.handle(req);

    expect(res?.status).toBe(403);
    expect(await res?.text()).toBe("stopped");
    expect(executionOrder).toEqual(['global1']);
  });

  test("global and route-level middleware execute in correct order", async () => {
    const router = new Router();
    const executionOrder: string[] = [];

    router.use(async () => { executionOrder.push('global'); return null; });

    router.get(
      "/test",
      {
        middleware: [
          async () => { executionOrder.push('route'); return null; }
        ]
      },
      () => {
        executionOrder.push('handler');
        return new Response("ok");
      }
    );

    const req = new Request("http://localhost/test");
    await router.handle(req);

    expect(executionOrder).toEqual(['global', 'route', 'handler']);
  });
});

describe("Router PUT method", () => {
  test("handles PUT requests with validation and path parameters", async () => {
    const router = new Router();
    router.put(
      "/users/:id",
      {
        validation: {
          params: z.object({
            id: z.string().uuid()
          }),
          body: z.object({
            name: z.string().min(3)
          })
        }
      },
      async (req, { params, body }) => {
        return new Response(JSON.stringify({ id: params.id, name: body.name }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    );

    const validReq = new Request("http://localhost/users/550e8400-e29b-41d4-a716-446655440000", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice" })
    });
    const validRes = await router.handle(validReq);
    expect(validRes?.status).toBe(200);
    const validBody = await validRes?.json();
    expect(validBody).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Alice"
    });
  });
});

describe("Router Body Validation", () => {
  test("returns 400 if body is missing but required by validation", async () => {
    const router = new Router();
    router.post(
      "/create",
      { validation: { body: z.object({ name: z.string() }) } },
      () => new Response("created")
    );

    const req = new Request("http://localhost/create", { method: "POST" });
    const res = await router.handle(req);
    expect(res?.status).toBe(400);
    const json = await res?.json();
    expect(json.error).toBe("Validation failed");
  });

  test("returns 400 if body contains invalid JSON", async () => {
    const router = new Router();
    router.post(
      "/test",
      { validation: { body: z.object({ name: z.string() }) } },
      () => new Response("ok")
    );

    const req = new Request("http://localhost/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid json"
    });
    const res = await router.handle(req);
    expect(res?.status).toBe(400);
    const json = await res?.json();
    expect(json.error).toBe("Validation failed");
  });
});

describe("Router Content Type Handling", () => {
  test("does not override non-JSON content-type", async () => {
    const router = new Router();
    router.get("/html", {}, () => {
      return new Response("<h1>Hello</h1>", {
        status: 200,
        headers: { "Content-Type": "text/html" }
      });
    });

    const req = new Request("http://localhost/html");
    const res = await router.handle(req);
    expect(res?.headers.get("content-type")).toBe("text/html");
    expect(await res?.text()).toBe("<h1>Hello</h1>");
  });
});


describe("Router Validation Error Response", () => {
  test("formats validation errors correctly", async () => {
    const router = new Router();
    router.post(
      "/test",
      {
        validation: {
          body: z.object({
            name: z.string().min(3),
            age: z.number().min(18)
          })
        }
      },
      () => new Response("ok")
    );

    const response = await router.handle(new Request("http://localhost/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Jo", age: 16 })
    }));

    expect(response?.status).toBe(400);
    const body = await response?.json();
    expect(body).toEqual({
      error: "Validation failed",
      details: [
        {
          type: "body",
          errors: [
            { path: "name", message: expect.any(String) },
            { path: "age", message: expect.any(String) }
          ]
        }
      ]
    });
  });
});

describe("Router Path-based Middleware", () => {
  test("executes middleware for matching paths", async () => {
    const router = new Router();
    const executionOrder: string[] = [];

    router.use(async () => {
      executionOrder.push('api middleware');
      return null;
    }, "/api");

    router.get("/api/test", {}, () => {
      executionOrder.push('handler');
      return new Response("ok");
    });

    await router.handle(new Request("http://localhost/api/test"));
    expect(executionOrder).toEqual(['api middleware', 'handler']);
  });

  test("skips middleware for non-matching paths", async () => {
    const router = new Router();
    const executionOrder: string[] = [];

    router.use(async () => {
      executionOrder.push('api middleware');
      return null;
    }, "/api");

    router.get("/other/test", {}, () => {
      executionOrder.push('handler');
      return new Response("ok");
    });

    await router.handle(new Request("http://localhost/other/test"));
    expect(executionOrder).toEqual(['handler']);
  });
});

describe("Router Route Matching", () => {
  test("matches exact paths correctly", async () => {
    const router = new Router();
    await router.get("/test", {}, () => new Response("test"));

    const match = router.matchRouteHandler("GET", "/test");
    expect(match).toBeTruthy();
    expect(match?.params).toEqual({});
  });

  test("matches paths with parameters", async () => {
    const router = new Router();
    await router.get("/users/:id", {}, () => new Response());

    const match = router.matchRouteHandler("GET", "/users/123");
    expect(match).toBeTruthy();
    expect(match?.params).toEqual({ id: "123" });
  });

  test("returns null for unmatched paths", async () => {
    const router = new Router();
    await router.get("/test", {}, () => new Response());

    const match = router.matchRouteHandler("GET", "/nonexistent");
    expect(match).toBeNull();
  });

  test("handles multiple path parameters", async () => {
    const router = new Router();
    await router.get("/users/:userId/posts/:postId", {}, () => new Response());

    const match = router.matchRouteHandler("GET", "/users/123/posts/456");
    expect(match).toBeTruthy();
    expect(match?.params).toEqual({ userId: "123", postId: "456" });
  });

  test("matches root path correctly", async () => {
    const router = new Router();
    await router.get("/", {}, () => new Response());

    const match = router.matchRouteHandler("GET", "/");
    expect(match).toBeTruthy();
    expect(match?.params).toEqual({});
  });

  test("handles trailing slashes correctly", async () => {
    const router = new Router();
    await router.get("/test", {}, () => new Response());

    const match = router.matchRouteHandler("GET", "/test/");
    expect(match).toBeTruthy();
    expect(match?.params).toEqual({});
  });
});

describe("Router Plugin System", () => {
  test("plugin lifecycle hooks are called in correct order", async () => {
    const router = new Router();
    const events: string[] = [];

    const testPlugin = {
      name: "test-plugin",
      async onInit(router: Router) {
        events.push("init");
      },
      async onBeforeRouteRegister(router: Router, method: HttpMethod, path: string) {
        events.push(`before-${method}-${path}`);
      },
      async onAfterRouteRegister(router: Router, method: HttpMethod, path: string) {
        events.push(`after-${method}-${path}`);
      },
      async onRequest(req: Request) {
        events.push("request");
        return null;
      },
      async onError(error: unknown, req: Request) {
        events.push("error");
        return null;
      }
    };

    await router.registerPlugin(testPlugin);
    await router.get("/test", {}, () => new Response("test"));

    const request = new Request("http://localhost/test");
    await router.handle(request);

    expect(events).toEqual([
      "init",
      "before-GET-/test",
      "after-GET-/test",
      "request"
    ]);
  });

  test("plugin can intercept requests", async () => {
    const router = new Router();
    const interceptPlugin = {
      name: "intercept-plugin",
      async onRequest(req: Request) {
        return new Response("intercepted", { status: 403 });
      }
    };

    await router.registerPlugin(interceptPlugin);
    await router.get("/test", {}, () => new Response("test"));

    const request = new Request("http://localhost/test");
    const response = await router.handle(request);

    expect(response?.status).toBe(403);
    expect(await response?.text()).toBe("intercepted");
  });

  test("plugin can handle errors", async () => {
    const router = new Router();
    const errorPlugin = {
      name: "error-plugin",
      async onError(error: unknown, req: Request) {
        return new Response("custom error", { status: 500 });
      }
    };

    await router.registerPlugin(errorPlugin);
    await router.get("/test", {}, () => {
      throw new Error("test error");
    });

    const request = new Request("http://localhost/test");
    const response = await router.handle(request);

    expect(response?.status).toBe(500);
    expect(await response?.text()).toBe("custom error");
  });

  test("multiple plugins are executed in registration order", async () => {
    const router = new Router();
    const events: string[] = [];

    const plugin1 = {
      name: "plugin1",
      async onRequest(req: Request) {
        events.push("plugin1");
        return null;
      }
    };

    const plugin2 = {
      name: "plugin2",
      async onRequest(req: Request) {
        events.push("plugin2");
        return null;
      }
    };

    await router.registerPlugin(plugin1);
    await router.registerPlugin(plugin2);
    await router.get("/test", {}, () => new Response("test"));

    const request = new Request("http://localhost/test");
    await router.handle(request);

    expect(events).toEqual(["plugin1", "plugin2"]);
  });

  test("plugin can modify route registration", async () => {
    const router = new Router();
    const events: string[] = [];

    const routePlugin = {
      name: "route-plugin",
      async onBeforeRouteRegister(router: Router, method: HttpMethod, path: string) {
        events.push(`before-${path}`);
      },
      async onAfterRouteRegister(router: Router, method: HttpMethod, path: string) {
        events.push(`after-${path}`);
      }
    };

    await router.registerPlugin(routePlugin);
    await router.get("/test1", {}, () => new Response("test1"));
    await router.get("/test2", {}, () => new Response("test2"));

    expect(events).toEqual([
      "before-/test1",
      "after-/test1",
      "before-/test2",
      "after-/test2"
    ]);
  });
});


