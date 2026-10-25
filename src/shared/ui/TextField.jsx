export function TextField({ id, label, value, onChange, placeholder, hint }) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="form-control"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <div className="form-text">{hint}</div> : null}
    </div>
  )
}
