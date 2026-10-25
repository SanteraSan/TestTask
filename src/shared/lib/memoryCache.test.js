import { describe, expect, it } from 'vitest'
import { createMemoryCache } from './memoryCache'

describe('memoryCache', () => {
  it('returns a fresh value and drops it after the ttl', () => {
    let now = 1_000
    const cache = createMemoryCache({
      ttl: 60_000,
      now: () => now,
    })

    expect(cache.read('brands:01089')).toBeUndefined()

    cache.write('brands:01089', ['FEBI'])
    expect(cache.read('brands:01089')).toEqual(['FEBI'])

    now += 59_999
    expect(cache.read('brands:01089')).toEqual(['FEBI'])

    now += 1
    expect(cache.read('brands:01089')).toBeUndefined()
    expect(cache.read('brands:01089')).toBeUndefined()
  })

  it('replaces an expired value with the next write', () => {
    let now = 0
    const cache = createMemoryCache({
      ttl: 60_000,
      now: () => now,
    })

    cache.write('offers:01089:FEBI', [{ id: 'old' }])
    now += 60_000
    cache.write('offers:01089:FEBI', [{ id: 'new' }])

    expect(cache.read('offers:01089:FEBI')).toEqual([{ id: 'new' }])
  })
})
