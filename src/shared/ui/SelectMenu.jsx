import { useEffect, useId, useRef, useState } from 'react'

export function SelectMenu({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const [opensUp, setOpensUp] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const labelId = useId()

  useEffect(() => {
    if (!open) {
      return undefined
    }
    function closeOnOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  function toggle() {
    const button = buttonRef.current
    if (button) {
      const rect = button.getBoundingClientRect()
      const menuHeight = options.length * 40 + 8
      const spaceBelow = window.innerHeight - rect.bottom
      setOpensUp(spaceBelow < menuHeight && rect.top > spaceBelow)
    }
    setOpen((current) => !current)
  }

  function choose(option) {
    onChange(option)
    setOpen(false)
  }

  return (
    <div className="select-menu" ref={rootRef}>
      <span id={labelId}>{label}</span>
      <button
        ref={buttonRef}
        type="button"
        className="select-menu-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={toggle}
      >
        {value}
      </button>
      {open ? (
        <ul
          className={`select-menu-list${opensUp ? ' select-menu-list-up' : ''}`}
          role="listbox"
          aria-labelledby={labelId}
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                className="select-menu-option"
                aria-selected={option === value}
                onClick={() => choose(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
