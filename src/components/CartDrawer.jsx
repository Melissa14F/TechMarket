import { useState } from 'react';
import { getSavedShippingInfo } from '../services/clienteService';
import CheckoutModal from './CheckoutModal';
import '../styles/CartDrawer.css';

// Panel deslizable del carrito (se abre desde el ícono del carrito en el
// Header). Muestra los ítems agregados y permite finalizar la compra.
export default function CartDrawer({ open, items, userId, onClose, onRemove, onChangeQty, onCheckout }) {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false); // si se muestra el formulario de datos de envío
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // onCheckout itself redirects to login when nobody's signed in — no
  // point showing the order-details form to a guest, so this checks
  // first and skips straight to that redirect without opening it. Once
  // the client already has shipping info on file, the form only ever
  // showed up once (the first purchase) — later ones reuse it directly.
  const handleCheckoutClick = async () => {
    if (!userId) { onCheckout(); return; } // invitado: onCheckout lo redirige al login
    setCheckoutError('');
    const saved = await getSavedShippingInfo(userId).catch(() => null);
    if (saved) {
      // ya tiene dirección guardada -> compra directo, sin mostrar el formulario
      setCheckingOut(true);
      try {
        await onCheckout(0, saved);
      } catch (err) {
        setCheckoutError(err.message);
      } finally {
        setCheckingOut(false);
      }
    } else {
      setShowCheckoutForm(true); // primera compra -> pide los datos de envío
    }
  };

  // Confirma la compra una vez que el cliente completó el formulario de datos de envío.
  const handleConfirmOrder = async (orderDetails) => {
    setCheckingOut(true);
    setCheckoutError('');
    try {
      await onCheckout(0, orderDetails);
      setShowCheckoutForm(false);
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      {/* Fondo oscuro semitransparente, clic afuera cierra el panel */}
      <div onClick={onClose} className={`cd-overlay ${open ? 'cd-overlay--open' : ''}`} />
      <div className={`cd-drawer ${open ? 'cd-drawer--open' : ''}`}>
        {/* Encabezado del panel */}
        <div className="cd-header">
          <h2 className="cd-title">
            Carrito <span className="cd-title-count">({items.reduce((s, i) => s + i.qty, 0)} items)</span>
          </h2>
          <button onClick={onClose} className="cd-close-btn">×</button>
        </div>

        {/* Lista de productos en el carrito (o el mensaje de "carrito vacío") */}
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
                        <button onClick={() => onChangeQty(item.id, item.qty + 1)} disabled={item.qty >= item.stockQty} className="cd-qty-btn">+</button>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="cd-remove-btn">Eliminar</button>
                    </div>
                    {item.qty >= item.stockQty && <div className="cd-qty-limit">No hay más stock disponible</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total y botón de finalizar compra (solo si hay algo en el carrito) */}
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

      {/* Formulario de datos de envío, solo aparece cuando hace falta */}
      {showCheckoutForm && (
        <CheckoutModal
          userId={userId}
          total={total}
          submitting={checkingOut}
          error={checkoutError}
          onClose={() => setShowCheckoutForm(false)}
          onConfirm={handleConfirmOrder}
        />
      )}
    </>
  );
}
