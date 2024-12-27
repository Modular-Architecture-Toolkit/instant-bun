import { describe, expect, test } from "bun:test";
import { handleAuth, createAuthMiddleware, type AuthMiddlewareConfig } from "./auth-utils";
import type { AuthConfig } from "../router-types";

describe("auth-utils", () => {
    describe("handleAuth", () => {
        test("returns null response when no auth config provided", async () => {
            const req = new Request("http://localhost");
            const result = await handleAuth(req);
            expect(result.response).toBeNull();
            expect(result.authData).toBeUndefined();
        });

        test("uses global config when boolean auth config is true", async () => {
            const req = new Request("http://localhost");
            const globalConfig: AuthConfig = {
                verify: async () => ({ userId: "123", email: "test@example.com" })
            };

            const result = await handleAuth(req, true, globalConfig);
            expect(result.response).toBeNull();
            expect(result.authData).toEqual({ userId: "123", email: "test@example.com" });
        });

        test("uses local config over global config", async () => {
            const req = new Request("http://localhost");
            const globalConfig: AuthConfig = {
                verify: async () => ({ userId: "global", email: "global@example.com" })
            };
            const localConfig: AuthMiddlewareConfig = {
                verify: async () => ({ userId: "local", email: "local@example.com" })
            };

            const result = await handleAuth(req, localConfig, globalConfig);
            expect(result.response).toBeNull();
            expect(result.authData).toEqual({ userId: "local", email: "local@example.com" });
        });

        test("throws error when boolean true provided without global config", async () => {
            const req = new Request("http://localhost");
            await expect(handleAuth(req, true)).rejects.toThrow(
                "Authentication is required but no auth config was provided"
            );
        });

        test("returns error response when verification fails", async () => {
            const req = new Request("http://localhost");
            const config: AuthMiddlewareConfig = {
                verify: async () => {
                    throw new Error("Invalid token");
                }
            };

            const result = await handleAuth(req, config);
            expect(result.response).toBeInstanceOf(Response);
            expect(result.response?.status).toBe(401);
            expect(result.authData).toBeUndefined();
        });

        test("uses custom error handler when provided", async () => {
            const req = new Request("http://localhost");
            const config: AuthMiddlewareConfig = {
                verify: async () => {
                    throw new Error("Custom error");
                },
                onError: () => new Response("Custom error response", { status: 403 })
            };

            const result = await handleAuth(req, config);
            expect(result.response?.status).toBe(403);
            expect(await result.response?.text()).toBe("Custom error response");
        });
    });

    describe("createAuthMiddleware", () => {
        test("creates middleware that handles successful auth", async () => {
            const middleware = createAuthMiddleware({
                verify: async () => ({ userId: "123" })
            });

            const response = await middleware(new Request("http://localhost"));
            expect(response).toBeNull();
        });

        test("creates middleware that handles auth failures", async () => {
            const middleware = createAuthMiddleware({
                verify: async () => {
                    throw new Error("Auth failed");
                }
            });

            const response = await middleware(new Request("http://localhost"));
            expect(response).toBeInstanceOf(Response);
            expect(response?.status).toBe(401);
        });

        test("middleware respects custom error handler", async () => {
            const middleware = createAuthMiddleware({
                verify: async () => {
                    throw new Error("Auth failed");
                },
                onError: () => new Response("Custom error", { status: 403 })
            });

            const response = await middleware(new Request("http://localhost"));
            expect(response?.status).toBe(403);
            expect(await response?.text()).toBe("Custom error");
        });
    });
}); 