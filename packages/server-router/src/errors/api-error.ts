// packages/server-router/src/errors/api-error.ts

export class ApiError extends Error {
    public readonly status: number;
    public readonly code: string;
    public readonly details?: unknown;

    constructor(
        message: string,
        status = 500,
        code = 'INTERNAL_ERROR',
        details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}