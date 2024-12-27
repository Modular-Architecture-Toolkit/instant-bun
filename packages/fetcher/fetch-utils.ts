import type { EventHandlerMap, ExternalFetchConfig, FileDownloadConfig, MappedApiConfig, TypeMap } from './fetch-types'

declare var window: {
  fetch: any
}

declare var document: {
  createElement: any
  body: any
}

export function appendURLParameters(url: string, params: Record<string, string> = {}): string {
  const urlWithParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params || {})) {
    urlWithParams.append(key, value)
  }

  return urlWithParams.toString() ? `${url}?${urlWithParams.toString()}` : url
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(JSON.stringify(response))
  }
  return await response.json()
}

export function computeHeaders(defaultHeaders: HeadersInit, customHeaders?: HeadersInit): HeadersInit {
  const resultHeaders = new Headers(defaultHeaders)

  if (customHeaders instanceof Headers) {
    for (const [key, value] of customHeaders.entries()) {
      resultHeaders.set(key, value)
    }
  } else if (Array.isArray(customHeaders)) {
    for (const [key, value] of customHeaders) {
      resultHeaders.set(key, value)
    }
  } else {
    for (const [key, value] of Object.entries(customHeaders || {})) {
      resultHeaders.set(key, value as string)
    }
  }

  return resultHeaders
}

export async function fetcher<Endpoint extends keyof TMap, TMap extends TypeMap>(
  fetcherConfig: ExternalFetchConfig<Endpoint, TMap>,
  config: Record<keyof TMap, MappedApiConfig<TMap>>,
  baseUrl: string
  // computeHeadersFunction: (headers?: HeadersInit) => HeadersInit
): Promise<TMap[Endpoint]['response']> {
  const endpointConfig = config[fetcherConfig.endpoint]
  const finalUrl = appendURLParameters(baseUrl + endpointConfig.endpoint, fetcherConfig.params)

  const method = endpointConfig.method
  let bodyData = ''

  if (fetcherConfig.body) {
    bodyData = JSON.stringify(fetcherConfig.body)
  }

  const response = await fetch(finalUrl, {
    method: method.toUpperCase(),
    headers: fetcherConfig?.headers,
    body: bodyData,
  })

  return handleResponse(response)
}

export function fileDownload(config: FileDownloadConfig, baseUrl: string): void {
  if (typeof window === 'undefined') return
  const finalUrl = new URL(baseUrl + config.endpoint)
  if (config.params) {
    for (const [key, value] of Object.entries(config.params)) {
      finalUrl.searchParams.append(key, value)
    }
  }

  const a = document.createElement('a')
  a.href = finalUrl.toString()
  a.download = config.filename || ''
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function createEventStream(endpoint: string, eventHandlers: EventHandlerMap, baseUrl: string): EventSource {
  const url = baseUrl + endpoint
  const es = new EventSource(url)

  es.onopen = (event) => {
    console.info('Stream opened:', event)
  }

  es.onerror = (error) => {
    console.error('Stream Error:', error)
  }

  for (const [event, handler] of Object.entries(eventHandlers)) {
    es.addEventListener(event as string, handler)
  }

  return es
}
