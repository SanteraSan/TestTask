const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
})

export function formatPrice(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return '—'
  }
  return priceFormatter.format(amount)
}

export function formatShipmentDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) {
    return '—'
  }
  const [, year, month, day, hour, minute] = match
  return `${day}.${month}.${year}, ${hour}:${minute}`
}
