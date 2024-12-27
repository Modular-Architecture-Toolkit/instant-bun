import { z } from 'zod';
import { Router } from './router';
import { CorsOptions, HttpMethod } from '@bnk/cors';


// Auth Types
export type AuthData = {
  userId: string;
  [key: string]: unknown;
};

export interface AuthConfig {
  verify: (req: Request) => Promise<AuthData>;
  onError?: (error: Error) => Response;
}

// Request Types
export type RequestWithData<T = unknown> = Request & {
  data?: T;
  auth?: AuthData;
};

// Validation Types
export type ValidationSchema = {
  params?: z.ZodType<any>;
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  headers?: z.ZodType<any>;
};

export interface ValidationError {
  type: 'params' | 'body' | 'query' | 'headers';
  errors: z.ZodError;
}

// Router Types
export type Middleware<T = unknown> = (
  req: RequestWithData<T>
) => Promise<Response | null> | Response | null;

export type RouteHandler<
  V extends ValidationSchema | undefined = undefined,
  A = AuthData,
  T = unknown
> = (
  req: RequestWithData<T>,
  data: InferValidatedData<V>
) => Promise<Response> | Response;

export interface RouteConfig<V extends ValidationSchema | undefined, A = AuthData, T = unknown> {
  auth?: boolean | AuthMiddlewareConfig<A>;
  validation?: V;
  middleware?: Middleware<T>[];
}

export interface RouterOptions {
  cors?: CorsOptions;
  debug?: boolean;
  onError?: (error: unknown, req: Request) => Response;
  auth?: AuthConfig;
}

export interface Route<T = unknown> {
  path: string;
  method: HttpMethod;
  handler: (req: Request, params: Record<string, string>) => Promise<Response> | Response;
  middleware?: Middleware<T>[];
}

// Auth Middleware Types
export interface AuthMiddlewareConfig<A = AuthData> {
  verify: (req: Request) => Promise<A>;
  onError?: (error: Error) => Response;
}

// Type Inference Helpers
export type InferParams<V extends ValidationSchema | undefined> =
  V extends { params: z.ZodTypeAny } ? z.infer<V['params']> : Record<string, string>;

export type InferQuery<V extends ValidationSchema | undefined> =
  V extends { query: z.ZodTypeAny } ? z.infer<V['query']> : Record<string, string>;

export type InferHeaders<V extends ValidationSchema | undefined> =
  V extends { headers: z.ZodTypeAny } ? z.infer<V['headers']> : Record<string, string>;

export type InferBody<V extends ValidationSchema | undefined> =
  V extends { body: z.ZodTypeAny } ? z.infer<V['body']> : unknown;

export type InferValidatedData<V extends ValidationSchema | undefined> = {
  params: InferParams<V>;
  query: InferQuery<V>;
  headers: InferHeaders<V>;
  body: InferBody<V>;
};

export interface RouterPlugin {
  name: string;
  onInit?(router: Router): Promise<void> | void;
  onBeforeRouteRegister?(router: Router, method: HttpMethod, path: string, opts: RouteConfig<any, any, any>): Promise<void> | void;
  onAfterRouteRegister?(router: Router, method: HttpMethod, path: string, opts: RouteConfig<any, any, any>): Promise<void> | void;
  onRequest?(req: Request): Promise<Response | null> | Response | null;
  onError?(error: unknown, req: Request): Promise<Response | null> | Response | null;
  onResponse?(req: Request, res: Response): Promise<Response | null> | Response | null;
}

export type PluginHookFunction = (...args: any[]) => Promise<any> | any;