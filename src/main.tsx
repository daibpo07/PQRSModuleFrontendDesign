import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/*
 * La presentación del ecosistema es una página estática que vive en
 * public/presentacion. Cuando el servidor responde con la app para esa ruta
 * (en desarrollo y en cualquier despliegue que redirija todo al SPA), la
 * mandamos al archivo real antes de montar nada.
 */
if (window.location.pathname.replace(/\/+$/, '') === '/presentacion') {
  window.location.replace('/presentacion/index.html')
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
