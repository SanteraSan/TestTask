export function minWarehousePrice(warehouses) {
  if (!Array.isArray(warehouses) || warehouses.length === 0) {
    return null
  }

  const prices = warehouses
    .map((warehouse) => Number(warehouse?.price))
    .filter((price) => Number.isFinite(price))

  if (prices.length === 0) {
    return null
  }

  return Math.min(...prices)
}
