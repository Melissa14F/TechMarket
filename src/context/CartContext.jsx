import { createContext, useContext, useState } from 'react';

// Contexto global del carrito de compras — así cualquier componente
// (Header, ProductCard, CartDrawer, etc.) puede agregar/quitar productos
// sin pasar el carrito como prop por todos lados.
const CartContext = createContext(null);

// Componente que envuelve toda la app y provee el estado del carrito.
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false); // si el panel del carrito está abierto o cerrado

  // Agrega un producto al carrito. Si ya estaba, le suma la cantidad en
  // vez de duplicar la fila; siempre abre el panel del carrito al agregar.
  const addToCart = (p, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...p, qty }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
  const changeQty = (id, qty) => setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  const clearCart = () => setCartItems([]);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0); // cantidad total de unidades (no de filas)

  return (
    <CartContext.Provider value={{
      cartItems, cartOpen, cartCount, addToCart, removeFromCart, changeQty, clearCart,
      openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para leer el contexto del carrito desde cualquier componente.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider'); // uso incorrecto: falta envolver con <CartProvider>
  return ctx;
}
