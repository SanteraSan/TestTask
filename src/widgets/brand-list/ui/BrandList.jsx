import { formatPrice } from '@/entities/goods'
import { AlertMessage, EmptyState, Loader, SelectableList } from '@/shared/ui'

export function BrandList({ status, error, items, selectedId, onSelect, onRetry }) {
  if (status === 'loading') {
    return <Loader label="Ищем производителей" />
  }

  if (status === 'error') {
    return <AlertMessage message={error?.message} onRetry={onRetry} />
  }

  if (status === 'success' && items.length === 0) {
    return (
      <EmptyState
        title="Ничего не найдено"
        description="По этому артикулу нет производителей."
      />
    )
  }

  if (status !== 'success') {
    return (
      <EmptyState
        title="Введите артикул"
        description="Поиск начнётся после трёх символов."
      />
    )
  }

  return (
    <SelectableList
      items={items}
      selectedId={selectedId}
      onSelect={onSelect}
      getItemId={(item) => item.id}
      renderItem={(item) => (
        <span className="d-flex justify-content-between align-items-start gap-3 text-start">
          <span className="text-truncate">
            <span className="fw-semibold d-block text-truncate">{item.brand}</span>
            <span className="d-block small text-truncate">{item.name}</span>
            <span className="d-block small text-truncate">{item.number}</span>
          </span>
          <span className="text-end small text-nowrap">
            <span className="d-block">
              {item.minPrice == null ? 'Нет предложений' : `от ${formatPrice(item.minPrice)}`}
            </span>
            <span className="d-block">{item.stock} шт.</span>
          </span>
        </span>
      )}
    />
  )
}
