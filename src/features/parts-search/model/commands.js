import { fetchBrands, fetchOffers, numberChanged, resultsCleared, brandChosen } from './partsSearchSlice'

let brandsRequest = null
let offersRequest = null

export function requestBrands(number, { force = false } = {}) {
  return (dispatch, getState) => {
    const state = getState().partsSearch
    if (!force && state.query === number && (state.brandsStatus === 'loading' || state.brandsStatus === 'success')) {
      return undefined
    }
    offersRequest?.abort()
    brandsRequest?.abort()
    brandsRequest = dispatch(fetchBrands(number))
    return brandsRequest
  }
}

export function retryBrands() {
  return (dispatch, getState) => {
    const { query } = getState().partsSearch
    if (!query) {
      return undefined
    }
    offersRequest?.abort()
    brandsRequest?.abort()
    brandsRequest = dispatch(fetchBrands(query))
    return brandsRequest
  }
}

export function requestOffers(brandOption) {
  return (dispatch, getState) => {
    const { query } = getState().partsSearch
    dispatch(brandChosen(brandOption))
    offersRequest?.abort()
    offersRequest = dispatch(fetchOffers({ number: query, brand: brandOption.brand }))
    return offersRequest
  }
}

export function retryOffers() {
  return (dispatch, getState) => {
    const { query, selectedBrand } = getState().partsSearch
    if (!query || !selectedBrand) {
      return undefined
    }
    offersRequest?.abort()
    offersRequest = dispatch(fetchOffers({ number: query, brand: selectedBrand }))
    return offersRequest
  }
}

export function changeNumber(value) {
  return (dispatch) => {
    dispatch(numberChanged(value))
  }
}

export function clearSearchResults() {
  return (dispatch) => {
    brandsRequest?.abort()
    offersRequest?.abort()
    brandsRequest = null
    offersRequest = null
    dispatch(resultsCleared())
  }
}

export function resetPartsSearchRuntime() {
  brandsRequest?.abort()
  offersRequest?.abort()
  brandsRequest = null
  offersRequest = null
}
