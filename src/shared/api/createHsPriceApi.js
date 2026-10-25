import axios from 'axios'
import { HsPriceApi } from './HsPriceApi'
import { HttpClient } from './HttpClient'

export function createHsPriceApi({ apiUrl, apiKey, axiosInstance } = {}) {
  const client =
    axiosInstance ??
    axios.create({
      baseURL: String(apiUrl || '').replace(/\/$/, ''),
    })

  return new HsPriceApi(new HttpClient(client), { apiKey })
}
