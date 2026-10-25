# Проценка автозапчастей

Клиентское приложение для поиска производителей по артикулу и просмотра предложений с аналогами через сервис Favorit `hsprice`.

## Запуск

```bash
cp .env.example .env
npm install
npm run dev
```

Демо-ключ из документации API уже указан в `.env.example`.

## Проверки

```bash
npm test
npm run build
```

## Стек

React, Redux Toolkit, Axios, Bootstrap 5, Vite. Серверное состояние хранится в Redux, запросы выполняет класс `HsPriceApi`.

Контракт сервиса описан в `docs/openapi.yaml`. Клиент сам разбирает JSON и не опирается на `Content-Type`: бизнес-ошибка может прийти и при HTTP 200 с заголовком `text/plain`.
