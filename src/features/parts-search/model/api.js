let api = null

export function configurePartsApi(nextApi) {
  api = nextApi
}

export function getPartsApi() {
  if (!api) {
    throw new Error('Parts API is not configured')
  }
  return api
}
