import { createMemoryCache } from '@/shared/lib/memoryCache'

export const SEARCH_CACHE_TTL_MS = 60_000

export const searchCache = createMemoryCache({
  ttl: SEARCH_CACHE_TTL_MS,
})

export function brandsCacheKey(number) {
  return `brands:${String(number).trim()}`
}

export function offersCacheKey(number, brand) {
  return `offers:${String(number).trim()}:${String(brand).trim()}`
}
