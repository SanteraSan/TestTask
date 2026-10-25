const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatPrice(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return '—'
  }
  return priceFormatter.format(amount)
}

export function formatShipmentDate(value) {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return dateFormatter.format(date)
}
