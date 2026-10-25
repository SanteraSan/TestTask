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
    <div className="brand-list-scroll">
      <SelectableList
        items={items}
        selectedId={selectedId}
        onSelect={onSelect}
        getItemId={(item) => item.id}
        renderItem={(item) => (
          <>
            <span className="d-block text-truncate">
              <span className="fw-semibold">{item.brand}</span>
              {item.number ? <span> {item.number}</span> : null}
            </span>
            {item.name ? <span className="d-block small text-truncate">{item.name}</span> : null}
          </>
        )}
      />
    </div>
  )
}
