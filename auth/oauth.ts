import {
    OAuthConfig,
    OAuthProviderInitializer,
    OAuthToken,
} from "./oauth-types";

type FetcherResponse<T> = T & {
  error?: string;
};

// Generic OAuth fetcher
export async function oAuthFetcher<T>(
  url: string,
  params: Record<string, string | undefined>
): Promise<FetcherResponse<T>> {
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });

  return response.json();
}

// Wrapper function for getting token
export async function getOAuthToken<T extends OAuthToken>({
  code,
  config: { clientId, clientSecret, redirectUri, tokenUrl },
}: {
  code: string;
  config: Omit<OAuthConfig, "authReqUrl">;
}): Promise<FetcherResponse<T>> {
  const params = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  return oAuthFetcher<T>(tokenUrl, params);
}

export const initProvider: OAuthProviderInitializer = ({
  clientId,
  authReqUrl,
  redirectUri,
}) => {
  return {
    // TODO add options to be able to change response_type/scope, etc
    getAuthorizationUrl: () => {
      const authUrl = authReqUrl;
      const queryParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "email profile",
      });

      return `${authUrl}?${queryParams.toString()}`;
    },
    getToken: async (code: string) => {
      return getOAuthToken<OAuthToken>({ code, config }).then((response) => {
        if (response.error) {
          console.error("Error fetching token:", response.error);
          throw new Error(response.error);
        } else {
          console.log("Access Token:", response.accessToken);
          return response;
        }
      });
    },
  };
};

export const oAuthFactory = (config: OAuthConfig) => {
  const provider = initProvider(config);

  return {
    handleRedirect: async (code: string) => {
      return await provider.getToken(code, config);
    },
    initiateOAuthFlow: () => {
      return provider.getAuthorizationUrl(config);
    },
  };
};
