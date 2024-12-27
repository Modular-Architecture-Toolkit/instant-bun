declare var window: any
declare var document: {
  createElement: any
  body: {
    appendChild: any
    removeChild: any
  }
}
import type { HTTPMethod } from '../utils/http-types'
import type { ExternalFetchConfig, MappedApiConfig, TypeMap } from './fetch-types'
import { computeHeaders, createEventStream, fetcher, fileDownload } from './fetch-utils'

export type FactoryMethods = keyof ReturnType<typeof createFetchFactory>

export function createFetchFactory<TMap extends TypeMap>({
  baseUrl = '',
  config,
  defaultHeaders,
  debug = false,
}: {
  baseUrl?: string
  debug?: boolean
  config: Record<keyof TMap, MappedApiConfig<TMap>>
  defaultHeaders?: Headers // Headers can be strings or functions returning strings
}) {
  return {
    fetcher: <Endpoint extends keyof TMap>(
      fetcherConfig: ExternalFetchConfig<Endpoint, TMap, HTTPMethod>
    ): Promise<TMap[Endpoint]['response']> => {
      const headers = computeHeaders(defaultHeaders || {}, fetcherConfig.headers || {})

      return fetcher(
        {
          ...fetcherConfig,
          headers,
          method: fetcherConfig.method || 'GET',
        },
        config,
        baseUrl
      )
    },
    get: <Endpoint extends keyof TMap>(
      fetcherConfig: ExternalFetchConfig<Endpoint, TMap, 'GET'>
    ): Promise<TMap[Endpoint]['response']> => {
      const headers = computeHeaders(defaultHeaders || {}, fetcherConfig.headers || {})

      return fetcher(
        {
          ...fetcherConfig,
          headers,
          method: 'GET',
        },
        config,
        baseUrl
      )
    },
    post: <Endpoint extends keyof TMap>(
      fetchConfig: ExternalFetchConfig<Endpoint, TMap, 'POST'> & {
        endpoint: Endpoint
      }
    ): Promise<TMap[Endpoint]['response']> => {
      const headers = computeHeaders(defaultHeaders || {}, fetchConfig.headers || {})

      return fetcher({ ...fetchConfig, headers, method: 'POST' }, config, baseUrl)
    },

    postForm: <Endpoint extends keyof TMap>(
      fetchConfig: ExternalFetchConfig<Endpoint, TMap, 'POST'> & {
        endpoint: Endpoint
        boundary?: string
      }
    ): Promise<TMap[Endpoint]['response']> => {
      const defaultContentType = fetchConfig.boundary
        ? `multipart/form-data; boundary=${fetchConfig.boundary}`
        : 'multipart/form-data'

      const formHeaders = {
        'Content-Type': defaultContentType,
        ...fetchConfig.headers,
      }
      const headers = computeHeaders(defaultHeaders || {}, formHeaders || {})

      return fetcher(
        {
          ...fetchConfig,
          headers,
          method: 'POST',
        },
        config,
        baseUrl
      )
    },

    delete: <Endpoint extends keyof TMap>(
      fetchConfig: ExternalFetchConfig<Endpoint, TMap, 'DELETE'> & {
        endpoint: Endpoint
      }
    ): Promise<TMap[Endpoint]['response']> => {
      const headers = computeHeaders(defaultHeaders || {}, fetchConfig.headers || {})
      return fetcher({ ...fetchConfig, headers, method: 'DELETE' }, config, baseUrl)
    },
    createEventStream,
    fileDownload,
  }
}
