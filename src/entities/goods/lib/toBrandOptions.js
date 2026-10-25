import { normalizeGoods } from './normalizeGoods'
import { minWarehousePrice } from './warehousePrice'

export function toBrandOptions(goods) {
  return normalizeGoods(goods).map((good) => ({
    id: String(good.goodsID || `${good.brand}:${good.number}`),
    brand: String(good.brand || ''),
    name: String(good.name || ''),
    number: String(good.number || ''),
    stock: Number(good.count) || 0,
    minPrice: minWarehousePrice(good.warehouses),
  }))
}
