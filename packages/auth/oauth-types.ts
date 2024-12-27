export type OAuthHelpers = {
  getAuthorizationUrl(config: OAuthConfig): string
  getToken(code: string, config: OAuthConfig): Promise<OAuthToken> // Simplified for demonstration
}

export type OAuthConfig = {
  clientId: string
  clientSecret: string
  // the server route that handles the redirect from the OAuth provider
  redirectUri: string
  // the url that handles the token request from the OAuth provider
  tokenUrl: string
  // the server route that handles the token request from the OAuth provider
  authReqUrl: string
  headers?: Record<string, string>
}

export type OAuthToken = {
  accessToken: string
  tokenType: string
  expiresIn: number // Time in seconds after which the token expires
  refreshToken?: string // Optional, not all flows return a refresh token
  scope?: string // Optional, scope of the access granted
  idToken?: string // Optional, used in OpenID Connect (OIDC)
  // Additional fields can be added here depending on the OAuth provider
}

export type OAuthProviderOptions = {
  redirectUrl: string
}

export type OAuthProviderCreds = Pick<OAuthConfig, 'clientId' | 'clientSecret'>
export type OAuthProviderFn = (config: OAuthProviderCreds, options?: OAuthProviderOptions) => OAuthConfig

export type OAuthProviderInitializer = (config: OAuthConfig) => OAuthHelpers
