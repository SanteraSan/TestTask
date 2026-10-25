import { formatPrice } from '@/entities/goods'
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

export function OffersBoard({
  status,
  error,
  rows,
  sort,
  onSortChange,
  onRetry,
  brandsReady,
  resetKey,
}) {
  if (status === 'loading') {
    return <Loader label="Загружаем предложения" />
  }

  if (status === 'error') {
    return <AlertMessage message={error?.message} onRetry={onRetry} />
  }

  if (status === 'success' && rows.length === 0) {
    return (
      <EmptyState
        title="Нет предложений"
        description="Сервис не вернул остатки и аналоги по выбранному производителю."
      />
    )
  }

  if (status !== 'success') {
    if (!brandsReady) {
      return null
    }
    return (
      <EmptyState
        title="Выберите производителя"
        description="После выбора покажем предложения и аналоги."
      />
    )
  }

  return (
    <div>
      <p className="text-secondary mb-2">{rows.length} предложений</p>
      <DataTable
        key={resetKey}
        columns={columns}
        rows={rows}
        sort={sort}
        onSortChange={onSortChange}
        getRowKey={(row) => row.id}
      />
    </div>
  )
}
