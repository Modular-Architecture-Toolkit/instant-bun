import { oAuthFactory } from 'packages/auth/oauth'
import { initGoogleOAuth } from 'packages/auth/oauth-providers'
import type { Routes } from 'server'
import { serverFactory } from 'server'

const googleClientId = Bun.env.GOOGLE_OAUTH_CLIENT_ID || ''
const googleClientSecret = Bun.env.GOOGLE_OAUTH_CLIENT_SECRET || ''

const googleOAuthConfig = initGoogleOAuth({
  clientId: googleClientId,
  clientSecret: googleClientSecret,
})

const googleOAuth = oAuthFactory(googleOAuthConfig)

const routes = {
  '/login': {
    get: () => {
      // you could pass a param for the provider
      const authUrl = googleOAuth.initiateOAuthFlow()

      return new Response(null, {
        headers: { Location: authUrl },
        status: 302,
      })
    },
  },
  '/callback': {
    get: async (req) => {
      try {
        const host = req.headers.get('host')
        // Parse the URL and query parameters
        const url = new URL(req.url, `http://${host}`)
        const queryParams = new URLSearchParams(url.search)
        const code = queryParams.get('code')

        if (!code) {
          return new Response('No code provided in query', { status: 400 })
        }

        const tokenInfo = await googleOAuth.handleRedirect(code)

        console.log({ tokenInfo })

        // Logic after successful authentication
        return new Response('Login Successful!')
      } catch (error) {
        console.error(error)
        return new Response('Authentication failed', { status: 403 })
      }
    },
  },
  '/': {
    get: () => {
      // HTML content for the login page
      const htmlContent = `<html><body><h2>Login with Google</h2><button onclick="window.location.href='/login'">Login</button></body></html>`
      return new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html' },
      })
    },
  },
} satisfies Routes

const server = serverFactory({
  routes,
})

server.start(3000)
