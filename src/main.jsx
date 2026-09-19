import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Punto de entrada de la aplicación: monta el componente App dentro del
// <div id="root"> del HTML, envuelto en los dos contextos globales
// (sesión y carrito) para que estén disponibles en toda la app.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)
