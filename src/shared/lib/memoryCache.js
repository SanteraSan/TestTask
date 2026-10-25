export function createMemoryCache({ ttl, now = () => Date.now() } = {}) {
  const entries = new Map()
  let clock = now

  return {
    setNow(nextNow) {
      clock = nextNow
    },
    read(key) {
      const entry = entries.get(key)
      if (!entry) {
        return undefined
      }
      if (clock() - entry.storedAt >= ttl) {
        entries.delete(key)
        return undefined
      }
      return entry.value
    },
    write(key, value) {
      entries.set(key, {
        storedAt: clock(),
        value,
      })
    },
    clear() {
      entries.clear()
    },
  }
}
