export default function CartDrawer({ open, items, onClose, onRemove, onChangeQty }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <>
      <div onClick={onClose} className={`cd-overlay ${open ? 'cd-overlay--open' : ''}`} />
      <div className={`cd-drawer ${open ? 'cd-drawer--open' : ''}`}>
        {/* Header */}
        <div className="cd-header">
          <h2 className="cd-title">
            Carrito <span className="cd-title-count">({items.reduce((s, i) => s + i.qty, 0)} items)</span>
          </h2>
          <button onClick={onClose} className="cd-close-btn">×</button>
        </div>

        {/* Items */}
        <div className="cd-items">
          {items.length === 0 ? (
            <div className="cd-empty">
              <div className="cd-empty-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <div className="cd-empty-title">Tu carrito está vacío</div>
              <div className="cd-empty-sub">Agrega productos para comenzar</div>
            </div>
          ) : (
            <div className="cd-list">
              {items.map(item => (
                <div key={item.id} className="cd-item">
                  <img src={item.image} alt={item.name} className="cd-item-img" />
                  <div className="cd-item-info">
                    <div className="cd-item-name">{item.name}</div>
                    <div className="cd-item-price">${item.price.toLocaleString()}</div>
                    <div className="cd-item-controls">
                      <div className="cd-qty-wrap">
                        <button onClick={() => item.qty <= 1 ? onRemove(item.id) : onChangeQty(item.id, item.qty - 1)} className="cd-qty-btn">−</button>
                        <span className="cd-qty-value">{item.qty}</span>
                        <button onClick={() => onChangeQty(item.id, item.qty + 1)} className="cd-qty-btn">+</button>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="cd-remove-btn">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cd-footer">
            <div className="cd-total-row">
              <span className="cd-total-label">Total</span>
              <span className="cd-total-value">${total.toLocaleString()}</span>
            </div>
            <button className="cd-checkout-btn">
              Finalizar compra →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
