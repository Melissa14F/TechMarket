import { useState, useEffect, useCallback } from 'react';
import { getByCliente, add, remove } from '../services/favoritosService';

/**
 * `clienteName` is null when nobody's logged in as a client (guest, or
 * logged in as admin) — favorites stay empty and toggling is a no-op the
 * caller is expected to redirect to login instead of calling.
 */
// Hook que maneja los favoritos de un cliente: los carga, y da funciones
// para saber si un producto es favorito y para agregarlo/quitarlo.
export function useFavorites(clienteName) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga los favoritos cada vez que cambia el cliente logueado.
  useEffect(() => {
    if (!clienteName) {
      // sin cliente logueado (invitado o admin), no hay favoritos que mostrar
      setFavorites([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getByCliente(clienteName)
      .then(data => { if (!cancelled) setFavorites(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [clienteName]);

  // Revisa si un producto (por nombre) ya está en la lista de favoritos.
  const isFavorite = useCallback(
    (productName) => favorites.some(f => f.producto === productName),
    [favorites]
  );

  // Agrega o quita un producto de favoritos, según si ya estaba o no.
  const toggleFavorite = useCallback(async (product) => {
    if (!clienteName) return; // sin cliente logueado no hace nada
    const existing = favorites.find(f => f.producto === product.name);
    if (existing) {
      // ya era favorito -> lo quita
      await remove(existing.id);
      setFavorites(favs => favs.filter(f => f.id !== existing.id));
    } else {
      // no era favorito -> lo agrega
      const created = await add(clienteName, product.name);
      setFavorites(favs => [...favs, created]);
    }
  }, [clienteName, favorites]);

  return { favorites, loading, isFavorite, toggleFavorite };
}
