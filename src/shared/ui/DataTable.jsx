import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

const ROW_HEIGHT = 44

export function DataTable({ columns, rows, sort, onSortChange, getRowKey }) {
  const scrollRef = useRef(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  })
  const virtualRows = virtualizer.getVirtualItems()
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom = virtualRows.length > 0
    ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
    : 0

  return (
    <div ref={scrollRef} className="data-table-scroll table-responsive border rounded bg-white">
      <table className="table table-hover table-sm align-middle mb-0">
        <thead className="sticky-top">
          <tr>
            {columns.map((column) => {
              const active = sort?.key === column.key
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.sortable ? ariaSort(active, sort?.direction) : undefined}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none text-body text-nowrap"
                      onClick={() => onSortChange(column.key)}
                    >
                      {column.title}
                      <SortMark active={active} direction={sort?.direction} />
                    </button>
                  ) : column.title}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {paddingTop > 0 ? (
            <tr aria-hidden="true">
              <td colSpan={columns.length} style={{ height: paddingTop, padding: 0, border: 0 }} />
            </tr>
          ) : null}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index]
            return (
              <tr key={getRowKey(row)} style={{ height: ROW_HEIGHT }}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="text-truncate"
                    style={{ maxWidth: column.maxWidth }}
                    title={column.titleOf ? column.titleOf(row) : undefined}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            )
          })}
          {paddingBottom > 0 ? (
            <tr aria-hidden="true">
              <td colSpan={columns.length} style={{ height: paddingBottom, padding: 0, border: 0 }} />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

function ariaSort(active, direction) {
  if (!active) {
    return 'none'
  }
  return direction === 'desc' ? 'descending' : 'ascending'
}

function SortMark({ active, direction }) {
  if (!active) {
    return <span className="text-secondary ms-1">↕</span>
  }
  return <span className="ms-1">{direction === 'desc' ? '↓' : '↑'}</span>
}
