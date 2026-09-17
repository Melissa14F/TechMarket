const BADGE_CLASS = {
  'Nuevo': 'pc-badge--nuevo',
  'Gaming': 'pc-badge--gaming',
  'Oferta': 'pc-badge--oferta',
};

export default function ProductCard({ product, onAddToCart, onView }) {
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div onClick={() => onView(product)} className="pc-card">
      {/* Image */}
      <div className="pc-image-wrap">
        <img src={product.image} alt={product.name} className="pc-image" />
        {product.badge && (
          <span className={`pc-badge ${BADGE_CLASS[product.badge.label] ?? 'pc-badge--default'}`}>
            {product.badge.label}
          </span>
        )}
        {discount > 0 && (
          <span className="pc-discount-badge">
            -{discount}%
          </span>
        )}
        {product.stock === 'low' && !product.badge && (
          <span className="pc-low-stock-badge">
            Últimas unidades
          </span>
        )}
        {product.stock === 'out' && (
          <div className="pc-out-overlay">
            <span className="pc-out-label">Sin stock</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="pc-body">
        <div className="pc-brand">{product.brand}</div>
        <div className="pc-name">{product.name}</div>

        <Stars rating={product.rating} reviews={product.reviews} />

        <div className="pc-spacer" />

        {/* Price */}
        <div className="pc-price-row">
          <span className="pc-price">
            ${product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="pc-price-original">
              ${product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={e => { e.stopPropagation(); onAddToCart(product); }}
          disabled={product.stock === 'out'}
          className={`pc-add-btn ${product.stock === 'out' ? 'pc-add-btn--disabled' : ''}`}
        >
          {product.stock === 'out' ? 'Sin stock' : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Agregar al carrito
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Stars({ rating, reviews }) {
  return (
    <div className="pc-stars-row">
      <div className="pc-stars-icons">
        {[1,2,3,4,5].map(i => (
          <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#F59E0B' : '#E2E8F0'} stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>
      <span className="pc-stars-count">({reviews})</span>
    </div>
  );
}
