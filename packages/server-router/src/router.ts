import { matchRoute, validateRequest, ValidationFailedError } from './router-utils';
import { AuthHandler } from './auth/auth-handler';
import {
  RouteHandler,
  Middleware,
  RouteConfig,
  RouterOptions,
  Route,
  ValidationSchema,
  AuthData,
  RequestWithData,
  AuthConfig,
  AuthMiddlewareConfig,
  RouterPlugin,
  PluginHookFunction
} from './router-types';
import { HttpMethod } from '@bnk/cors';

export class Router {
  private routes: Route<any>[] = [];
  private globalMws: Middleware<any>[] = [];
  private pathMws: Map<string, Middleware<any>[]> = new Map();
  private authHandler: AuthHandler | null = null;
  private onError?: (error: unknown, req: Request) => Response;
  private plugins: RouterPlugin[] = [];

  constructor(opts?: RouterOptions) {
    if (opts?.auth) {
      this.authHandler = new AuthHandler(opts?.auth);
    }
    if (opts?.onError) this.onError = opts.onError;
  }

  async registerPlugin(plugin: RouterPlugin): Promise<void> {
    this.plugins.push(plugin);
    await plugin.onInit?.(this);
  }

  private async runPluginHook<T extends keyof RouterPlugin>(
    hookName: T,
    ...args: Parameters<Extract<RouterPlugin[T], PluginHookFunction>>
  ): Promise<Response | null> {
    for (const plugin of this.plugins) {
      const hook = plugin[hookName];
      if (hook) {
        const result = await (hook as Function).apply(plugin, args);
        if (result instanceof Response) return result;
      }
    }
    return null;
  }

  use(mw: Middleware, path?: string) {
    if (path) {
      const arr = this.pathMws.get(path) || [];
      arr.push(mw);
      this.pathMws.set(path, arr);
    } else {
      this.globalMws.push(mw);
    }
  }

  configureAuth(cfg: AuthConfig) {
    if (!this.authHandler) {
      this.authHandler = new AuthHandler(cfg);
    } else {
      this.authHandler.configure(cfg);
    }
  }

  async addRoute<V extends ValidationSchema | undefined, A = AuthData, T = unknown>(
    method: HttpMethod,
    path: string,
    opts: RouteConfig<V, A, T>,
    handler: RouteHandler<V, A, T>
  ): Promise<void> {
    await this.runPluginHook('onBeforeRouteRegister', this, method, path, opts);

    const wrapped = (req: Request, params: Record<string, string>) =>
      this.runAuth(req as RequestWithData<T>, params, opts, handler);
    this.routes.push({ path, method, handler: wrapped, middleware: opts.middleware });

    await this.runPluginHook('onAfterRouteRegister', this, method, path, opts);
  }

  async get<V extends ValidationSchema | undefined, A = AuthData, T = unknown>(path: string, opts: RouteConfig<V, A, T>, h: RouteHandler<V, A, T>) {
    await this.addRoute('GET', path, opts, h);
  }
  async post<V extends ValidationSchema | undefined, A = AuthData, T = unknown>(path: string, opts: RouteConfig<V, A, T>, h: RouteHandler<V, A, T>) {
    await this.addRoute('POST', path, opts, h);
  }
  async put<V extends ValidationSchema | undefined, A = AuthData, T = unknown>(path: string, opts: RouteConfig<V, A, T>, h: RouteHandler<V, A, T>) {
    await this.addRoute('PUT', path, opts, h);
  }
  async patch<V extends ValidationSchema | undefined, A = AuthData, T = unknown>(path: string, opts: RouteConfig<V, A, T>, h: RouteHandler<V, A, T>) {
    await this.addRoute('PATCH', path, opts, h);
  }
  async delete<V extends ValidationSchema | undefined, A = AuthData, T = unknown>(path: string, opts: RouteConfig<V, A, T>, h: RouteHandler<V, A, T>) {
    await this.addRoute('DELETE', path, opts, h);
  }

  private async runPluginResponseHook(req: Request, res: Response): Promise<Response> {
    for (const plugin of this.plugins) {
      if (plugin.onResponse) {
        const result = await plugin.onResponse(req, res);
        if (result instanceof Response) {
          res = result;
        }
      }
    }
    return res;
  }

