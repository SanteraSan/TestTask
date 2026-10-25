import { formatPrice } from '@/entities/goods'
import { countLabel } from '@/shared/lib/plural'
import { AlertMessage, DataTable, EmptyState, Loader } from '@/shared/ui'

const columns = [
  {
    key: 'name',
    title: 'Название',
    sortable: true,
    weight: 2,
    render: (row) => row.name,
    titleOf: (row) => row.name,
  },
  {
    key: 'brand',
    title: 'Производитель',
    sortable: true,
    weight: 1,
    render: (row) => row.brand,
    titleOf: (row) => row.brand,
  },
  {
    key: 'number',
    title: 'Номер',
    sortable: true,
    weight: 1,
    render: (row) => row.number,
    titleOf: (row) => row.number,
  },
  {
    key: 'price',
    title: 'Цена',
    sortable: true,
    weight: 1,
    render: (row) => formatPrice(row.price),
    titleOf: (row) => formatPrice(row.price),
  },
  {
    key: 'stock',
    title: 'Остаток',
    sortable: true,
    weight: 1,
    render: (row) => `${row.stock} шт.`,
    titleOf: (row) => `${row.stock} шт.`,
  },
]

const VISIBLE_ROW_OPTIONS = [5, 10, 15, 20]

export function OffersBoard({
  status,
  error,
  rows,
  sort,
  onSortChange,
  onRetry,
  brandsReady,
  resetKey,
  visibleRowCount,
  onVisibleRowCountChange,
}) {
  let body = null
  if (status === 'loading') {
    body = <Loader label="Загружаем предложения" />
  } else if (status === 'error') {
    body = <AlertMessage message={error?.message} onRetry={onRetry} />
  } else if (status === 'success' && rows.length === 0) {
    body = (
      <EmptyState
        title="Нет предложений"
        description="Сервис не вернул остатки и аналоги по выбранному производителю."
      />
    )
  } else if (!brandsReady) {
    body = null
  } else if (status !== 'success') {
    body = (
      <EmptyState
        title="Выберите производителя"
        description="После выбора покажем предложения и аналоги."
      />
    )
  } else {
    body = (
      <DataTable
        key={resetKey}
        columns={columns}
        rows={rows}
        sort={sort}
        onSortChange={onSortChange}
        getRowKey={(row) => row.id}
        visibleRowCount={visibleRowCount}
      />
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
        <h2 className="h5 mb-0">
          Предложения
          {status === 'success' ? (
            <span className="fw-normal text-secondary fs-6"> ({countLabel(rows.length, 'предложение', 'предложения', 'предложений')})</span>
          ) : null}
        </h2>
        {status === 'success' && rows.length > 0 ? (
          <label className="d-flex align-items-center gap-2 mb-0 text-secondary" htmlFor="visible-row-count">
            Показывать
            <select
              id="visible-row-count"
              className="form-select w-auto"
              value={visibleRowCount}
              onChange={(event) => onVisibleRowCountChange(Number(event.target.value))}
            >
              {VISIBLE_ROW_OPTIONS.map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      {body}
    </div>
  )
}
