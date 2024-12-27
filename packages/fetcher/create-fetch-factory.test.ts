import { describe, expect, test } from 'bun:test'
import { createFetchFactory } from './create-fetch-factory'

declare var global: {
  fetch: any
}

type FetchArgs = {
  url: string
  options: RequestInit
}

describe('post method', () => {
  test('should make a post request to the correct URL with JSON body', async () => {
    let fetchArgs: FetchArgs = {
      url: '',
      options: {},
    }
    global.fetch = async (url: string, options: RequestInit) => {
      fetchArgs = { url, options }
      return {
        ok: true,
        json: async () => ({ message: 'Success' }),
      }
    }

    const headers = new Headers()

    headers.set('Authorization', 'Bearer token')

    const fetchFactory = createFetchFactory({
      baseUrl: 'https://api.example.com',
      defaultHeaders: headers,
      config: {
        test: {
          endpoint: '/test',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      },
    })
    const postData = { key: 'value' }
    await fetchFactory.post({ endpoint: 'test', body: postData })

    expect(fetchArgs.url).toBe('https://api.example.com/test')
    expect(fetchArgs.options.method).toBe('POST')
    // TODO: fix header tests
    // expect(fetchArgs.options.headers.get("Content-Type")).toBe(
    //   "application/json"
    // );
    // expect(fetchArgs.options.headers.get("Authorization")).toBe("Bearer token");
    expect(fetchArgs.options.body).toBe(JSON.stringify(postData))
  })
})

describe('postForm method', () => {
  test('should make a post request to the correct URL with FormData body', async () => {
    let fetchArgs: FetchArgs = {
      url: '',
      options: {},
    }
    global.fetch = async (url: string, options: RequestInit) => {
      fetchArgs = {
        url,
        options: {
          ...options,
          headers: new Headers(options.headers),
        },
      }
      return {
        ok: true,
        json: async () => ({ message: 'Success' }),
      }
    }

    const fetchFactory = createFetchFactory({
      baseUrl: 'https://api.example.com',
      config: {
        test: {
          endpoint: '/test',
          method: 'POST',
        },
      },
    })
    const formData = new FormData()
    formData.append('key', 'value')
    // @ts-expect-error
    await fetchFactory.postForm({ endpoint: 'test', bodyData: formData })

    expect(fetchArgs.url).toBe('https://api.example.com/test')
    expect(fetchArgs.options.method).toBe('POST')
    // @ts-expect-error
    expect(fetchArgs?.options?.headers?.get(['content-type'])).toContain('multipart/form-data')
  })
})

describe('delete method', () => {
  test('should make a delete request to the correct URL', async () => {
    let fetchArgs: FetchArgs = {
      url: '',
      options: {},
    }
    global.fetch = async (url: string, options: RequestInit) => {
      fetchArgs = { url, options }
      return {
        ok: true,
        json: async () => ({ message: 'Success' }),
      }
    }

    const fetchFactory = createFetchFactory({
      baseUrl: 'https://api.example.com',
      config: {
        test: {
          endpoint: '/test',
          method: 'delete',
        },
      },
    })
    await fetchFactory.delete({ endpoint: 'test' })

    expect(fetchArgs.url).toBe('https://api.example.com/test')
    expect(fetchArgs.options.method).toBe('DELETE')
  })
})
