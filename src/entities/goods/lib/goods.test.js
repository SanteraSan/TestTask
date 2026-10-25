import { describe, expect, it } from 'vitest'
import { formatShipmentDate } from './format'
import { isEmptyGood, normalizeGoods } from './normalizeGoods'
import { nextColumnSort, sortOfferRows } from './sortOfferRows'
import { toBrandOptions } from './toBrandOptions'
import { toOfferRows } from './toOfferRows'

const sentinel = {
  brand: '',
  count: 0,
  goodsID: '00000000-0000-0000-0000-000000000000',
  name: '',
  number: '',
  price: 0,
  rate: 0,
  warehouses: [],
}

describe('goods mappers', () => {
  it('treats the not-found placeholder as an empty good', () => {
    expect(isEmptyGood(sentinel)).toBe(true)
    expect(normalizeGoods([sentinel])).toEqual([])
  })

  it('builds brand cards from warehouse prices, not the legacy price', () => {
    const [brand] = toBrandOptions([
      {
        goodsID: 'g1',
        brand: 'FEBI',
        number: '01089',
        name: 'Антифриз',
        count: 12,
        price: 9999,
        warehouses: [
          { price: 120, stock: 2 },
          { price: 80, stock: 10 },
        ],
      },
      sentinel,
    ])

    expect(brand).toEqual({
      id: 'g1',
      brand: 'FEBI',
      number: '01089',
      name: 'Антифриз',
      stock: 12,
      minPrice: 80,
    })
  })

  it('keeps a brand without warehouses selectable and without a price', () => {
    expect(toBrandOptions([
      {
        goodsID: 'g2',
        brand: 'OSSCA',
        number: '01089',
        name: 'Стеклоподъемник',
        count: 0,
        price: 577,
        warehouses: [],
      },
    ])).toEqual([
      {
        id: 'g2',
        brand: 'OSSCA',
        number: '01089',
        name: 'Стеклоподъемник',
        stock: 0,
        minPrice: null,
      },
    ])
  })

  it('expands each warehouse into an offer row and keeps a zero row without warehouses', () => {
    const rows = toOfferRows([
      {
        goodsID: 'origin',
        brand: 'MEYLE',
        number: '7160500039S',
        name: 'Рычаг',
        price: 1,
        notRefund: false,
        warehouses: [
          {
            id: 'w1',
            code: 'МС2',
            price: 12533.62,
            stock: 20,
            shipmentDate: '2019-05-31T15:30:00+03:00',
            notRefund: true,
          },
        ],
        analogues: [
          {
            goodsID: 'analogue',
            brand: 'Mapco',
            number: '53612/1',
            name: 'Комплект',
            warehouses: [],
          },
          sentinel,
        ],
      },
    ])

    expect(rows).toEqual([
      {
        id: 'original:origin:w1:0',
        goodsId: 'origin',
        role: 'original',
        name: 'Рычаг',
        brand: 'MEYLE',
        number: '7160500039S',
        warehouseCode: 'МС2',
        shipmentDate: '2019-05-31T15:30:00+03:00',
        price: 12533.62,
        stock: 20,
        notRefund: true,
      },
      {
        id: 'analogue:analogue:none:0',
        goodsId: 'analogue',
        role: 'analogue',
        name: 'Комплект',
        brand: 'Mapco',
        number: '53612/1',
        warehouseCode: '',
        shipmentDate: '',
        price: 0,
        stock: 0,
        notRefund: false,
      },
    ])
  })

  it('sorts the default list by role, availability and price', () => {
    const rows = sortOfferRows([
      row({ id: 'a', role: 'analogue', stock: 5, price: 10, name: 'Б' }),
      row({ id: 'b', role: 'original', stock: 0, price: 5, name: 'А' }),
      row({ id: 'c', role: 'original', stock: 2, price: 30, name: 'В' }),
      row({ id: 'd', role: 'original', stock: 1, price: 15, name: 'Г' }),
    ], null)

    expect(rows.map((item) => item.id)).toEqual(['d', 'c', 'b', 'a'])
  })

  it('shows shipment time in the service timezone', () => {
    expect(formatShipmentDate('2026-10-27T18:00:00+03:00')).toBe('27.10.2026, 18:00')
    expect(formatShipmentDate('')).toBe('—')
    expect(formatShipmentDate('not-a-date')).toBe('—')
  })

  it('sorts the whole list by name, brand and price', () => {
    const rows = [
      row({ id: '1', name: 'яблоко', brand: 'Якорь', price: 20 }),
      row({ id: '2', name: 'Арбуз', brand: 'Абрис', price: 5 }),
      row({ id: '3', name: 'Банан', brand: 'Бета', price: 5 }),
    ]

    expect(sortOfferRows(rows, { key: 'name', direction: 'asc' }).map((item) => item.id)).toEqual(['2', '3', '1'])
    expect(sortOfferRows(rows, { key: 'name', direction: 'desc' }).map((item) => item.id)).toEqual(['1', '3', '2'])
    expect(sortOfferRows(rows, { key: 'brand', direction: 'asc' }).map((item) => item.id)).toEqual(['2', '3', '1'])
    expect(sortOfferRows(rows, { key: 'price', direction: 'asc' }).map((item) => item.id)).toEqual(['2', '3', '1'])
    expect(sortOfferRows(rows, { key: 'price', direction: 'desc' }).map((item) => item.id)).toEqual(['1', '2', '3'])
  })

  it('sorts by offer type and cycles a column back to the default order', () => {
    const rows = [
      row({ id: 'original', role: 'original' }),
      row({ id: 'analogue', role: 'analogue' }),
    ]

    expect(sortOfferRows(rows, { key: 'role', direction: 'asc' }).map((item) => item.id)).toEqual(['analogue', 'original'])
    expect(sortOfferRows(rows, { key: 'role', direction: 'desc' }).map((item) => item.id)).toEqual(['original', 'analogue'])
    expect(nextColumnSort(null, 'role')).toEqual({ key: 'role', direction: 'asc' })
    expect(nextColumnSort({ key: 'role', direction: 'asc' }, 'role')).toEqual({ key: 'role', direction: 'desc' })
    expect(nextColumnSort({ key: 'role', direction: 'desc' }, 'role')).toBeNull()
    expect(sortOfferRows(rows, null).map((item) => item.id)).toEqual(['original', 'analogue'])
  })

  it('sorts number, warehouse, shipment, stock and refund flag', () => {
    const rows = [
      row({
        id: 'late',
        number: '100',
        warehouseCode: 'СПБ',
        shipmentDate: '2026-10-28T10:00:00+03:00',
        stock: 2,
        notRefund: false,
      }),
      row({
        id: 'early',
        number: '3',
        warehouseCode: 'ДМД',
        shipmentDate: '2026-10-26T10:00:00+03:00',
        stock: 10,
        notRefund: true,
      }),
      row({
        id: 'middle',
        number: '20',
        warehouseCode: 'МСК',
        shipmentDate: '',
        stock: 1,
        notRefund: false,
      }),
    ]

    expect(sortOfferRows(rows, { key: 'number', direction: 'asc' }).map((item) => item.id)).toEqual(['early', 'middle', 'late'])
    expect(sortOfferRows(rows, { key: 'warehouse', direction: 'asc' }).map((item) => item.id)).toEqual(['early', 'middle', 'late'])
    expect(sortOfferRows(rows, { key: 'shipment', direction: 'asc' }).map((item) => item.id)).toEqual(['middle', 'early', 'late'])
    expect(sortOfferRows(rows, { key: 'stock', direction: 'desc' }).map((item) => item.id)).toEqual(['early', 'late', 'middle'])
    expect(sortOfferRows(rows, { key: 'notRefund', direction: 'asc' }).map((item) => item.id)).toEqual(['early', 'late', 'middle'])
  })
})

function row(overrides) {
  return {
    id: 'id',
    goodsId: 'goods',
    role: 'original',
    name: 'Деталь',
    brand: 'Brand',
    number: '1',
    warehouseCode: '',
    shipmentDate: '',
    price: 0,
    stock: 0,
    notRefund: false,
    ...overrides,
  }
}
