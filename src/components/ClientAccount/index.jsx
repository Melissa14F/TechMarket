import { useState, useEffect } from 'react';
import { getOrders, cancelOrder, rateOrderItem } from '../../services/ordersService';
import FavoritesTab from './FavoritesTab';
import OrdersTab from './OrdersTab';
import CartTab from './CartTab';
import ProfileTab from './ProfileTab';
import '../../styles/ClientAccount.css';

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

  const handleRateItem = async (order, item, stars) => {
    await rateOrderItem(item.detalleId, stars);
    setOrders(orders.map(o => o.id === order.id
      ? { ...o, items: o.items.map(it => it.detalleId === item.detalleId ? { ...it, rating: stars } : it) }
      : o
    ));
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
          <OrdersTab orders={orders} expanded={expanded} setExpanded={setExpanded} onReorder={handleReorder} onCancelOrder={handleCancelOrder} onRateItem={handleRateItem} />
        )}
        {tab === 'favorites' && (
          <FavoritesTab favorites={favorites} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} onView={onView} />
        )}
        {tab === 'cart' && <CartTab items={cartItems} userId={userId} onChangeQty={onChangeQty} onRemove={onRemove} cartTotal={cartTotal} onCheckout={onCheckout} onOrderPlaced={handleOrderPlaced} />}
        {tab === 'profile' && <ProfileTab userId={userId} />}
      </div>
    </div>
  );
}