  async handle(req: Request): Promise<Response | null> {
    try {
      const pluginResponse = await this.runPluginHook('onRequest', req);
      if (pluginResponse) return await this.runPluginResponseHook(req, pluginResponse);

      const { pathname } = new URL(req.url);
      const method = req.method as HttpMethod;

      const globalResp = await this.runMiddlewares(req, this.globalMws);
      if (globalResp) return await this.runPluginResponseHook(req, globalResp);

      const pathResp = await this.runPathMiddlewares(req, pathname);
      if (pathResp) return await this.runPluginResponseHook(req, pathResp);

      const matched = this.matchRouteHandler(method, pathname);
      if (!matched) {
        const notFound = this.notFoundRes();
        return await this.runPluginResponseHook(req, notFound);
      }

      const { route, params } = matched;
      const routeMwResp = await this.runMiddlewares(req, route.middleware ?? []);
      if (routeMwResp) return await this.runPluginResponseHook(req, routeMwResp);

      const res = await route.handler(req, params);
      this.setContentType(res);
      return await this.runPluginResponseHook(req, res);
    } catch (err) {
      const errorRes = await this.handleError(err, req);
      return await this.runPluginResponseHook(req, errorRes);
    }
  }

  public matchRouteHandler(method: HttpMethod, path: string): { route: Route<any>; params: Record<string, string> } | null {
    for (const r of this.routes) {
      if (r.method !== method) continue;
      const params = matchRoute(path, r.path); // Enable debug mode to see matching process
      if (params) return { route: r, params };
    }
    return null;
  }

  private async runAuth<V extends ValidationSchema | undefined, A, T>(
    req: RequestWithData<T>,
    params: Record<string, string>,
    opts: RouteConfig<V, A, T>,
    handler: RouteHandler<V, A, T>
  ): Promise<Response> {
    if (!this.authHandler || !opts.auth) {
      try {
        const data = await validateRequest(req, params, opts.validation);
        return handler(req, data);
      } catch (e) {
        if (e instanceof ValidationFailedError) return this.buildValidationErrorRes(e);
        throw e;
      }
    }

    if (typeof opts.auth === 'object') {
      const authResponse = await this.authHandler.authenticateRequest<A>(
        req as unknown as RequestWithData<A>,
        opts.auth as AuthMiddlewareConfig<A extends AuthData ? A : never>,
        params,
        opts.validation,
        handler as RouteHandler<V, AuthData>
      );
      if (!authResponse) {
        throw new Error('Authentication failed');
      }
      return authResponse;
    }

    const { response: authRes, authData } = await this.authHandler.handleAuth(req, opts.auth);
    if (authRes) return authRes;

    const authReq = Object.assign(req.clone(), { auth: authData }) as RequestWithData<T>;
    try {
      const data = await validateRequest(req, params, opts.validation);
      return handler(authReq, data);
    } catch (e) {
      if (e instanceof ValidationFailedError) return this.buildValidationErrorRes(e);
      throw e;
    }
  }

  private async runMiddlewares(req: Request, mws: Middleware<any>[]): Promise<Response | null> {
    for (const mw of mws) {
      const res = await mw(req);
      if (res) return res;
    }
    return null;
  }

  private async runPathMiddlewares(req: Request, path: string): Promise<Response | null> {
    for (const [p, mws] of this.pathMws) {
      if (path.startsWith(p)) {
        const res = await this.runMiddlewares(req, mws);
        if (res) return res;
      }
    }
    return null;
  }

  private buildValidationErrorRes(err: ValidationFailedError): Response {
    const details = err.errors.map(e => ({
      type: e.type,
      errors: e.errors.errors.map(d => ({ path: d.path.join('.'), message: d.message }))
    }));
    return new Response(JSON.stringify({ error: 'Validation failed', details }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private notFoundRes(): Response {
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleError(error: unknown, req: Request): Promise<Response> {
    const pluginResponse = await this.runPluginHook('onError', error, req);
    if (pluginResponse) return pluginResponse;

    const defaultRes = new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    return this.onError ? this.onError(error, req) : defaultRes;
  }

  private setContentType(res: Response) {
    if (!res.headers.get('content-type')) {
      res.headers.set('content-type', 'application/json');
    }
  }
}

