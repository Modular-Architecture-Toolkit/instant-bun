import { type Routes, middlewareFactory, type Middleware, type MiddlewareConfigMap } from 'bnkit/server'

export type RoutesWithMiddleware = Routes<{
  middleware: typeof middlewareConfig
}>

type CustomMiddleware = Middleware<{
  timestamp: Date
  method: string
}>

// creating a middleware, you could easily connect your own own auth system here
const customMiddlware: CustomMiddleware = (req) => {
  // access request/options
  return {
    timestamp: new Date(),
    method: req.method,
  }
}

export const middlewareConfig = {
  // register a middleware under a key
  time: customMiddlware,
} satisfies MiddlewareConfigMap

export const middleware = middlewareFactory(middlewareConfig)
