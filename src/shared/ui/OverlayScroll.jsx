import { useLayoutEffect, useRef } from 'react'

export function OverlayScroll({ className, children }) {
  const scrollRef = useRef(null)
  const thumbRef = useRef(null)

  useLayoutEffect(() => {
    const node = scrollRef.current
    const thumb = thumbRef.current
    if (!node || !thumb) {
      return undefined
    }
    const sync = () => syncOverlayThumb(node, thumb)
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(node)
    if (node.firstElementChild) {
      observer.observe(node.firstElementChild)
    }
    return () => observer.disconnect()
  }, [children])

  function scrollByThumb(event) {
    const node = scrollRef.current
    const thumb = thumbRef.current
    if (!node || !thumb) {
      return
    }
    event.preventDefault()
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
    <div className={`overlay-scroll ${className || ''}`}>
      <div
        ref={scrollRef}
        className="overlay-scroll-viewport"
        onScroll={(event) => syncOverlayThumb(event.currentTarget, thumbRef.current)}
      >
        {children}
      </div>
      <div className="data-table-ybar overlay-scroll-bar" aria-hidden="true">
        <div ref={thumbRef} className="data-table-thumb" onPointerDown={scrollByThumb} />
      </div>
    </div>
  )
}

function syncOverlayThumb(node, thumb) {
  if (!node || !thumb) {
    return
  }
  const { scrollTop, scrollHeight, clientHeight } = node
  const canScroll = scrollHeight > clientHeight + 1
  thumb.hidden = !canScroll
  if (!canScroll) {
    return
  }
  const bar = thumb.parentElement
  bar.style.top = '4px'
  bar.style.height = `${Math.max(clientHeight - 8, 0)}px`
  const trackHeight = Math.max(clientHeight - 8, 0)
  const thumbHeight = Math.max(28, (clientHeight / scrollHeight) * trackHeight)
  const maxTop = Math.max(trackHeight - thumbHeight, 0)
  const maxScroll = scrollHeight - clientHeight
  const top = maxScroll <= 0 ? 0 : (scrollTop / maxScroll) * maxTop
  thumb.style.height = `${Math.min(thumbHeight, trackHeight)}px`
  thumb.style.transform = `translateY(${top}px)`
}
