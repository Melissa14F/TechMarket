import { useState, useEffect } from 'react';
import { getOrders, statusBucket, cancelOrder } from '../services/ordersService';
import { getProducts, incrementarVisita } from '../services/productsService';
import { getDiscounts, calculateDiscount } from '../services/discountsService';
import { getById as getClienteById, updateCliente, changePassword } from '../services/clienteService';
import ProductCard from './ProductCard';
import '../styles/ClientAccount.css';

const COUPON_ERROR_LABEL = {
  inactive: 'Este cupón ya no está activo.',
  expired: 'Este cupón venció.',
  max_uses: 'Este cupón alcanzó su límite de usos.',
  min_order: 'Tu compra no alcanza el mínimo requerido para este cupón.',
};

/**
 * Icon per status BUCKET, not per exact value — MockAPI's estado_orden
 * has 10 real values (Pendiente, Confirmado, En preparación, Enviado, En
 * camino, Entregado, Devuelto, Reembolsado, Cancelado, En espera de
 * pago); the label shown is always the real value itself, this only
 * picks which icon/color group it falls under.
 */
const BUCKET_ICON = {
  entregado:  <svg className="icon icon-13 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  enviado:    <svg className="icon icon-13" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  procesando: <svg className="icon icon-13" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  cancelado:  <svg className="icon icon-13" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const TERMINAL_STATUSES = new Set(['Entregado', 'Cancelado', 'Devuelto', 'Reembolsado']);

export default function ClientAccount({ userId, userName, userEmail, cartItems, onChangeQty, onRemove, onCheckout, onReorder, onView, favorites, isFavorite, onToggleFavorite, onBack, onLogout }) {
  const [tab, setTab] = useState('orders');
  const [expanded, setExpanded] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    let cancelled = false;
    setOrdersLoading(true);
    getOrders(userName)
      .then(data => { if (!cancelled) setOrders(data); })
      .catch(err => { if (!cancelled) setOrdersError(err.message); })
      .finally(() => { if (!cancelled) setOrdersLoading(false); });
    return () => { cancelled = true; };
  }, [userName, ordersRefreshKey]);

  const handleOrderPlaced = () => {
    setOrdersRefreshKey(k => k + 1);
    setTab('orders');
  };

  const handleReorder = (items) => {
    onReorder(items);
    setTab('cart');
  };

  const handleCancelOrder = async (order) => {
    await cancelOrder(order.rawId);
    setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Cancelado' } : o));
  };

  return (
    <div className="ca-page">
      {/* Page header */}
      <div className="ca-header">
        <div className="ca-header-inner">
          <div className="ca-header-top">
            <div className="ca-header-user">
              <div className="ca-avatar">
                <svg className="icon icon-26 icon-sw-1_8 icon-stroke-white" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <h1 className="ca-greeting">Hola, {userName}</h1>
                <p className="ca-email">{userEmail}</p>
              </div>
            </div>
            <div className="ca-header-actions">
              <button onClick={onBack} className="ca-back-btn">
                <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                Volver a la tienda
              </button>
              <button onClick={onLogout} className="ca-logout-btn">
                <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="ca-tabs">
            {[
              { id: 'orders', label: 'Mis pedidos', count: orders.length, icon: <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
              { id: 'favorites', label: 'Favoritos', count: favorites.length, icon: <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
              { id: 'cart', label: 'Mi carrito', count: cartCount, icon: <svg className="icon icon-15" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
              { id: 'profile', label: 'Mi perfil', count: null, icon: <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`ca-tab ${tab === t.id ? 'ca-tab--active' : ''}`}>
                {t.icon}
                {t.label}
                {t.count !== null && t.count > 0 && (
                  <span className={`ca-tab-count ${tab === t.id ? 'ca-tab-count--active' : ''}`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ca-content">
        {tab === 'orders' && (
          ordersLoading ? <div className="ca-orders-status">Cargando tus pedidos…</div> :
          ordersError ? <div className="ca-orders-status ca-orders-status--error">No se pudieron cargar tus pedidos.</div> :
          <OrdersTab orders={orders} expanded={expanded} setExpanded={setExpanded} onReorder={handleReorder} onCancelOrder={handleCancelOrder} />
        )}
        {tab === 'favorites' && (
          <FavoritesTab favorites={favorites} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} onView={onView} />
        )}
        {tab === 'cart' && <CartTab items={cartItems} onChangeQty={onChangeQty} onRemove={onRemove} cartTotal={cartTotal} onCheckout={onCheckout} onOrderPlaced={handleOrderPlaced} />}
        {tab === 'profile' && <ProfileTab userId={userId} />}
      </div>
    </div>
  );
}

/* ─── Favorites Tab ─── */
function FavoritesTab({ favorites, isFavorite, onToggleFavorite, onView }) {
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

/* ─── Orders Tab ─── */
function OrdersTab({ orders, expanded, setExpanded, onReorder, onCancelOrder }) {
  const delivered = orders.filter(o => o.status === 'Entregado').length;
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  const handleCancelClick = async (order) => {
    if (!window.confirm(`¿Seguro que querés cancelar el pedido ${order.id}?`)) return;
    setCancellingId(order.id);
    setCancelError(null);
    try {
      await onCancelOrder(order);
    } catch (err) {
      setCancelError({ orderId: order.id, message: err.message });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="ca-orders-grid">
      <div className="ca-orders-list">
        {orders.length === 0 && (
          <div className="ca-orders-status">Todavía no hiciste ningún pedido.</div>
        )}
        {orders.map(order => {
          const bucket = statusBucket(order.status);
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className={`ca-order-card ${isOpen ? 'ca-order-card--open' : ''}`}>
              {/* Order header */}
              <button onClick={() => setExpanded(isOpen ? null : order.id)} className="ca-order-header-btn">
                {/* Product thumbnails */}
                <div className="ca-order-thumbs">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} className={`ca-order-thumb ${i > 0 ? 'ca-order-thumb--stacked' : ''}`} />
                  ))}
                  {order.items.length > 3 && (
                    <div className="ca-order-thumb-more">+{order.items.length - 3}</div>
                  )}
                </div>

                <div className="ca-order-summary">
                  <div className="ca-order-id-row">
                    <span className="ca-order-id">{order.id}</span>
                    <span className={`ca-order-status-pill ca-status--${bucket}`}>{BUCKET_ICON[bucket]}{order.status}</span>
                  </div>
                  <div className="ca-order-meta">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'} · {order.date}
                  </div>
                </div>

                <div className="ca-order-total-col">
                  <div className="ca-order-total">${order.total.toLocaleString()}</div>
                  <div className="ca-order-payment">{order.payment}</div>
                </div>

                <svg className="`ca-order-chevron ${isOpen ? 'ca-order-chevron--open' : '' icon icon-16 icon-sw-2_5 icon-stroke-muted" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="ca-order-detail">
                  {/* Items list */}
                  <div className="ca-order-items-list">
                    {order.items.map((item, i) => (
                      <div key={i} className="ca-order-item-row">
                        <img src={item.image} alt={item.name} className="ca-order-item-img" />
                        <div className="ca-flex-1">
                          <div className="ca-order-item-name">{item.name}</div>
                          <div className="ca-order-item-meta">{item.brand} · Cantidad: {item.qty}</div>
                        </div>
                        <div className="ca-order-item-price">${item.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Metadata grid */}
                  <div className="ca-order-meta-grid">
                    {[
                      { label: 'N° seguimiento', value: order.tracking || 'Aún no disponible', icon: <svg className="icon icon-13" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                      { label: 'Dirección de entrega', value: order.address, icon: <svg className="icon icon-13" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
                      { label: 'Código postal', value: order.postalCode, icon: <svg className="icon icon-13" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
                      { label: 'Método de pago', value: order.payment, icon: <svg className="icon icon-13" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                    ].map((meta, i) => (
                      <div key={i} className={`ca-order-meta-cell ${i % 2 === 0 ? 'ca-order-meta-cell--bordered-r' : ''} ${i < 2 ? 'ca-order-meta-cell--bordered-b' : ''}`}>
                        <div className="ca-order-meta-label-row">
                          {meta.icon}
                          <span className="ca-order-meta-label">{meta.label}</span>
                        </div>
                        <div className="ca-order-meta-value">{meta.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="ca-order-actions">
                    {order.status === 'Entregado' && (
                      <button
                        onClick={() => onReorder(order.items)}
                        disabled={order.items.every(item => !item.id)}
                        className="ca-btn-outline"
                      >
                        Volver a comprar
                      </button>
                    )}
                    <button onClick={() => setReceiptOrder(order)} className="ca-btn-ghost">Ver comprobante</button>
                    {!TERMINAL_STATUSES.has(order.status) && (
                      <button
                        onClick={() => handleCancelClick(order)}
                        disabled={cancellingId === order.id}
                        className="ca-btn-danger-outline"
                      >
                        {cancellingId === order.id ? 'Cancelando…' : 'Cancelar pedido'}
                      </button>
                    )}
                  </div>
                  {cancelError?.orderId === order.id && (
                    <span className="ca-coupon-error">{cancelError.message}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar summary */}
      <div className="ca-sidebar">
        {/* Stats */}
        <div className="ca-sidebar-card">
          <div className="ca-sidebar-title">Resumen de compras</div>
          {[
            { label: 'Total pedidos', value: orders.length, className: '' },
            { label: 'Entregados', value: delivered, className: 'ca-stat-value--success' },
            { label: 'Cancelados', value: orders.filter(o => statusBucket(o.status) === 'cancelado').length, className: 'ca-stat-value--danger' },
            { label: 'Total gastado', value: `$${orders.filter(o => o.status === 'Entregado').reduce((s, o) => s + o.total, 0).toLocaleString()}`, className: 'ca-stat-value--brand' },
          ].map(s => (
            <div key={s.label} className="ca-stat-row">
              <span className="ca-stat-label">{s.label}</span>
              <span className={`ca-stat-value ${s.className}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Last purchased */}
        {orders.length > 0 && (
          <div className="ca-promo-card">
            <div className="ca-promo-label">Último pedido</div>
            <div className="ca-promo-order-id">{orders[0].id}</div>
            <div className="ca-promo-date">{orders[0].date}</div>
            <div className="ca-promo-badge">
              {BUCKET_ICON[statusBucket(orders[0].status)]}
              {orders[0].status}
            </div>
          </div>
        )}
      </div>

      {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}
    </div>
  );
}

function ReceiptModal({ order, onClose }) {
  return (
    <>
      <div onClick={onClose} className="ca-modal-overlay" />
      <div className="ca-modal">
        <div className="ca-modal-header">
          <h3 className="ca-modal-title">Comprobante {order.id}</h3>
          <button onClick={onClose} className="ca-modal-close">×</button>
        </div>
        <div className="ca-modal-body">
          <div className="ca-receipt-row"><span>Fecha</span><span>{order.date}</span></div>
          <div className="ca-receipt-row"><span>Estado</span><span>{order.status}</span></div>
          <div className="ca-receipt-row"><span>Método de pago</span><span>{order.payment}</span></div>
          <div className="ca-receipt-row"><span>Dirección</span><span>{order.address || '—'}</span></div>

          <div className="ca-receipt-divider" />

          {order.items.map((item, i) => (
            <div key={i} className="ca-receipt-row">
              <span>{item.name} × {item.qty}</span>
              <span>${(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}

          <div className="ca-receipt-divider" />

          <div className="ca-receipt-row ca-receipt-row--total">
            <span>Total</span>
            <span>${order.total.toLocaleString()}</span>
          </div>
        </div>
        <div className="ca-modal-actions">
          <button onClick={onClose} className="ca-btn-ghost">Cerrar</button>
          <button onClick={() => window.print()} className="ca-btn-outline">Imprimir</button>
        </div>
      </div>
    </>
  );
}

/* ─── Cart Tab ─── */
function CartTab({ items, onChangeQty, onRemove, cartTotal, onCheckout, onOrderPlaced }) {
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [discounts, setDiscounts] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getDiscounts().then(data => { if (!cancelled) setDiscounts(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const shipping = cartTotal > 500 ? 0 : 12.99;
  const discount = appliedDiscount?.amount ?? 0;
  const finalTotal = cartTotal - discount + shipping;

  const applyCoupon = () => {
    const match = discounts.find(d => d.code === coupon.trim().toUpperCase());
    if (!match) { setCouponError('Cupón no válido.'); return; }
    const result = calculateDiscount(match, cartTotal);
    if (!result.eligible) {
      setCouponError(COUPON_ERROR_LABEL[result.reason] ?? 'Este cupón no se puede aplicar.');
      return;
    }
    setCouponError('');
    setAppliedDiscount({ code: match.code, amount: result.amount });
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError('');
    try {
      await onCheckout(discount);
      onOrderPlaced();
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (items.length === 0) return (
    <div className="ca-cart-empty">
      <div className="ca-cart-empty-icon-box">
        <svg className="icon icon-32 icon-sw-1_5 icon-stroke-border" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      </div>
      <div className="ca-cart-empty-title">Tu carrito está vacío</div>
      <div className="ca-cart-empty-sub">Explorá nuestra tienda y encontrá algo que te guste</div>
    </div>
  );

  return (
    <div className="ca-cart-grid">
      {/* Items */}
      <div className="ca-cart-items">
        {items.map(item => (
          <div key={item.id} className="ca-cart-item">
            <img src={item.image} alt={item.name} className="ca-cart-item-img" />
            <div className="ca-flex-fill">
              <div className="ca-cart-item-name">{item.name}</div>
              <div className="ca-cart-item-brand">{item.brand}</div>
              <div className="ca-cart-item-controls">
                <div className="ca-qty-wrap">
                  <button onClick={() => item.qty <= 1 ? onRemove(item.id) : onChangeQty(item.id, item.qty - 1)} className="ca-qty-btn">−</button>
                  <span className="ca-qty-value">{item.qty}</span>
                  <button onClick={() => onChangeQty(item.id, item.qty + 1)} className="ca-qty-btn">+</button>
                </div>
                <button onClick={() => onRemove(item.id)} className="ca-cart-remove-btn">
                  <svg className="icon icon-13" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  Eliminar
                </button>
              </div>
            </div>
            <div className="ca-cart-item-total-col">
              <div className="ca-cart-item-total">${(item.price * item.qty).toLocaleString()}</div>
              {item.qty > 1 && <div className="ca-cart-item-unit">${item.price.toLocaleString()} c/u</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="ca-summary-card">
        <div className="ca-summary-title">Resumen del pedido</div>

        <div className="ca-summary-rows">
          <div className="ca-summary-row">
            <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span className="ca-summary-row-value">${cartTotal.toLocaleString()}</span>
          </div>
          {appliedDiscount && (
            <div className="ca-summary-row ca-summary-row--discount">
              <span>Cupón {appliedDiscount.code}</span>
              <span className="ca-summary-row-discount-value">−${discount.toLocaleString()}</span>
            </div>
          )}
          <div className="ca-summary-row">
            <span>Envío</span>
            <span className={`ca-summary-row-value ${shipping === 0 ? 'ca-summary-row-value--free' : ''}`}>{shipping === 0 ? 'Gratis' : `$${shipping}`}</span>
          </div>
          {shipping === 0 && <div className="ca-summary-free-ship">✓ Superaste el mínimo para envío gratis</div>}
        </div>

        {/* Coupon */}
        <div className="ca-coupon-wrap">
          <div className="ca-coupon-label">Código de descuento</div>
          <div className="ca-coupon-row">
            <input value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(''); }} placeholder="Código de cupón" disabled={!!appliedDiscount}
              className={`ca-coupon-input ${appliedDiscount ? 'ca-coupon-input--applied' : ''}`}
            />
            <button onClick={applyCoupon}
              disabled={!!appliedDiscount}
              className={`ca-coupon-apply-btn ${appliedDiscount ? 'ca-coupon-apply-btn--applied' : ''}`}>
              {appliedDiscount ? '✓' : 'Aplicar'}
            </button>
          </div>
          {couponError && <span className="ca-coupon-error">{couponError}</span>}
        </div>

        <div className="ca-summary-divider">
          <div className="ca-summary-total-row">
            <span className="ca-summary-total-label">Total</span>
            <span className="ca-summary-total-value">${finalTotal.toLocaleString()}</span>
          </div>
        </div>

        <button onClick={handleCheckout} disabled={checkingOut} className="ca-checkout-btn">
          {checkingOut ? 'Procesando…' : 'Finalizar compra →'}
        </button>
        {checkoutError && <span className="ca-coupon-error">{checkoutError}</span>}

        <div className="ca-secure-row">
          <svg className="icon icon-13 icon-stroke-muted" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="ca-secure-text">Pago 100% seguro y encriptado</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Tab ─── */
function ProfileTab({ userId }) {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState({ saving: false, error: '', success: false });

  useEffect(() => {
    let cancelled = false;
    getClienteById(userId)
      .then(data => { if (!cancelled) { setCliente(data); setDraft(data); } })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  const set = (key) => (v) => setDraft(d => ({ ...d, [key]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const result = await updateCliente(userId, draft);
      setCliente(result);
      setDraft(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPasswordStatus({ saving: false, error: 'Las contraseñas nuevas no coinciden.', success: false });
      return;
    }
    setPasswordStatus({ saving: true, error: '', success: false });
    try {
      await changePassword(userId, passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setPasswordStatus({ saving: false, error: '', success: true });
      setTimeout(() => setPasswordStatus(s => ({ ...s, success: false })), 2500);
    } catch (err) {
      setPasswordStatus({ saving: false, error: err.message, success: false });
    }
  };

  if (loading) return <div className="ca-orders-status">Cargando tu perfil…</div>;
  if (error || !draft) return <div className="ca-orders-status ca-orders-status--error">No se pudo cargar tu perfil.</div>;

  return (
    <div className="ca-profile-grid">
      <form onSubmit={handleSave} className="ca-profile-card ca-profile-card--full">
        <div className="ca-profile-card-title">Datos personales</div>
        <div className="ca-profile-fields-grid">
          <ProfileField label="Nombre" value={draft.name} onChange={set('name')} />
          <ProfileField label="Apellido" value={draft.lastName} onChange={set('lastName')} />
        </div>
        <ProfileField label="Correo electrónico" value={draft.email} onChange={set('email')} type="email" />
        <ProfileField label="Teléfono" value={draft.phone} onChange={set('phone')} />
        <div className="ca-profile-save-row">
          <button type="submit" disabled={saving} className="ca-profile-save-btn">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {saved && <span className="ca-profile-saved-msg">✓ Cambios guardados</span>}
          {saveError && <span className="ca-coupon-error">{saveError}</span>}
        </div>
      </form>

      <div className="ca-profile-card">
        <div className="ca-profile-card-title">Dirección de envío</div>
        <ProfileField label="Dirección" value={draft.address} onChange={set('address')} />
      </div>

      <form onSubmit={handleChangePassword} className="ca-profile-card">
        <div className="ca-profile-card-title">Seguridad</div>
        <ProfileField label="Contraseña actual" type="password" value={passwords.current} onChange={v => setPasswords(p => ({ ...p, current: v }))} />
        <ProfileField label="Nueva contraseña" type="password" value={passwords.next} onChange={v => setPasswords(p => ({ ...p, next: v }))} placeholder="Mín. 8 caracteres" />
        <ProfileField label="Confirmar contraseña" type="password" value={passwords.confirm} onChange={v => setPasswords(p => ({ ...p, confirm: v }))} placeholder="Repetí la nueva contraseña" />
        <button type="submit" disabled={passwordStatus.saving} className="ca-profile-change-pass-btn">
          {passwordStatus.saving ? 'Cambiando…' : 'Cambiar contraseña'}
        </button>
        {passwordStatus.success && <span className="ca-profile-saved-msg">✓ Contraseña actualizada</span>}
        {passwordStatus.error && <span className="ca-coupon-error">{passwordStatus.error}</span>}
      </form>
    </div>
  );
}

function ProfileField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="ca-field-wrap">
      <label className="ca-field-label">{label}</label>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="ca-field-input" />
    </div>
  );
}
