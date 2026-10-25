import axios from 'axios'
import { HsPriceApi } from './HsPriceApi'
import { HttpClient } from './HttpClient'

export const REQUEST_TIMEOUT_MS = 15000

export function createHsPriceApi({ apiUrl, apiKey, axiosInstance } = {}) {
  const client =
    axiosInstance ??
    axios.create({
      baseURL: String(apiUrl || '').replace(/\/$/, ''),
      timeout: REQUEST_TIMEOUT_MS,
    })

  return new HsPriceApi(new HttpClient(client), { apiKey })
}
