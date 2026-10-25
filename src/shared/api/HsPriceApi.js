import { ApiError } from './ApiError'
import { apiMessages } from './messages'

export class HsPriceApi {
  constructor(http, { apiKey }) {
    this.http = http
    this.apiKey = apiKey
  }

  searchByNumber(number, { signal } = {}) {
    return this.#search({ number }, { signal })
  }

  searchAnalogues(number, brand, { signal } = {}) {
    return this.#search(
      {
        number,
        brand,
        analogues: 'on',
        info: 'on',
      },
      { signal },
    )
  }

  async #search(params, { signal }) {
    if (!this.apiKey) {
      throw new ApiError({
        kind: 'business',
        message: 'Empty key!',
      })
    }

    const body = await this.http.get('/', {
      params: {
        key: this.apiKey,
        ...params,
      },
      signal,
    })

    if (!body || !Array.isArray(body.goods)) {
      throw new ApiError({
        kind: 'parse',
        message: apiMessages.parse,
      })
    }

    return { goods: body.goods }
  }
}
