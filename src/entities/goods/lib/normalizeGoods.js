export function isEmptyGood(good) {
  if (!good || typeof good !== 'object') {
    return true
  }

  const brand = String(good.brand ?? '').trim()
  const number = String(good.number ?? '').trim()
  const name = String(good.name ?? '').trim()
  return brand === '' && number === '' && name === ''
}

export function normalizeGoods(goods) {
  if (!Array.isArray(goods)) {
    return []
  }
  return goods.filter((good) => !isEmptyGood(good))
}
