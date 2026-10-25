import { useLayoutEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { initialColumnWidths, resizeColumnWidths, scaleColumnWidths } from './columnWidths'

const ROW_HEIGHT = 44

export function DataTable({ columns, rows, sort, onSortChange, getRowKey }) {
  const scrollRef = useRef(null)
  const thumbRef = useRef(null)
  const labelRefs = useRef(new Map())
  const widthsRef = useRef(null)
  const minsRef = useRef(null)
  const containerWidthRef = useRef(0)
  const [widths, setWidths] = useState(null)
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
  const columnKey = columns.map((column) => column.key).join('|')

  useLayoutEffect(() => {
    const container = scrollRef.current
    if (!container) {
      return undefined
    }

    const measure = () => {
      const mins = columns.map((column) => measureMinWidth(labelRefs.current.get(column.key)))
      if (mins.some((min) => min <= 0)) {
        return
      }
      minsRef.current = mins
      const total = container.clientWidth
      const weights = columns.map((column) => column.weight || 1)
      const containerChanged = Math.abs(total - containerWidthRef.current) >= 1
      const next = !widthsRef.current || containerWidthRef.current === 0
        ? initialColumnWidths(total, weights, mins)
        : containerChanged
          ? scaleColumnWidths(widthsRef.current, mins, total)
          : widthsRef.current
      containerWidthRef.current = total
      if (sameWidths(widthsRef.current, next)) {
        return
      }
      widthsRef.current = next
      setWidths(next)
    }

    measure()
    syncScrollbar(container, thumbRef.current)
    const observer = new ResizeObserver(() => {
      measure()
      syncScrollbar(container, thumbRef.current)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [columnKey, columns, rows.length])

  useLayoutEffect(() => {
    const node = scrollRef.current
    const table = node?.querySelector('table')
    const sync = () => syncScrollbar(scrollRef.current, thumbRef.current)
    sync()
    if (!table) {
      return undefined
    }
    const observer = new ResizeObserver(sync)
    observer.observe(table)
    return () => observer.disconnect()
  })

  function startResize(event, index) {
    if (!widthsRef.current || !minsRef.current) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    const handle = event.currentTarget
    const startX = event.clientX
    const startWidths = widthsRef.current
    const mins = minsRef.current
    handle.setPointerCapture(event.pointerId)

    const move = (moveEvent) => {
      const next = resizeColumnWidths(startWidths, mins, index, moveEvent.clientX - startX)
      widthsRef.current = next
      setWidths(next)
    }
    const stop = (stopEvent) => {
      if (handle.hasPointerCapture(stopEvent.pointerId)) {
        handle.releasePointerCapture(stopEvent.pointerId)
      }
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', stop)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', stop)
  }

  function scrollByThumb(event) {
    const node = scrollRef.current
    const thumb = thumbRef.current
    if (!node || !thumb) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    const startY = event.clientY
    const startScroll = node.scrollTop
    const maxScroll = node.scrollHeight - node.clientHeight
    const track = node.clientHeight - thumb.offsetHeight
    thumb.setPointerCapture(event.pointerId)
    const move = (moveEvent) => {
      if (track <= 0) {
        return
      }
      node.scrollTop = startScroll + ((moveEvent.clientY - startY) / track) * maxScroll
    }
    const stop = (stopEvent) => {
      if (thumb.hasPointerCapture(stopEvent.pointerId)) {
        thumb.releasePointerCapture(stopEvent.pointerId)
      }
      thumb.removeEventListener('pointermove', move)
      thumb.removeEventListener('pointerup', stop)
    }
    thumb.addEventListener('pointermove', move)
    thumb.addEventListener('pointerup', stop)
  }

  return (
    <div className="data-table-frame">
      <div ref={scrollRef} className="data-table-scroll" onScroll={(event) => syncScrollbar(event.currentTarget, thumbRef.current)}>
      <table
        className="table table-hover table-sm align-middle mb-0 data-table"
        style={{ width: widths ? `${widths.reduce((sum, width) => sum + width, 0)}px` : '100%' }}
      >
        <colgroup>
          {columns.map((column, index) => (
            <col key={column.key} style={{ width: widths ? `${widths[index]}px` : undefined }} />
          ))}
        </colgroup>
        <thead className="sticky-top">
          <tr>
            {columns.map((column, index) => {
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
                      className="btn btn-link data-table-sort p-0 text-decoration-none text-body text-nowrap"
                      onClick={() => onSortChange(column.key)}
                    >
                      <span
                        className="data-table-label"
                        ref={(node) => {
                          if (node) {
                            labelRefs.current.set(column.key, node)
                          } else {
                            labelRefs.current.delete(column.key)
                          }
                        }}
                      >
                        {column.title}
                        <SortMark active={active} direction={sort?.direction} />
                      </span>
                    </button>
                  ) : (
                    <span
                      className="data-table-label"
                      ref={(node) => {
                        if (node) {
                          labelRefs.current.set(column.key, node)
                        }
                      }}
                    >
                      {column.title}
                    </span>
                  )}
                  {index < columns.length - 1 ? (
                    <span
                      className="data-table-resizer"
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`Изменить ширину столбца ${column.title}`}
                      onPointerDown={(event) => startResize(event, index)}
                    />
                  ) : null}
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
      <div className="data-table-ybar" aria-hidden="true">
        <div
          ref={thumbRef}
          className="data-table-thumb"
          onPointerDown={scrollByThumb}
        />
      </div>
    </div>
  )
}

function syncScrollbar(node, thumb) {
  if (!node || !thumb) {
    return
  }
  const { scrollTop, scrollHeight, clientHeight } = node
  const canScroll = scrollHeight > clientHeight + 1
  thumb.hidden = !canScroll
  if (!canScroll) {
    return
  }
  const header = node.querySelector('thead')
  const headerHeight = header?.offsetHeight ?? 0
  const bar = thumb.parentElement
  bar.style.top = `${headerHeight}px`
  const trackHeight = Math.max(clientHeight - headerHeight, 0)
  bar.style.height = `${trackHeight}px`
  const thumbHeight = Math.max(28, (clientHeight / scrollHeight) * trackHeight)
  const maxTop = Math.max(trackHeight - thumbHeight, 0)
  const maxScroll = scrollHeight - clientHeight
  const top = maxScroll <= 0 ? 0 : (scrollTop / maxScroll) * maxTop
  thumb.style.height = `${thumbHeight}px`
  thumb.style.transform = `translateY(${top}px)`
}

function sameWidths(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false
  }
  return left.every((width, index) => Math.abs(width - right[index]) < 0.5)
}

function measureMinWidth(label) {
  if (!label) {
    return 0
  }
  const cell = label.closest('th')
  const style = getComputedStyle(cell)
  const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
  const border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth)
  return Math.ceil(label.offsetWidth + padding + border)
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
