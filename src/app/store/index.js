import { configureStore } from '@reduxjs/toolkit'
import { configurePartsApi, partsSearchReducer } from '@/features/parts-search'
import { createHsPriceApi } from '@/shared/api'
import { readApiConfig } from '@/shared/config/env'

configurePartsApi(createHsPriceApi(readApiConfig()))

export const store = configureStore({
  reducer: {
    partsSearch: partsSearchReducer,
  },
})
