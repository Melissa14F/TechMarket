import { useState, useEffect } from 'react';
import { getProducts } from '../../services/productsService';
import ProductCard from '../ProductCard';

export default function FavoritesTab({ favorites, isFavorite, onToggleFavorite, onView }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getProducts({ soloDisponible: true })
      .then(({ data }) => { if (!cancelled) setProducts(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="ca-orders-status">Cargando tus favoritos…</div>;
  if (error) return <div className="ca-orders-status ca-orders-status--error">No se pudieron cargar tus favoritos.</div>;

  const favoriteProducts = favorites
    .map(f => products.find(p => p.name === f.producto))
    .filter(Boolean);

  if (favoriteProducts.length === 0) {
    return <div className="ca-orders-status">Todavía no marcaste productos como favoritos.</div>;
  }

  return (
    <div className="ca-favorites-grid">
      {favoriteProducts.map(p => (
        <ProductCard
          key={p.id}
          product={p}
          onView={onView}
          isFavorite={isFavorite(p.name)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
