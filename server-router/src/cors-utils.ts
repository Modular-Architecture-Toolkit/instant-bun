import { CorsOptions } from "./router-types";

export async function addCorsHeaders(
    response: Response,
    req: Request,
    corsOptions: CorsOptions
): Promise<Response> {
    const origin = req.headers.get('origin');
    if (!origin || !corsOptions) return response;

    const headers = new Headers(response.headers);
    const allowedOrigin = getAllowedOrigin(origin, corsOptions);

    headers.set('Access-Control-Allow-Origin', allowedOrigin);

    if (corsOptions.methods?.length) {
        headers.set('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    }

    if (corsOptions.headers?.length) {
        headers.set('Access-Control-Allow-Headers', corsOptions.headers.join(', '));
    }

    if (corsOptions.credentials) {
        headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

export function getAllowedOrigin(
    requestOrigin: string,
    corsOptions: CorsOptions
): string {
    const { origin } = corsOptions;
    if (!origin) return '';
    if (origin === '*') return '*';
    if (typeof origin === 'string') {
        return requestOrigin === origin ? requestOrigin : '';
    }
    if (Array.isArray(origin)) {
        return origin.includes(requestOrigin) ? requestOrigin : '';
    }
    if (typeof origin === 'function') {
        return origin(requestOrigin) ? requestOrigin : '';
    }
    return '';
}

export function handleCorsPreFlight(corsOptions: CorsOptions): Response {
    return new Response(null, { status: 204 });
}

export function getDefaultCorsOptions(): CorsOptions {
    return {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: false,
        headers: ['Content-Type', 'Authorization']
    };
}
