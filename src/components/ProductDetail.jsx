import { useState } from 'react';
import '../styles/ProductDetail.css';

const BADGE_CLASS = {
  'Nuevo': 'pd-badge--nuevo',
  'Gaming': 'pd-badge--gaming',
  'Oferta': 'pd-badge--oferta',
};

export default function ProductDetail({ product, onBack, onAddToCart, onBuyNow, isFavorite, onToggleFavorite }) {
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const outOfStock = product.stock === 'out';
  const maxQty = Math.max(product.stockQty, 1);

  const handleBuyNow = async () => {
    setBuying(true);
    setBuyError('');
    try {
      await onBuyNow(product, qty);
    } catch (err) {
      setBuyError(err.message);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="pd-container">
      <button onClick={onBack} className="pd-back-btn">
        <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Volver
      </button>

      <div className="pd-grid">
        {/* Image */}
        <div className="pd-image-wrap">
          <img src={product.image} alt={product.name} className="pd-image" />
          {product.badge && (
            <span className={`pd-badge ${BADGE_CLASS[product.badge.label] ?? 'pd-badge--default'}`}>
              {product.badge.label}
            </span>
          )}
          {discount > 0 && <span className="pd-discount-badge">-{discount}%</span>}
        </div>

        {/* Info */}
        <div className="pd-info">
          <div className="pd-brand">{product.brand}</div>
          <h1 className="pd-name">{product.name}</h1>
          <div className="pd-category">{product.category}</div>

          <div className="pd-price-row">
            <span className="pd-price">${product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="pd-price-original">${product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {product.description && <p className="pd-description">{product.description}</p>}

          {!outOfStock && (
            <div className="pd-qty-row">
              <span className="pd-qty-label">Cantidad</span>
              <div className="pd-qty-wrap">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="pd-qty-btn">−</button>
                <span className="pd-qty-value">{qty}</span>
                <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} className="pd-qty-btn">+</button>
              </div>
            </div>
          )}

          {onToggleFavorite && (
            <button onClick={() => onToggleFavorite(product)} className="pd-favorite-btn">
              <svg className={`icon icon-16 icon-sw-2_5 ${isFavorite ? 'pd-favorite-icon--active' : ''}`} viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {isFavorite ? 'En tus favoritos' : 'Agregar a favoritos'}
            </button>
          )}

          <div className="pd-actions">
            <button
              onClick={() => onAddToCart(product, qty)}
              disabled={outOfStock}
              className={`pd-add-btn ${outOfStock ? 'pd-add-btn--disabled' : ''}`}
            >
              <svg className="icon icon-15 icon-sw-2_5" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Agregar al carrito
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock || buying}
              className={`pd-buy-btn ${outOfStock ? 'pd-buy-btn--disabled' : ''}`}
            >
              {buying ? 'Procesando…' : 'Comprar ahora →'}
            </button>
          </div>
          {buyError && <span className="pd-buy-error">{buyError}</span>}
        </div>
      </div>
    </div>
  );
}
