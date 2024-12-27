import type { PartialRecord } from '../../type-utils'

// for improved readbility when creating server routes lower
export type RouteMethods = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'

export type CommonHttpHeaders =
  | 'Accept'
  | 'Authorization'
  | 'Cache-Control'
  | 'Content-Type'
  | 'Date'
  | 'Host'
  | 'Origin'
  | 'Referer'
  | 'User-Agent'
  | 'X-Requested-With'
  | 'X-Forwarded-For'
  | 'X-HTTP-Method-Override'

export type UToolHTTPHeaders = PartialRecord<CommonHttpHeaders, string>

export type RouteHandler = (request: Request) => Response | Promise<Response>

export type MiddlwareParams<CtxT extends object = object> = {
  request: Request
  next?: Middleware<CtxT>
  context?: CtxT
  response: Response
}

export type Middleware<CtxT extends object = object> = ({
  request,
  next,
  context,
  response,
}: MiddlwareParams<CtxT>) => Response

export type RouteMap = Record<string, RouteHandler>

export type ErrorHandler = (error: any, request: Request) => Response

export type RouteReqDataOpts = {
  body?: Request['body']
  params?: object
  headers?: object
}

export type ClientCORSCredentialOpts = 'omit' | 'same-origin' | 'include'

/**
 * Options for configuring Cross-Origin Resource Sharing (CORS) behavior.
 */
export type CORSOptions = {
  /**
   * An array of allowed origins. Requests from origins not in this array will be rejected.
   * ["*"] will allow all origins.
   */
  allowedOrigins?: string[]
  /**
   * An array of allowed HTTP methods. Requests using methods not in this array will be rejected.
   */
  allowedMethods?: HTTPMethod[]
  /**
   * An array of allowed HTTP headers. Requests with headers not in this array will be rejected.
   */
  allowedHeaders?: CommonHttpHeaders[] | string[]
  /**
   * Whether or not to allow credentials to be sent with the request.
   */
  credentials?: boolean
}

/**
 * Type for a generic route handler that provides typed access to the request body, query params, and headers.
 *
 * The route handler receives an object with properties for accessing the raw request,
 * as well as typed parsing methods for the request body, query params, and headers.
 */
export type CreateRouteGeneric<ReqT extends RouteReqDataOpts> = {
  request: Request
  parseBodyJson: <BodyType extends ReqT['body']>() => Promise<BodyType>
  parseQueryParams: <ParamsType>() => ParamsType
  parseHeaders: <HeadersT>() => HeadersT
  response: Response
}

export type ReqHandler<ReqT extends RouteReqDataOpts> = (args: CreateRouteGeneric<ReqT>) => Response | Promise<Response>

export type OnRequestT<ReqT extends RouteReqDataOpts> = (handler: ReqHandler<ReqT> | Promise<ReqHandler<ReqT>>) => void

export interface RouteOptions {
  errorMessage?: string
  onError?: (error: Error, request: Request) => Response
}
