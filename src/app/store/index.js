import { configureStore } from '@reduxjs/toolkit'

function appReducer(state = { ready: true }) {
  return state
}

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
})
