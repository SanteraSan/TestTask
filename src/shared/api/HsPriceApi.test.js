import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './ApiError'
import { HsPriceApi } from './HsPriceApi'

const apiKey = '00000000-0000-0000-0000-000000000001'

function apiWith(get) {
  return new HsPriceApi({ get }, { apiKey })
}

describe('HsPriceApi', () => {
  it('requests manufacturers by article number', async () => {
    const get = vi.fn(async () => ({
      goods: [{ goodsID: '1', brand: 'FEBI', number: '01089' }],
    }))
    const api = apiWith(get)

    await expect(api.searchByNumber('01089')).resolves.toEqual({
      goods: [{ goodsID: '1', brand: 'FEBI', number: '01089' }],
    })
    expect(get).toHaveBeenCalledWith('/', {
      params: { key: apiKey, number: '01089' },
      signal: undefined,
    })
  })

  it('requests analogues with brand, analogues and info flags', async () => {
    const get = vi.fn(async () => ({ goods: [] }))
    const api = apiWith(get)
    const signal = new AbortController().signal

    await api.searchAnalogues('01089', 'Meat & Doria', { signal })

    expect(get).toHaveBeenCalledWith('/', {
      params: {
        key: apiKey,
        number: '01089',
        brand: 'Meat & Doria',
        analogues: 'on',
        info: 'on',
      },
      signal,
    })
  })

  it('rejects a payload without a goods array', async () => {
    const api = apiWith(async () => ({ items: [] }))

    await expect(api.searchByNumber('01089')).rejects.toMatchObject({
      kind: 'parse',
    })
  })

  it('rejects an empty client key before the request', async () => {
    const get = vi.fn()
    const api = new HsPriceApi({ get }, { apiKey: '' })

    await expect(api.searchByNumber('01089')).rejects.toBeInstanceOf(ApiError)
    await expect(api.searchByNumber('01089')).rejects.toMatchObject({
      kind: 'business',
      message: 'Empty key!',
    })
    expect(get).not.toHaveBeenCalled()
  })

  it('propagates a business error from the http client', async () => {
    const api = apiWith(async () => {
      throw new ApiError({
        kind: 'business',
        message: 'Request quota exceeded!',
        status: 200,
      })
    })

    await expect(api.searchAnalogues('01089', 'FEBI')).rejects.toMatchObject({
      kind: 'business',
      message: 'Request quota exceeded!',
    })
  })
})
