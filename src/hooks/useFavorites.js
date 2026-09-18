import { useState, useEffect, useCallback } from 'react';
import { getByCliente, add, remove } from '../services/favoritosService';

/**
 * `clienteName` is null when nobody's logged in as a client (guest, or
 * logged in as admin) — favorites stay empty and toggling is a no-op the
 * caller is expected to redirect to login instead of calling.
 */
export function useFavorites(clienteName) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clienteName) {
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

  const isFavorite = useCallback(
    (productName) => favorites.some(f => f.producto === productName),
    [favorites]
  );

  const toggleFavorite = useCallback(async (product) => {
    if (!clienteName) return;
    const existing = favorites.find(f => f.producto === product.name);
    if (existing) {
      await remove(existing.id);
      setFavorites(favs => favs.filter(f => f.id !== existing.id));
    } else {
      const created = await add(clienteName, product.name);
      setFavorites(favs => [...favs, created]);
    }
  }, [clienteName, favorites]);

  return { favorites, loading, isFavorite, toggleFavorite };
}
