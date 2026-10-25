import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { StoreProvider } from '@/app/providers/StoreProvider'
import '@/app/styles/index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const rootElement = document.getElementById('root')

createRoot(rootElement).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
