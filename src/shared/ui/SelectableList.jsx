export function SelectableList({ items, selectedId, onSelect, getItemId, renderItem }) {
  return (
    <div className="list-group">
      {items.map((item) => {
        const id = getItemId(item)
        const selected = id === selectedId
        return (
          <button
            key={id}
            type="button"
            className={`list-group-item list-group-item-action ${selected ? 'active' : ''}`}
            aria-pressed={selected}
            onClick={() => onSelect(item)}
          >
            {renderItem(item)}
          </button>
        )
      })}
    </div>
  )
}
