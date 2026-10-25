export function EmptyState({ title, description }) {
  return (
    <div className="alert alert-light border mb-0" role="status">
      <div className="fw-semibold">{title}</div>
      {description ? <div className="text-secondary">{description}</div> : null}
    </div>
  )
}
