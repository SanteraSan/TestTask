export const apiMessages = {
  network: 'Нет соединения с сервисом проценки',
  timeout: 'Сервис проценки не ответил вовремя',
  parse: 'Сервис вернул некорректный ответ',
  http: 'Сервис проценки временно недоступен',
  aborted: 'Запрос отменён',
  emptyKey: 'Не указан ключ покупателя.',
  invalidKey: 'Неверный ключ покупателя.',
  emptyNumber: 'Не указан номер детали.',
  quota: 'Превышен лимит запросов по грузовому ассортименту. Повторите поиск чуть позже.',
}

const knownBusinessErrors = {
  'empty key!': apiMessages.emptyKey,
  'invalid access key': apiMessages.invalidKey,
  'invalid key client!': apiMessages.invalidKey,
  'empty number goods!': apiMessages.emptyNumber,
  'request quota exceeded!': apiMessages.quota,
}

export function translateBusinessError(message) {
  const original = String(message || '').trim()
  return knownBusinessErrors[original.toLowerCase()] || original
}
