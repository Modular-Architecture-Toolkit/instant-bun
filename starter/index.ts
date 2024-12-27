import { jsonRes, serverFactory } from 'bnkit/server'
import { type RoutesWithMiddleware, middleware } from './middlewares'

const routes = {
  '/': {
    get: (_, { time }) => {
      return new Response(`Hello World! ${time?.timestamp.toISOString()}`)
    },
  },
  '/json': {
    get: (_, { time }) =>
      jsonRes({
        message: 'Hello JSON Response!',
        ...time,
      }),
  },
} satisfies RoutesWithMiddleware

// Create Server Factory with middleware
const { start } = serverFactory({
  routes,
  middleware,
})

start()
