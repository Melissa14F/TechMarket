import { useState } from 'react';
import { getOrders } from '../services/ordersService';

const MOCK_ORDERS = getOrders();

const STATUS_MAP = {
  entregado:  { label: 'Entregado',  color: '#16A34A', bg: '#DCFCE7', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
  enviado:    { label: 'En camino',  color: '#2563EB', bg: '#DBEAFE', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  procesando: { label: 'Procesando', color: '#D97706', bg: '#FEF3C7', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  cancelado:  { label: 'Cancelado',  color: '#DC2626', bg: '#FEE2E2', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
};

export default function ClientAccount({ userName, userEmail, cartItems, onChangeQty, onRemove, onBack, onLogout }) {
  const [tab, setTab] = useState('orders');
  const [expanded, setExpanded] = useState(null);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="ca-page">
      {/* Page header */}
      <div className="ca-header">
        <div className="ca-header-inner">
          <div className="ca-header-top">
            <div className="ca-header-user">
              <div className="ca-avatar">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <h1 className="ca-greeting">Hola, {userName}</h1>
                <p className="ca-email">{userEmail}</p>
              </div>
            </div>
            <div className="ca-header-actions">
              <button onClick={onBack} className="ca-back-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Volver a la tienda
              </button>
              <button onClick={onLogout} className="ca-logout-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="ca-tabs">
            {[
              { id: 'orders', label: 'Mis pedidos', count: MOCK_ORDERS.length, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
              { id: 'cart', label: 'Mi carrito', count: cartCount, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
              { id: 'profile', label: 'Mi perfil', count: null, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
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
        {tab === 'orders' && <OrdersTab expanded={expanded} setExpanded={setExpanded} />}
        {tab === 'cart' && <CartTab items={cartItems} onChangeQty={onChangeQty} onRemove={onRemove} cartTotal={cartTotal} />}
        {tab === 'profile' && <ProfileTab name={userName} email={userEmail} />}
      </div>
    </div>
  );
}

/* ─── Orders Tab ─── */
function OrdersTab({ expanded, setExpanded }) {
  const delivered = MOCK_ORDERS.filter(o => o.status === 'entregado').length;

  return (
    <div className="ca-orders-grid">
      <div className="ca-orders-list">
        {MOCK_ORDERS.map(order => {
          const s = STATUS_MAP[order.status];
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
                    <span className={`ca-order-status-pill ca-status--${order.status}`}>{s.icon}{s.label}</span>
                  </div>
                  <div className="ca-order-meta">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'} · {order.date}
                  </div>
                </div>

                <div className="ca-order-total-col">
                  <div className="ca-order-total">${order.total.toLocaleString()}</div>
                  <div className="ca-order-payment">{order.payment}</div>
                </div>

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`ca-order-chevron ${isOpen ? 'ca-order-chevron--open' : ''}`}>
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
                      { label: 'N° seguimiento', value: order.tracking, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                      { label: 'Dirección de entrega', value: order.address, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
                      { label: 'Método de pago', value: order.payment, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                    ].map((meta, i) => (
                      <div key={i} className={`ca-order-meta-cell ${i < 2 ? 'ca-order-meta-cell--bordered-r ca-order-meta-cell--bordered-b' : ''}`}>
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
                    {order.status === 'entregado' && (
                      <button className="ca-btn-outline">Volver a comprar</button>
                    )}
                    <button className="ca-btn-ghost">Ver comprobante</button>
                    {order.status !== 'cancelado' && order.status !== 'entregado' && (
                      <button className="ca-btn-danger-outline">Cancelar pedido</button>
                    )}
                  </div>
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
            { label: 'Total pedidos', value: MOCK_ORDERS.length, className: '' },
            { label: 'Entregados', value: delivered, className: 'ca-stat-value--success' },
            { label: 'Cancelados', value: MOCK_ORDERS.filter(o => o.status === 'cancelado').length, className: 'ca-stat-value--danger' },
            { label: 'Total gastado', value: `$${MOCK_ORDERS.filter(o => o.status === 'entregado').reduce((s, o) => s + o.total, 0).toLocaleString()}`, className: 'ca-stat-value--brand' },
          ].map(s => (
            <div key={s.label} className="ca-stat-row">
              <span className="ca-stat-label">{s.label}</span>
              <span className={`ca-stat-value ${s.className}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Last purchased */}
        <div className="ca-promo-card">
          <div className="ca-promo-label">Último pedido</div>
          <div className="ca-promo-order-id">{MOCK_ORDERS[0].id}</div>
          <div className="ca-promo-date">{MOCK_ORDERS[0].date}</div>
          <div className="ca-promo-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Entregado con éxito
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Cart Tab ─── */
function CartTab({ items, onChangeQty, onRemove, cartTotal }) {
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const shipping = cartTotal > 500 ? 0 : 12.99;
  const discount = couponApplied ? Math.round(cartTotal * 0.1) : 0;
  const finalTotal = cartTotal - discount + shipping;

  if (items.length === 0) return (
    <div className="ca-cart-empty">
      <div className="ca-cart-empty-icon-box">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
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
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
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
          {couponApplied && (
            <div className="ca-summary-row ca-summary-row--discount">
              <span>Cupón BIENVENIDO10</span>
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
            <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="BIENVENIDO10" disabled={couponApplied}
              className={`ca-coupon-input ${couponApplied ? 'ca-coupon-input--applied' : ''}`}
            />
            <button onClick={() => { if (coupon === 'BIENVENIDO10') setCouponApplied(true); }}
              disabled={couponApplied}
              className={`ca-coupon-apply-btn ${couponApplied ? 'ca-coupon-apply-btn--applied' : ''}`}>
              {couponApplied ? '✓' : 'Aplicar'}
            </button>
          </div>
        </div>

        <div className="ca-summary-divider">
          <div className="ca-summary-total-row">
            <span className="ca-summary-total-label">Total</span>
            <span className="ca-summary-total-value">${finalTotal.toLocaleString()}</span>
          </div>
        </div>

        <button className="ca-checkout-btn">Finalizar compra →</button>

        <div className="ca-secure-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="ca-secure-text">Pago 100% seguro y encriptado</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Tab ─── */
function ProfileTab({ name, email }) {
  const [firstName, lastName] = name.split(' ');
  const [saved, setSaved] = useState(false);
  return (
    <div className="ca-profile-grid">
      <div className="ca-profile-card ca-profile-card--full">
        <div className="ca-profile-card-title">Datos personales</div>
        <div className="ca-profile-fields-grid">
          <ProfileField label="Nombre" defaultValue={firstName ?? ''} />
          <ProfileField label="Apellido" defaultValue={lastName ?? ''} />
        </div>
        <ProfileField label="Correo electrónico" defaultValue={email} type="email" />
        <ProfileField label="Teléfono" defaultValue="+54 11 ···" />
        <div className="ca-profile-save-row">
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} className="ca-profile-save-btn">
            Guardar cambios
          </button>
          {saved && <span className="ca-profile-saved-msg">✓ Cambios guardados</span>}
        </div>
      </div>

      <div className="ca-profile-card">
        <div className="ca-profile-card-title">Dirección de envío</div>
        <ProfileField label="Calle y número" defaultValue="Av. Corrientes 1234" />
        <ProfileField label="Ciudad" defaultValue="Buenos Aires" />
        <ProfileField label="Provincia" defaultValue="CABA" />
        <ProfileField label="Código postal" defaultValue="C1043" />
      </div>

      <div className="ca-profile-card">
        <div className="ca-profile-card-title">Seguridad</div>
        <ProfileField label="Contraseña actual" type="password" defaultValue="••••••••" />
        <ProfileField label="Nueva contraseña" type="password" defaultValue="" placeholder="Mín. 8 caracteres" />
        <ProfileField label="Confirmar contraseña" type="password" defaultValue="" placeholder="Repetí la nueva contraseña" />
        <button className="ca-profile-change-pass-btn">Cambiar contraseña</button>
      </div>
    </div>
  );
}

function ProfileField({ label, defaultValue, type = 'text', placeholder }) {
  return (
    <div className="ca-field-wrap">
      <label className="ca-field-label">{label}</label>
      <input type={type} defaultValue={defaultValue} placeholder={placeholder} className="ca-field-input" />
    </div>
  );
}
