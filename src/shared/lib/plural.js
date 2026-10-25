export function pluralRu(count, one, few, many) {
  const value = Math.abs(Number(count)) % 100
  const last = value % 10
  if (value > 10 && value < 20) {
    return many
  }
  if (last > 1 && last < 5) {
    return few
  }
  if (last === 1) {
    return one
  }
  return many
}

export function countLabel(count, one, few, many) {
  return `${count} ${pluralRu(count, one, few, many)}`
}
