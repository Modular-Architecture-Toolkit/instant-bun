import { describe, expect, test } from "bun:test";
import { addCorsHeaders, getAllowedOrigin, handleCorsPreFlight, getDefaultCorsOptions } from "./cors-utils";
import type { CorsOptions } from "./router-types";

describe("cors-utils", () => {
    describe("addCorsHeaders", () => {
        test("adds basic CORS headers to response", async () => {
            const response = new Response("OK");
            const req = new Request("http://localhost", {
                headers: { origin: "http://example.com" }
            });
            const corsOptions: CorsOptions = {
                origin: "*",
                methods: ["GET", "POST"],
                headers: ["Content-Type"]
            };

            const corsResponse = await addCorsHeaders(response, req, corsOptions);
            expect(corsResponse.headers.get("Access-Control-Allow-Origin")).toBe("*");
            expect(corsResponse.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST");
            expect(corsResponse.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
        });

        test("returns original response when no origin header", async () => {
            const response = new Response("OK");
            const req = new Request("http://localhost");
            const corsOptions: CorsOptions = { origin: "*" };

            const corsResponse = await addCorsHeaders(response, req, corsOptions);
            expect(corsResponse.headers.get("Access-Control-Allow-Origin")).toBeNull();
        });

        test("handles credentials flag", async () => {
            const response = new Response("OK");
            const req = new Request("http://localhost", {
                headers: { origin: "http://example.com" }
            });
            const corsOptions: CorsOptions = {
                origin: "http://example.com",
                credentials: true
            };

            const corsResponse = await addCorsHeaders(response, req, corsOptions);
            expect(corsResponse.headers.get("Access-Control-Allow-Credentials")).toBe("true");
        });

        test("preserves original response body and status", async () => {
            const response = new Response("Original body", { status: 201 });
            const req = new Request("http://localhost", {
                headers: { origin: "http://example.com" }
            });
            const corsOptions: CorsOptions = { origin: "*" };

            const corsResponse = await addCorsHeaders(response, req, corsOptions);
            expect(corsResponse.status).toBe(201);
            expect(await corsResponse.text()).toBe("Original body");
        });
    });

    describe("getAllowedOrigin", () => {
        test("handles wildcard origin", () => {
            const origin = getAllowedOrigin("http://example.com", { origin: "*" });
            expect(origin).toBe("*");
        });

        test("handles string origin match", () => {
            const origin = getAllowedOrigin("http://example.com", { origin: "http://example.com" });
            expect(origin).toBe("http://example.com");
        });

        test("handles string origin mismatch", () => {
            const origin = getAllowedOrigin("http://example.com", { origin: "http://other.com" });
            expect(origin).toBe("");
        });

        test("handles array of origins", () => {
            const corsOptions: CorsOptions = {
                origin: ["http://example.com", "http://localhost:3000"]
            };
            expect(getAllowedOrigin("http://example.com", corsOptions)).toBe("http://example.com");
            expect(getAllowedOrigin("http://other.com", corsOptions)).toBe("");
        });

        test("handles function origin validator", () => {
            const corsOptions: CorsOptions = {
                origin: (origin: string) => origin.endsWith(".example.com")
            };
            expect(getAllowedOrigin("http://sub.example.com", corsOptions)).toBe("http://sub.example.com");
            expect(getAllowedOrigin("http://other.com", corsOptions)).toBe("");
        });

        test("handles missing origin config", () => {
            const origin = getAllowedOrigin("http://example.com", {});
            expect(origin).toBe("");
        });
    });

    describe("handleCorsPreFlight", () => {
        test("returns 204 response for preflight", () => {
            const response = handleCorsPreFlight({});
            expect(response.status).toBe(204);
        });
    });

    describe("getDefaultCorsOptions", () => {
        test("returns default CORS configuration", () => {
            const defaults = getDefaultCorsOptions();
            expect(defaults).toEqual({
                origin: "*",
                methods: ["GET", "POST", "PATCH", "DELETE"],
                credentials: false,
                headers: ["Content-Type", "Authorization"]
            });
        });

        test("default options are properly structured", () => {
            const defaults = getDefaultCorsOptions();
            expect(Array.isArray(defaults.methods)).toBe(true);
            expect(Array.isArray(defaults.headers)).toBe(true);
            expect(typeof defaults.credentials).toBe("boolean");
        });
    });
}); 