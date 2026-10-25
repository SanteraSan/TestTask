export class ApiError extends Error {
  constructor({ kind, message, status = null }) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

export function isAbortError(error) {
  return error instanceof ApiError && error.kind === 'aborted'
}
