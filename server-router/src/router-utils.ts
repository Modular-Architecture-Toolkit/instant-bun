import { z } from 'zod';
import { ValidationSchema, ValidationError, InferBody, InferHeaders, InferParams, InferQuery } from './router-types';

export class ValidationFailedError extends Error {
    constructor(public errors: ValidationError[]) {
        super('Validation failed');
        this.name = 'ValidationFailedError';
    }
}

// Utility Functions
export function matchRoute(
    path: string,
    routePath: string,
): Record<string, string> | null {
    const pathWithoutQuery = path.split('?')[0];

    const cleanPath = pathWithoutQuery.replace(/\/+$/, '');
    const cleanRoutePath = routePath.replace(/\/+$/, '');


    if (cleanPath === '' && cleanRoutePath === '') {
        return {};
    }

    const pathParts = cleanPath.split('/').filter(Boolean);
    const routeParts = cleanRoutePath.split('/').filter(Boolean);


    if (pathParts.length !== routeParts.length) {
        return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
        const routePart = routeParts[i];
        const pathPart = pathParts[i];



        if (routePart.startsWith(':')) {
            params[routePart.slice(1)] = pathPart;
        } else if (routePart !== pathPart) {
            return null;
        }
    }

    return params;
}

export async function validateRequest<V extends ValidationSchema | undefined>(
    req: Request,
    params: Record<string, string>,
    validation?: V
): Promise<{
    params: InferParams<V>,
    query: InferQuery<V>,
    headers: InferHeaders<V>,
    body: InferBody<V>
}> {
    const parsedData: any = {};
    const errors: ValidationError[] = [];

    // Validate params
    if (validation?.params) {
        try {
            parsedData.params = validation.params.parse(params);
        } catch (error) {
            if (error instanceof z.ZodError) {
                errors.push({ type: 'params', errors: error });
            }
        }
    } else {
        parsedData.params = params;
    }

    // Validate query
    if (validation?.query) {
        const url = new URL(req.url);
        const queryParams = Object.fromEntries(url.searchParams.entries());
        try {
            parsedData.query = validation.query.parse(queryParams);
        } catch (error) {
            if (error instanceof z.ZodError) {
                errors.push({ type: 'query', errors: error });
            }
        }
    } else {
        parsedData.query = Object.fromEntries(new URL(req.url).searchParams.entries());
    }

    // Validate headers
    if (validation?.headers) {
        const headers = Object.fromEntries((req.headers as any).entries());
        try {
            parsedData.headers = validation.headers.parse(headers);
        } catch (error) {
            if (error instanceof z.ZodError) {
                errors.push({ type: 'headers', errors: error });
            }
        }
    } else {
        parsedData.headers = Object.fromEntries((req.headers as any).entries());
    }

    // Validate body
    if (validation?.body) {
        try {
            const body = await req.json();
            parsedData.body = validation.body.parse(body);
        } catch (error) {
            if (error instanceof z.ZodError) {
                errors.push({ type: 'body', errors: error });
            } else {
                errors.push({
                    type: 'body',
                    errors: new z.ZodError([{
                        code: 'custom',
                        path: [],
                        message: 'Invalid JSON'
                    }])
                });
            }
        }
    }

    if (errors.length > 0) {
        throw new ValidationFailedError(errors);
    }

    return parsedData;
}

