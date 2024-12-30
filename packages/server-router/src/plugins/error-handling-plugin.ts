import { RouterPlugin } from '../router-types';
import { ApiError } from '../errors/api-error';
import { json } from '../response/json-response';

export interface ErrorHandlingPluginOptions {
  logErrors?: boolean;
  logger?: (error: unknown) => void;
  exposeStackTrace?: boolean;
}

export class ErrorHandlingPlugin implements RouterPlugin {
  name = 'error-handling-plugin';

  constructor(private opts: ErrorHandlingPluginOptions = {}) { }

  async onError(error: unknown, req: Request): Promise<Response | null> {
    if (this.opts.logErrors && this.opts.logger) {
      this.opts.logger(error);
    }

    // If it's an ApiError, return a structured response
    if (error instanceof ApiError) {
      return json.error(
        error.message,        // Pass the error message as a string
        error.status,         // HTTP status
        {
          code: error.code,   // Additional info in the details object
          ...(error.details ? { details: error.details } : {}),
          ...(this.opts.exposeStackTrace ? { stack: error.stack } : {})
        }
      );
    }

    // Fallback for unknown or unhandled errors
    const fallbackMessage = error instanceof Error ? error.message : 'Unexpected error';
    return json.error(
      fallbackMessage,       // Pass a string
      500,
      {
        error: 'INTERNAL_ERROR',
        ...(this.opts.exposeStackTrace && error instanceof Error
          ? { stack: error.stack }
          : {})
      }
    );
  }
}