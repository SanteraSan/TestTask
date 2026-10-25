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

function compareByColumn(left, right, sort) {
  const direction = sort.direction === 'desc' ? -1 : 1
  if (sort.key === 'price') {
    return (left.price - right.price) * direction
  }
  const field = sort.key === 'brand' ? 'brand' : 'name'
  return textCollator.compare(left[field], right[field]) * direction
}

function roleRank(role) {
  return role === 'analogue' ? 1 : 0
}

function availabilityRank(stock) {
  return stock > 0 ? 1 : 0
}
