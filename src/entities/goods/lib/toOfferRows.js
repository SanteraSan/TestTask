import { isEmptyGood, normalizeGoods } from './normalizeGoods'

export function toOfferRows(goods) {
  const rows = []

  for (const good of normalizeGoods(goods)) {
    rows.push(...rowsForGood(good, 'original'))
    const analogues = Array.isArray(good.analogues) ? good.analogues : []
    for (const analogue of analogues) {
      if (isEmptyGood(analogue)) {
        continue
      }
      rows.push(...rowsForGood(analogue, 'analogue'))
    }
  }

  return rows
}

function rowsForGood(good, role) {
  const warehouses = Array.isArray(good.warehouses) ? good.warehouses : []
  if (warehouses.length === 0) {
    return [createRow(good, null, role, 0)]
  }
  return warehouses.map((warehouse, index) => createRow(good, warehouse, role, index))
}

function createRow(good, warehouse, role, index) {
  const goodsId = String(good.goodsID || '')
  const warehouseId = warehouse?.id ? String(warehouse.id) : 'none'
  const notRefund = warehouse?.notRefund ?? good.notRefund

  return {
    id: `${role}:${goodsId}:${warehouseId}:${index}`,
    goodsId,
    role,
    name: String(good.name || ''),
    brand: String(good.brand || ''),
    number: String(good.number || ''),
    warehouseCode: warehouse?.code ? String(warehouse.code) : '',
    shipmentDate: warehouse?.shipmentDate ? String(warehouse.shipmentDate) : '',
    price: warehouse ? toAmount(warehouse.price) : 0,
    stock: warehouse ? toAmount(warehouse.stock) : 0,
    notRefund: Boolean(notRefund),
  }
}

function toAmount(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}
