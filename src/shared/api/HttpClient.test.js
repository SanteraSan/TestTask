import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './ApiError'
import { HttpClient } from './HttpClient'
import { apiMessages } from './messages'

function clientWith(get) {
  return new HttpClient({ get })
}

describe('HttpClient', () => {
  it('returns parsed JSON from a successful response', async () => {
    const http = clientWith(async () => ({
      status: 200,
      data: '{"goods":[]}',
    }))

    await expect(http.get('/')).resolves.toEqual({ goods: [] })
  })

  it('reads a business error from an HTTP 200 text body', async () => {
    const http = clientWith(async () => ({
      status: 200,
      data: '{"error":"Empty number goods!"}',
    }))

    await expect(http.get('/')).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'business',
      message: 'Empty number goods!',
      status: 200,
    })
  })

  it('reads a business error from HTTP 403', async () => {
    const http = clientWith(async () => ({
      status: 403,
      data: '{"error":"Invalid access key"}',
    }))

    await expect(http.get('/')).rejects.toMatchObject({
      kind: 'business',
      message: 'Invalid access key',
      status: 403,
    })
  })

  it('reports a parse error when an error status has a non-JSON body', async () => {
    const http = clientWith(async () => ({
      status: 500,
      data: 'unavailable',
    }))

    await expect(http.get('/')).rejects.toMatchObject({
      kind: 'parse',
      message: apiMessages.parse,
    })
  })

  it('reports an HTTP failure for a JSON body without error', async () => {
    const http = clientWith(async () => ({
      status: 502,
      data: '{"ok":false}',
    }))

    await expect(http.get('/')).rejects.toMatchObject({
      kind: 'http',
      status: 502,
      message: apiMessages.http,
    })
  })

  it('passes query params and the abort signal through', async () => {
    const signal = new AbortController().signal
    const get = vi.fn(async () => ({ status: 200, data: '{}' }))
    const http = clientWith(get)

    await http.get('/', { params: { number: '01089' }, signal })

    expect(get).toHaveBeenCalledWith('/', expect.objectContaining({
      params: { number: '01089' },
      signal,
      responseType: 'text',
      validateStatus: expect.any(Function),
    }))
  })

  it('maps a timeout to a timeout error', async () => {
    const http = clientWith(async () => {
      throw Object.assign(new Error('timeout'), { code: 'ECONNABORTED' })
    })

    await expect(http.get('/')).rejects.toMatchObject({
      kind: 'timeout',
      message: apiMessages.timeout,
    })
  })

  it('maps a canceled request to an aborted error', async () => {
    const http = clientWith(async () => {
      throw Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' })
    })

    await expect(http.get('/')).rejects.toBeInstanceOf(ApiError)
    await expect(http.get('/')).rejects.toMatchObject({ kind: 'aborted' })
  })

  it('maps a network failure to a network error', async () => {
    const http = clientWith(async () => {
      throw new Error('offline')
    })

    await expect(http.get('/')).rejects.toMatchObject({
      kind: 'network',
      message: apiMessages.network,
    })
  })

  it('reads an axios error response when the request throws', async () => {
    const http = clientWith(async () => {
      throw {
        response: {
          status: 403,
          data: '{"error":"Invalid access key"}',
        },
      }
    })

    await expect(http.get('/')).rejects.toMatchObject({
      kind: 'business',
      message: 'Invalid access key',
      status: 403,
    })
  })
})
