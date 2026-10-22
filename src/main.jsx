import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyLocale, getStoredLocale } from './i18n/locale.js'
import { applyTheme, DEFAULT_THEME } from './theme/theme.js'
import './styles/index.css'
import App from './App.jsx'

applyLocale(getStoredLocale())
applyTheme(DEFAULT_THEME)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
