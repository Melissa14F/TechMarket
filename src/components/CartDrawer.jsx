import { useState } from 'react';
import '../styles/CartDrawer.css';

export default function CartDrawer({ open, items, onClose, onRemove, onChangeQty, onCheckout }) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // onCheckout itself redirects to login when nobody's signed in — this
  // only needs to worry about the real-checkout error/loading states.
  const handleCheckoutClick = async () => {
    setCheckingOut(true);
    setCheckoutError('');
    try {
      await onCheckout();
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

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
                <svg className="icon icon-32 icon-sw-1_5 icon-stroke-border" viewBox="0 0 24 24">
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
            <button onClick={handleCheckoutClick} disabled={checkingOut} className="cd-checkout-btn">
              {checkingOut ? 'Procesando…' : 'Finalizar compra →'}
            </button>
            {checkoutError && <span className="cd-checkout-error">{checkoutError}</span>}
          </div>
        )}
      </div>
    </>
  );
}
