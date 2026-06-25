import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProgressProvider } from './context/ProgressContext'
import { ToastProvider } from './components/shared/Toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProgressProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ProgressProvider>
    </BrowserRouter>
  </React.StrictMode>
)