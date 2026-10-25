import { Provider } from 'react-redux'
import { store } from '@/app/store'

export function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>
}
