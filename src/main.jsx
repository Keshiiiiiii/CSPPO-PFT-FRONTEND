import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@flaticon/flaticon-uicons/css/all/all.css'
import './tailwind.css'   // Tailwind base — loaded first
import './CSS/index.css'  // Legacy design tokens — overrides Tailwind resets during migration
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
