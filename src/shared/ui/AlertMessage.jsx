import { Button } from './Button'

export function AlertMessage({ message, onRetry, retryLabel = 'Повторить' }) {
  return (
    <div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-3 mb-0" role="alert">
      <span>{message}</span>
      {onRetry ? (
        <Button variant="light" onClick={onRetry}>{retryLabel}</Button>
      ) : null}
    </div>
  )
}
