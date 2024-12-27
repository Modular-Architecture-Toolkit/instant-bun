import { describe, expect, test } from "bun:test";
import { AuthHandler } from "./auth-handler";
import { z } from "zod";
import type { AuthMiddlewareConfig, RequestWithData } from "../router-types";

describe("AuthHandler", () => {
  test("handles successful authentication", async () => {
    const authHandler = new AuthHandler({
      verify: async () => ({ userId: "123" })
    });

    const { response, authData } = await authHandler.handleAuth(
      new Request("http://localhost"),
      true
    );

    expect(response).toBeNull();
    expect(authData).toEqual({ userId: "123" });
  });

  test("handles authentication failure", async () => {
    const authHandler = new AuthHandler({
      verify: async () => { throw new Error("Auth failed"); }
    });

    const { response, authData } = await authHandler.handleAuth(
      new Request("http://localhost"),
      true
    );

    expect(response?.status).toBe(401);
    expect(authData).toBeNull();
  });

  test("skips authentication when not required", async () => {
    const authHandler = new AuthHandler({
      verify: async () => { throw new Error("Should not be called"); }
    });

    const { response, authData } = await authHandler.handleAuth(
      new Request("http://localhost"),
      false
    );

    expect(response).toBeNull();
    expect(authData).toBeNull();
  });
});

describe("AuthHandler.authenticateRequest", () => {
  test("successfully authenticates and handles valid request", async () => {
    // Setup
    const mockAuthData = { userId: "123" };
    const mockParams = { id: "456" };
    const mockValidation = {
      params: z.object({
        id: z.string()
      })
    };

    const authConfig: AuthMiddlewareConfig = {
      verify: async () => mockAuthData
    };

    const mockHandler = async (req: RequestWithData<unknown>, data: { params: unknown }) => {
      return new Response(JSON.stringify({ 
        auth: req.auth,
        params: data.params 
      }));
    };

    const authHandler = new AuthHandler();
    const req = new Request("http://localhost/test");

    // Execute
    const response = await authHandler.authenticateRequest(
      req,
      authConfig,
      mockParams,
      mockValidation,
      mockHandler
    );

    // Assert
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual({
      auth: mockAuthData,
      params: mockParams
    });
  });

  test("returns auth error when verification fails", async () => {
    // Setup
    const authConfig: AuthMiddlewareConfig = {
      verify: async () => { throw new Error("Invalid token"); },
      onError: (error) => new Response("Auth failed", { status: 401 })
    };

    const mockHandler = async () => new Response("Should not reach here");
    const authHandler = new AuthHandler();
    const req = new Request("http://localhost/test");

    // Execute
    const response = await authHandler.authenticateRequest(
      req,
      authConfig,
      {},
      undefined,
      mockHandler
    );

    // Assert
    expect(response.status).toBe(401);
    expect(await response.text()).toBe("Auth failed");
  });

  test("handles validation failure", async () => {
    // Setup
    const mockAuthData = { userId: "123" };
    const mockParams = { id: "invalid" };
    const mockValidation = {
      params: z.object({
        id: z.string().uuid()
      })
    };

    const authConfig: AuthMiddlewareConfig = {
      verify: async () => mockAuthData
    };

    const mockHandler = async () => new Response("Should not reach here");
    const authHandler = new AuthHandler();
    const req = new Request("http://localhost/test");

    // Execute
    const response = await authHandler.authenticateRequest(
      req,
      authConfig,
      mockParams,
      mockValidation,
      mockHandler
    );

    // Assert
    expect(response.status).toBe(400);
    const errorData = await response.json();
    expect(errorData.error).toBe("Validation failed");
    expect(errorData.details[0].type).toBe("params");
  });

  test("preserves request data through authentication", async () => {
    // Setup
    const mockAuthData = { userId: "123" };
    const mockBody = { message: "test" };
    const mockValidation = {
      body: z.object({
        message: z.string()
      })
    };

    const authConfig: AuthMiddlewareConfig = {
      verify: async () => mockAuthData
    };

    const mockHandler = async (req: RequestWithData<unknown>, data: { body: unknown }) => {
      return new Response(JSON.stringify({ 
        auth: req.auth,
        body: data.body 
      }));
    };

    const authHandler = new AuthHandler();
    const req = new Request("http://localhost/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockBody)
    });

    // Execute
    const response = await authHandler.authenticateRequest(
      req,
      authConfig,
      {},
      mockValidation,
      mockHandler
    );

    // Assert
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual({
      auth: mockAuthData,
      body: mockBody
    });
  });

  test("clones request properly to prevent mutation", async () => {
    // Setup
    const mockAuthData = { userId: "123" };
    const originalBody = { message: "test" };
    let originalRequest: Request | undefined = undefined;
    let clonedRequest: Request | undefined = undefined;

    const authConfig: AuthMiddlewareConfig = {
      verify: async (req: Request) => {
        originalRequest = req;
        return mockAuthData;
      }
    };

    const mockHandler = async (req: RequestWithData<unknown>) => {
      clonedRequest = req;
      return new Response("ok");
    };

    const authHandler = new AuthHandler();
    const req = new Request("http://localhost/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(originalBody)
    });

    // Execute
    await authHandler.authenticateRequest(
      req,
      authConfig,
      {},
      undefined,
      mockHandler
    );

    // Assert
    expect(originalRequest).not.toBe(clonedRequest);
    if (originalRequest && clonedRequest) {
      expect(originalRequest.url).toBe(clonedRequest.url);
      expect(originalRequest.method).toBe(clonedRequest.method);
      expect(originalRequest.headers.get("Content-Type"))
        .toBe(clonedRequest.headers.get("Content-Type"));
    }
  });
}); 