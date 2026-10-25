export function Loader({ label }) {
  return (
    <div className="d-flex align-items-center gap-2 py-3" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
