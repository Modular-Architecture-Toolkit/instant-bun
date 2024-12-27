import type { Middleware, ValidationSchema, AuthConfig, AuthData } from '../router-types';

export type AuthMiddlewareConfig<A = AuthData> = {
    verify: (req: Request) => Promise<A> | A;
    onError?: (error: unknown) => Response;
};

export type AuthMiddlewareResult<A = AuthData> = {
    response: Response | null;
    authData?: A;
};

export async function handleAuth<A = AuthData>(
    req: Request,
    authConfig?: boolean | AuthMiddlewareConfig<A>,
    globalConfig?: AuthConfig
): Promise<AuthMiddlewareResult<A>> {
    if (!authConfig) {
        return { response: null };
    }

    const config = typeof authConfig === 'boolean' ? globalConfig : authConfig;
    if (!config) {
        throw new Error('Authentication is required but no auth config was provided');
    }

    try {
        const authData = await config.verify(req) as A;
        return { response: null, authData };
    } catch (error) {
        const response = config.onError
            ? config.onError(error)
            : new Response('Unauthorized', { status: 401 });
        return { response };
    }
}

export function createAuthMiddleware<A = AuthData>(
    config: AuthMiddlewareConfig<A>
) {
    return async (req: Request): Promise<Response | null> => {
        const { response } = await handleAuth(req, config);
        return response;
    };
}

export type SecureRouteOptions<V extends ValidationSchema | undefined = undefined, A = AuthData> = {
    path: string;
    validation?: V;
    auth: boolean | AuthMiddlewareConfig<A>;
    middleware?: Middleware[];
};

export type AuthenticatedRequest<A = AuthData> = Request & {
    auth?: A;
};