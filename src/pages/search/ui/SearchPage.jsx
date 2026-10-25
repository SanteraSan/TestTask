import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { nextColumnSort, sortOfferRows } from '@/entities/goods'
import {
  SearchForm,
  changeNumber,
  clearSearchResults,
  requestBrands,
  requestOffers,
  retryBrands,
  retryOffers,
  selectBrands,
  selectBrandsError,
  selectBrandsStatus,
  selectNumber,
  selectOffers,
  selectOffersError,
  selectOffersStatus,
  selectSelectedBrandId,
} from '@/features/parts-search'
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue'
import { BrandList } from '@/widgets/brand-list'
import { OffersBoard } from '@/widgets/offers-board'

const MIN_QUERY_LENGTH = 3
const SEARCH_DELAY_MS = 400

export function SearchPage() {
  const dispatch = useDispatch()
  const number = useSelector(selectNumber)
  const debouncedNumber = useDebouncedValue(number, SEARCH_DELAY_MS)
  const brands = useSelector(selectBrands)
  const brandsStatus = useSelector(selectBrandsStatus)
  const brandsError = useSelector(selectBrandsError)
  const selectedBrandId = useSelector(selectSelectedBrandId)
  const offers = useSelector(selectOffers)
  const offersStatus = useSelector(selectOffersStatus)
  const offersError = useSelector(selectOffersError)
  const [sort, setSort] = useState(null)

  useEffect(() => {
    const query = debouncedNumber.trim()
    if (query.length < MIN_QUERY_LENGTH) {
      dispatch(clearSearchResults())
      return
    }
    dispatch(requestBrands(query))
  }, [debouncedNumber, dispatch])

  useEffect(() => {
    setSort(null)
  }, [debouncedNumber])

  const sortedRows = useMemo(() => sortOfferRows(offers, sort), [offers, sort])
  const brandsReady = brandsStatus === 'success' && brands.length > 0

  function handleNumberChange(value) {
    dispatch(changeNumber(value))
    if (value.trim().length < MIN_QUERY_LENGTH) {
      dispatch(clearSearchResults())
    }
  }

  function handleSearch() {
    const query = number.trim()
    if (query.length < MIN_QUERY_LENGTH || brandsStatus === 'loading') {
      return
    }
    dispatch(requestBrands(query, { force: true }))
  }

  function handleSort(key) {
    setSort((current) => nextColumnSort(current, key))
  }

  return (
    <main className="container py-4">
      <header className="mb-4">
        <h1 className="h3 mb-1">Проценка автозапчастей</h1>
        <p className="text-secondary mb-0">
          Сначала выберите производителя по артикулу, затем смотрите предложения и аналоги.
        </p>
      </header>

      <section className="card shadow-sm mb-4">
        <div className="card-body">
          <SearchForm
            value={number}
            onChange={handleNumberChange}
            onSearch={handleSearch}
            canSearch={number.trim().length >= MIN_QUERY_LENGTH && brandsStatus !== 'loading'}
          />
        </div>
      </section>

      <section className="mb-4">
        <h2 className="h5">Производители</h2>
        <BrandList
          status={brandsStatus}
          error={brandsError}
          items={brands}
          selectedId={selectedBrandId}
          onSelect={(brand) => dispatch(requestOffers(brand))}
          onRetry={() => dispatch(retryBrands())}
        />
      </section>

      {brandsReady ? (
        <section>
          <h2 className="h5">Предложения</h2>
          <OffersBoard
            status={offersStatus}
            error={offersError}
            rows={sortedRows}
            sort={sort}
            onSortChange={handleSort}
            onRetry={() => dispatch(retryOffers())}
            brandsReady={brandsReady}
            resetKey={selectedBrandId || 'none'}
          />
        </section>
      ) : null}
    </main>
  )
}
