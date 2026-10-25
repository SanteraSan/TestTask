import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toBrandOptions, toOfferRows } from '@/entities/goods'
import { isAbortError } from '@/shared/api'
import { getPartsApi } from './api'
import { brandsCacheKey, offersCacheKey, searchCache } from './searchCache'

export const fetchBrands = createAsyncThunk(
  'partsSearch/fetchBrands',
  async (number, { signal, rejectWithValue }) => {
    try {
      const { goods } = await getPartsApi().searchByNumber(number, { signal })
      const brands = toBrandOptions(goods)
      searchCache.write(brandsCacheKey(number), brands)
      return brands
    } catch (error) {
      return rejectWithValue(toErrorPayload(error))
    }
  },
)

export const fetchOffers = createAsyncThunk(
  'partsSearch/fetchOffers',
  async ({ number, brand }, { signal, rejectWithValue }) => {
    try {
      const { goods } = await getPartsApi().searchAnalogues(number, brand, { signal })
      const offers = toOfferRows(goods)
      searchCache.write(offersCacheKey(number, brand), offers)
      return offers
    } catch (error) {
      return rejectWithValue(toErrorPayload(error))
    }
  },
)

function toErrorPayload(error) {
  if (isAbortError(error)) {
    return { kind: 'aborted', message: '' }
  }
  return {
    kind: error?.kind || 'http',
    message: error?.message || 'Не удалось выполнить запрос',
  }
}

const initialState = {
  number: '',
  query: '',
  brandsStatus: 'idle',
  brandsError: null,
  brands: [],
  selectedBrandId: null,
  selectedBrand: null,
  offersStatus: 'idle',
  offersError: null,
  offers: [],
}

const partsSearchSlice = createSlice({
  name: 'partsSearch',
  initialState,
  reducers: {
    numberChanged(state, action) {
      state.number = action.payload
    },
    resultsCleared(state) {
      state.query = ''
      state.brandsStatus = 'idle'
      state.brandsError = null
      state.brands = []
      state.selectedBrandId = null
      state.selectedBrand = null
      state.offersStatus = 'idle'
      state.offersError = null
      state.offers = []
    },
    brandChosen(state, action) {
      state.selectedBrandId = action.payload.id
      state.selectedBrand = action.payload.brand
    },
    brandsRestored(state, action) {
      state.query = action.payload.number
      state.brandsStatus = 'success'
      state.brandsError = null
      state.brands = action.payload.brands
      state.selectedBrandId = null
      state.selectedBrand = null
      state.offers = []
      state.offersStatus = 'idle'
      state.offersError = null
    },
    offersRestored(state, action) {
      state.offersStatus = 'success'
      state.offersError = null
      state.offers = action.payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        state.query = action.meta.arg
        state.brandsStatus = 'loading'
        state.brandsError = null
        state.brands = []
        state.selectedBrandId = null
        state.selectedBrand = null
        state.offers = []
        state.offersStatus = 'idle'
        state.offersError = null
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (state.query !== action.meta.arg) {
          return
        }
        state.brandsStatus = 'success'
        state.brands = action.payload
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (state.query !== action.meta.arg || action.payload?.kind === 'aborted' || action.meta.aborted) {
          return
        }
        state.brandsStatus = 'error'
        state.brandsError = action.payload ?? {
          kind: 'http',
          message: 'Не удалось получить производителей',
        }
      })
      .addCase(fetchOffers.pending, (state) => {
        state.offersStatus = 'loading'
        state.offersError = null
        state.offers = []
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (!isCurrentOffer(state, action.meta.arg)) {
          return
        }
        state.offersStatus = 'success'
        state.offers = action.payload
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (!isCurrentOffer(state, action.meta.arg) || action.payload?.kind === 'aborted' || action.meta.aborted) {
          return
        }
        state.offersStatus = 'error'
        state.offersError = action.payload ?? {
          kind: 'http',
          message: 'Не удалось получить предложения',
        }
      })
  },
})

function isCurrentOffer(state, arg) {
  return state.query === arg?.number && state.selectedBrand === arg?.brand
}

export const {
  numberChanged,
  resultsCleared,
  brandChosen,
  brandsRestored,
  offersRestored,
} = partsSearchSlice.actions
export const partsSearchReducer = partsSearchSlice.reducer
