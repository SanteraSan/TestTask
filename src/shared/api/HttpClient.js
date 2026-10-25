import { ApiError } from './ApiError'
import { apiMessages } from './messages'

export class HttpClient {
  constructor(axiosInstance) {
    this.axios = axiosInstance
  }

  async get(url, { params, signal } = {}) {
    try {
      const response = await this.axios.get(url, {
        params,
        signal,
        responseType: 'text',
        transformResponse: [(data) => data],
        validateStatus: () => true,
      })
      return interpretResponse(response.status, response.data)
    } catch (error) {
      if (error?.response) {
        return interpretResponse(error.response.status, error.response.data)
      }
      throw toTransportError(error)
    }
  }
}

export function interpretResponse(status, raw) {
  const body = parseBody(raw)
  const businessMessage = readBusinessError(body)
  if (businessMessage) {
    throw new ApiError({
      kind: 'business',
      message: businessMessage,
      status,
    })
  }
  if (status >= 400) {
    throw new ApiError({
      kind: 'http',
      message: apiMessages.http,
      status,
    })
  }
  return body
}

function parseBody(raw) {
  if (raw == null) {
    return null
  }
  if (typeof raw === 'object') {
    return raw
  }
  const text = String(raw).trim()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError({
      kind: 'parse',
      message: apiMessages.parse,
    })
  }
}

function readBusinessError(body) {
  if (!body || typeof body.error !== 'string') {
    return ''
  }
  return body.error.trim()
}

function toTransportError(error) {
  if (error instanceof ApiError) {
    return error
  }
  if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
    return new ApiError({
      kind: 'aborted',
      message: apiMessages.aborted,
    })
  }
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return new ApiError({
      kind: 'timeout',
      message: apiMessages.timeout,
    })
  }
  return new ApiError({
    kind: 'network',
    message: apiMessages.network,
  })
}
