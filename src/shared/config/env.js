export function readApiConfig(env = import.meta.env) {
  return {
    apiUrl: env.VITE_FAVORIT_API_URL || '',
    apiKey: env.VITE_FAVORIT_API_KEY || '',
  }
}
