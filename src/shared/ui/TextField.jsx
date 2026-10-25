export function TextField({ id, label, value, onChange, placeholder, hint, trailing }) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="d-flex align-items-center gap-2">
        <input
          id={id}
          className="form-control"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          onChange={(event) => onChange(event.target.value)}
        />
        {trailing}
      </div>
      {hint ? <div className="form-text">{hint}</div> : null}
    </div>
  )
}
