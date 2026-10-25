const textCollator = new Intl.Collator('ru', {
  sensitivity: 'base',
  numeric: true,
})

export function sortOfferRows(rows, sort) {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const compared = sort
        ? compareByColumn(left.row, right.row, sort)
        : compareDefault(left.row, right.row)
      if (compared !== 0) {
        return compared
      }
      return left.index - right.index
    })
    .map((item) => item.row)
}

function compareDefault(left, right) {
  const byRole = roleRank(left.role) - roleRank(right.role)
  if (byRole !== 0) {
    return byRole
  }
  const byStock = availabilityRank(right.stock) - availabilityRank(left.stock)
  if (byStock !== 0) {
    return byStock
  }
  return left.price - right.price
}

export function nextColumnSort(current, key) {
  if (!current || current.key !== key) {
    return { key, direction: 'asc' }
  }
  if (current.direction === 'asc') {
    return { key, direction: 'desc' }
  }
  return null
}

const textValue = {
  name: (row) => row.name,
  brand: (row) => row.brand,
  number: (row) => row.number,
  warehouse: (row) => row.warehouseCode || '—',
  role: (row) => roleLabel(row.role),
  notRefund: (row) => (row.notRefund ? 'Да' : 'Нет'),
}

function compareByColumn(left, right, sort) {
  const direction = sort.direction === 'desc' ? -1 : 1
  if (sort.key === 'price') {
    return (left.price - right.price) * direction
  }
  if (sort.key === 'stock') {
    return (left.stock - right.stock) * direction
  }
  if (sort.key === 'shipment') {
    return (shipmentTime(left) - shipmentTime(right)) * direction
  }
  const read = textValue[sort.key] || textValue.name
  return textCollator.compare(read(left), read(right)) * direction
}

function shipmentTime(row) {
  const time = Date.parse(row.shipmentDate)
  return Number.isFinite(time) ? time : 0
}

function roleLabel(role) {
  return role === 'analogue' ? 'Аналог' : 'Позиция'
}

function roleRank(role) {
  return role === 'analogue' ? 1 : 0
}

function availabilityRank(stock) {
  return stock > 0 ? 1 : 0
}
