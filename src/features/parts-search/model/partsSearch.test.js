import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api'
import { configurePartsApi } from './api'
import {
  clearSearchResults,
  requestBrands,
  requestOffers,
  resetPartsSearchRuntime,
  retryBrands,
} from './commands'
import { fetchBrands, partsSearchReducer } from './partsSearchSlice'

describe('partsSearch', () => {
  beforeEach(() => {
    resetPartsSearchRuntime()
  })

  it('stores manufacturers and drops the not-found placeholder', async () => {
    configurePartsApi({
      searchByNumber: async () => ({
        goods: [
          good('FEBI'),
          {
            brand: '',
            name: '',
            number: '',
            goodsID: '00000000-0000-0000-0000-000000000000',
            warehouses: [],
          },
        ],
      }),
    })
    const store = createStore()

    await store.dispatch(requestBrands('01089'))

    const state = store.getState().partsSearch
    expect(state.brandsStatus).toBe('success')
    expect(state.brands.map((item) => item.brand)).toEqual(['FEBI'])
    expect(state.query).toBe('01089')
    expect(state.offers).toEqual([])
  })

  it('keeps a business error on the brand step', async () => {
    configurePartsApi({
      searchByNumber: async () => {
        throw new ApiError({
          kind: 'business',
          message: 'Request quota exceeded!',
          status: 200,
        })
      },
    })
    const store = createStore()

    await store.dispatch(fetchBrands('01089'))

    expect(store.getState().partsSearch.brandsStatus).toBe('error')
    expect(store.getState().partsSearch.brandsError).toEqual({
      kind: 'business',
      message: 'Request quota exceeded!',
    })
  })

  it('does not turn an aborted brand request into an error', async () => {
    configurePartsApi({
      searchByNumber: () => Promise.reject(new ApiError({ kind: 'aborted', message: '' })),
    })
    const store = createStore()

    await store.dispatch(fetchBrands('01089'))

    expect(store.getState().partsSearch.brandsStatus).toBe('loading')
    expect(store.getState().partsSearch.brandsError).toBeNull()
  })

  it('ignores a stale manufacturer response', async () => {
    let resolveOld
    configurePartsApi({
      searchByNumber(number) {
        if (number === '111111') {
          return new Promise((resolve) => {
            resolveOld = () => resolve({ goods: [good('OLD')] })
          })
        }
        return Promise.resolve({ goods: [good('NEW')] })
      },
    })
    const store = createStore()
    const first = store.dispatch(fetchBrands('111111'))
    const second = store.dispatch(fetchBrands('222222'))

    await second
    resolveOld()
    await first

    expect(store.getState().partsSearch.query).toBe('222222')
    expect(store.getState().partsSearch.brands.map((item) => item.brand)).toEqual(['NEW'])
  })

  it('does not repeat a successful request for the same article', async () => {
    const searchByNumber = vi.fn(async () => ({ goods: [good('FEBI')] }))
    configurePartsApi({ searchByNumber })
    const store = createStore()

    await store.dispatch(requestBrands('01089'))
    await store.dispatch(requestBrands('01089'))

    expect(searchByNumber).toHaveBeenCalledTimes(1)
  })

  it('loads offers for the chosen brand and keeps brands on failure', async () => {
    const searchAnalogues = vi
      .fn()
      .mockResolvedValueOnce({
        goods: [
          {
            ...good('FEBI'),
            analogues: [
              {
                goodsID: 'mapco',
                brand: 'Mapco',
                number: '53612',
                name: 'Комплект',
                warehouses: [{ id: 'w2', code: 'ПТ4', price: 40, stock: 2 }],
              },
            ],
          },
        ],
      })
      .mockRejectedValueOnce(new ApiError({
        kind: 'network',
        message: 'Нет соединения с сервисом проценки',
      }))
    configurePartsApi({
      searchByNumber: async () => ({ goods: [good('FEBI')] }),
      searchAnalogues,
    })
    const store = createStore()
    await store.dispatch(requestBrands('01089'))

    await store.dispatch(requestOffers({ id: 'FEBI', brand: 'FEBI' }))

    let state = store.getState().partsSearch
    expect(state.selectedBrand).toBe('FEBI')
    expect(state.offersStatus).toBe('success')
    expect(state.offers).toHaveLength(2)
    expect(state.brands).toHaveLength(1)

    await store.dispatch(requestOffers({ id: 'FEBI', brand: 'FEBI' }))
    state = store.getState().partsSearch
    expect(state.brandsStatus).toBe('success')
    expect(state.brands).toHaveLength(1)
    expect(state.offersStatus).toBe('error')
    expect(state.offersError.kind).toBe('network')
  })

  it('clears an in-flight search without surfacing the late response', async () => {
    let resolveSearch
    configurePartsApi({
      searchByNumber: () => new Promise((resolve) => {
        resolveSearch = () => resolve({ goods: [good('FEBI')] })
      }),
    })
    const store = createStore()
    const pending = store.dispatch(requestBrands('010890'))

    store.dispatch(clearSearchResults())
    resolveSearch()
    await pending

    const state = store.getState().partsSearch
    expect(state.brandsStatus).toBe('idle')
    expect(state.brands).toEqual([])
    expect(state.query).toBe('')
  })

  it('retries the current article after an error', async () => {
    const searchByNumber = vi
      .fn()
      .mockRejectedValueOnce(new ApiError({ kind: 'timeout', message: 'Сервис проценки не ответил вовремя' }))
      .mockResolvedValueOnce({ goods: [good('ASAM')] })
    configurePartsApi({ searchByNumber })
    const store = createStore()

    await store.dispatch(fetchBrands('01089'))
    await store.dispatch(retryBrands())

    expect(searchByNumber).toHaveBeenCalledTimes(2)
    expect(store.getState().partsSearch.brands.map((item) => item.brand)).toEqual(['ASAM'])
    expect(store.getState().partsSearch.brandsStatus).toBe('success')
  })
})

function createStore() {
  return configureStore({
    reducer: {
      partsSearch: partsSearchReducer,
    },
  })
}

function good(brand) {
  return {
    goodsID: brand,
    brand,
    number: '01089',
    name: brand,
    count: 1,
    price: 100,
    warehouses: [{ id: 'w1', code: 'МСК', price: 10, stock: 1 }],
  }
}
