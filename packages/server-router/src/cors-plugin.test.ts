import { expect, test, describe, beforeEach } from "bun:test";
import { CorsPlugin } from "./cors-plugin";
import { Router } from "./router";
import { CorsOptions } from '@bnk/cors';
describe("CorsPlugin", () => {
  let router: Router;
  let corsPlugin: CorsPlugin;

  beforeEach(() => {
    router = new Router();
    corsPlugin = new CorsPlugin();
  });

  describe("initialization", () => {
    test("should create plugin with default options", () => {
      expect(corsPlugin.name).toBe("cors-plugin");
    });

    test("should create plugin with custom options", () => {
      const customOptions: CorsOptions = {
        origin: "https://custom-domain.com",
        methods: ["GET", "POST"],
        headers: ["X-Custom-Header"],
        credentials: false
      };
      
      const plugin = new CorsPlugin(customOptions);
      expect(plugin.name).toBe("cors-plugin");
    });
  });

  describe("CORS preflight handling", () => {
    test("should handle OPTIONS preflight request", async () => {
      await router.registerPlugin(corsPlugin);

      const req = new Request("https://api.example.com/test", {
        method: "OPTIONS",
        headers: {
          "Origin": "https://example.com",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });

      const response = await router.handle(req);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(204);
      expect(response?.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response?.headers.get("Access-Control-Allow-Methods")).toContain("POST");
      expect(response?.headers.get("Access-Control-Allow-Headers")).toContain("Content-Type");
    });

    test("should not handle non-CORS requests", async () => {
      await router.registerPlugin(corsPlugin);

      const req = new Request("https://api.example.com/test", {
        method: "GET",
      });

      const response = await router.handle(req);
      expect(response?.status).toBe(404); // Should fall through to normal routing
    });
  });

  describe("CORS response handling", () => {
    test("should add CORS headers to normal responses", async () => {
      await router.registerPlugin(corsPlugin);

      // Register a test route
      await router.get("/test", { auth: false }, () => {
        return new Response(JSON.stringify({ message: "success" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const req = new Request("https://api.example.com/test", {
        method: "GET",
        headers: {
          "Origin": "https://example.com",
        },
      });

      const response = await router.handle(req);
      expect(response).not.toBeNull();
      expect(response?.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });

    test("should respect custom CORS options", async () => {
      const customOptions: CorsOptions = {
        origin: "https://custom-domain.com",
        methods: ["GET"],
        headers: ["X-Custom-Header"],
        credentials: false
      };

      const customCorsPlugin = new CorsPlugin(customOptions);
      await router.registerPlugin(customCorsPlugin);

      const req = new Request("https://api.example.com/test", {
        method: "OPTIONS",
        headers: {
          "Origin": "https://custom-domain.com",
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "X-Custom-Header",
        },
      });

      const response = await router.handle(req);
      expect(response).not.toBeNull();
      expect(response?.headers.get("Access-Control-Allow-Origin")).toBe("https://custom-domain.com");
      expect(response?.headers.get("Access-Control-Allow-Methods")).toBe("GET");
      expect(response?.headers.get("Access-Control-Allow-Headers")).toBe("X-Custom-Header");
    });

    test("should handle multiple origins in allowOrigin", async () => {
      const customOptions: CorsOptions = {
        origin: ["https://domain1.com", "https://domain2.com"],
        methods: ["GET"],
        headers: ["Content-Type"],
        credentials: false
      };

      const customCorsPlugin = new CorsPlugin(customOptions);
      await router.registerPlugin(customCorsPlugin);

      const req = new Request("https://api.example.com/test", {
        method: "OPTIONS",
        headers: {
          "Origin": "https://domain1.com",
        },
      });

      const response = await router.handle(req);
      expect(response?.headers.get("Access-Control-Allow-Origin")).toBe("https://domain1.com");
    });
  });

  describe("error handling", () => {
    test("should handle invalid CORS requests gracefully", async () => {
      await router.registerPlugin(corsPlugin);

      const req = new Request("https://api.example.com/test", {
        method: "OPTIONS",
        headers: {
          // Missing required CORS headers
        },
      });

      const response = await router.handle(req);
      expect(response?.status).toBe(404); // Should fall through to normal routing
    });
  });
}); 