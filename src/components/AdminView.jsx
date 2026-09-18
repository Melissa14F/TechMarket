import { useState, useRef, useEffect, Fragment } from 'react';
import { useIsMobile } from '../hooks/useBreakpoint';
import { getProducts, createProduct, updateProduct, deleteProduct, getAllBanners, createBanner, updateBanner, deleteBanner } from '../services/productsService';
import { getCategories } from '../services/categoriesService';
import { getDiscounts } from '../services/discountsService';
import { getPageInfo, createPageInfo, updatePageInfo } from '../services/pageInfoService';
import { getMonthlySales, getRecentOrders as fetchRecentOrders, getAllOrders, updateOrderStatus, ORDER_STATUSES, statusBucket } from '../services/adminService';
import { changeAdminPassword } from '../services/authService';
import logo from '../imports/gato_sin_fondo-1.svg';
import '../styles/AdminView.css';

/** Rounds a 0–100 percentage to the nearest 5, for the .adm-h-N/.adm-w-N step classes. */
const step5 = (pct) => Math.min(100, Math.max(0, Math.round(pct / 5) * 5));

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: 'products', label: 'Productos', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { id: 'orders', label: 'Pedidos', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { id: 'categories', label: 'Categorías', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  { id: 'discounts', label: 'Descuentos', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  { id: 'banners', label: 'Anuncios', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { id: 'pageinfo', label: 'Info de la tienda', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
];

export default function AdminView({ onExit, onLogout, adminId, adminName, adminEmail, storeInfo }) {
  const [section, setSection] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(true);
  const [discountsError, setDiscountsError] = useState(null);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [bannersError, setBannersError] = useState(null);
  const [pageInfo, setPageInfo] = useState(null);
  const [pageInfoLoading, setPageInfoLoading] = useState(true);
  const [pageInfoError, setPageInfoError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(true);
  const [recentOrdersError, setRecentOrdersError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then(({ data }) => { if (!cancelled) setProducts(data); })
      .catch(err => { if (!cancelled) setProductsError(err.message); })
      .finally(() => { if (!cancelled) setProductsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAllBanners()
      .then(data => { if (!cancelled) setBanners(data); })
      .catch(err => { if (!cancelled) setBannersError(err.message); })
      .finally(() => { if (!cancelled) setBannersLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then(data => { if (!cancelled) setCategories(data); })
      .catch(err => { if (!cancelled) setCategoriesError(err.message); })
      .finally(() => { if (!cancelled) setCategoriesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getDiscounts()
      .then(data => { if (!cancelled) setDiscounts(data); })
      .catch(err => { if (!cancelled) setDiscountsError(err.message); })
      .finally(() => { if (!cancelled) setDiscountsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getPageInfo()
      .then(data => { if (!cancelled) setPageInfo(data); })
      .catch(err => { if (!cancelled) setPageInfoError(err.message); })
      .finally(() => { if (!cancelled) setPageInfoLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchRecentOrders()
      .then(data => { if (!cancelled) setRecentOrders(data); })
      .catch(err => { if (!cancelled) setRecentOrdersError(err.message); })
      .finally(() => { if (!cancelled) setRecentOrdersLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAllOrders()
      .then(data => { if (!cancelled) setOrders(data); })
      .catch(err => { if (!cancelled) setOrdersError(err.message); })
      .finally(() => { if (!cancelled) setOrdersLoading(false); });
    return () => { cancelled = true; };
  }, []);


  return (
    <div className="adm-root">
      {/* Sidebar — sticky on desktop, slide-over on mobile */}
      {!isMobile && (
        <aside className="adm-sidebar">
          <SidebarContent isMobile={isMobile} setSidebarOpen={setSidebarOpen} storeInfo={storeInfo} section={section} setSection={setSection} onExit={onExit} onLogout={onLogout} />
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} className="adm-sidebar-overlay" />
          <aside className="adm-sidebar adm-sidebar--mobile">
            <SidebarContent isMobile={isMobile} setSidebarOpen={setSidebarOpen} storeInfo={storeInfo} section={section} setSection={setSection} onExit={onExit} onLogout={onLogout} />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="adm-main">
        {/* Top bar */}
        <div className={`adm-topbar ${isMobile ? 'adm-topbar--mobile' : ''}`}>
          <div className="adm-topbar-left">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="adm-hamburger">
                <span className="adm-hamburger-bar" />
                <span className="adm-hamburger-bar" />
                <span className="adm-hamburger-bar" />
              </button>
            )}
            <h1 className={`adm-topbar-title ${isMobile ? 'adm-topbar-title--mobile' : ''}`}>
              {section === 'settings' ? 'Configuración' : NAV.find(n => n.id === section)?.label}
            </h1>
          </div>
          {!isMobile && (
            <div ref={userMenuRef} className="adm-topbar-user-wrap">
              <button onClick={() => setUserMenuOpen(v => !v)} className="adm-topbar-user">
                <div className="adm-topbar-avatar">
                  <svg className="icon icon-16 icon-stroke-white" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <div className="adm-topbar-user-name">{adminName}</div>
                  <div className="adm-topbar-user-email">{adminEmail}</div>
                </div>
                <svg className={`icon icon-13 icon-sw-2_5 icon-stroke-muted adm-topbar-user-chevron ${userMenuOpen ? 'adm-topbar-user-chevron--open' : ''}`} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {userMenuOpen && (
                <div className="adm-topbar-user-menu">
                  <button onClick={() => { setSection('settings'); setUserMenuOpen(false); }} className="adm-topbar-user-menu-item">
                    <svg className="icon icon-15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Configuración
                  </button>
                  <button onClick={onLogout} className="adm-topbar-user-menu-item adm-topbar-user-menu-item--danger">
                    <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`adm-content ${isMobile ? 'adm-content--mobile' : ''}`}>
          {section === 'dashboard' && (
            (productsLoading || discountsLoading || recentOrdersLoading) ? <div className="adm-status">Cargando panel…</div> :
            (productsError || discountsError || recentOrdersError) ? <div className="adm-status adm-status--error">No se pudo cargar el dashboard.</div> :
            <Dashboard products={products} discounts={discounts} recentOrders={recentOrders} />
          )}
          {section === 'products' && (
            productsLoading ? <div className="adm-status">Cargando productos…</div> :
            productsError ? <div className="adm-status adm-status--error">No se pudieron cargar los productos.</div> :
            <ProductsPanel products={products} setProducts={setProducts} />
          )}
          {section === 'orders' && (
            ordersLoading ? <div className="adm-status">Cargando pedidos…</div> :
            ordersError ? <div className="adm-status adm-status--error">No se pudieron cargar los pedidos.</div> :
            <OrdersPanel orders={orders} setOrders={setOrders} />
          )}
          {section === 'categories' && (
            categoriesLoading ? <div className="adm-status">Cargando categorías…</div> :
            categoriesError ? <div className="adm-status adm-status--error">No se pudieron cargar las categorías.</div> :
            <CategoriesPanel categories={categories} setCategories={setCategories} />
          )}
          {section === 'discounts' && (
            discountsLoading ? <div className="adm-status">Cargando descuentos…</div> :
            discountsError ? <div className="adm-status adm-status--error">No se pudieron cargar los descuentos.</div> :
            <DiscountsPanel discounts={discounts} setDiscounts={setDiscounts} />
          )}
          {section === 'banners' && (
            bannersLoading ? <div className="adm-status">Cargando anuncios…</div> :
            bannersError ? <div className="adm-status adm-status--error">No se pudieron cargar los anuncios.</div> :
            <BannersPanel banners={banners} setBanners={setBanners} />
          )}
          {section === 'pageinfo' && (
            pageInfoLoading ? <div className="adm-status">Cargando información de la tienda…</div> :
            pageInfoError ? <div className="adm-status adm-status--error">No se pudo cargar la información de la tienda.</div> :
            <PageInfoPanel info={pageInfo} setInfo={setPageInfo} />
          )}
          {section === 'settings' && <SettingsPanel adminId={adminId} />}
        </div>
      </div>
    </div>
  );
}

/**
 * Top-level, not defined inside AdminView — a component declared inside
 * another component's body gets a new identity every render, so React
 * remounts its DOM on every state change in the parent. No text input
 * lives here, so it never showed a visible bug, but it's the same
 * underlying issue as BannerForm/FiltersContent, fixed the same way.
 */
function SidebarContent({ isMobile, setSidebarOpen, storeInfo, section, setSection, onExit, onLogout }) {
  return (
    <>
      {/* Logo */}
      <div className="adm-sidebar-logo-wrap">
        <div className="adm-sidebar-logo-row">
          <div className="adm-sidebar-logo-info">
            <div className="adm-sidebar-logo-box">
              <img src={logo} alt={storeInfo.storeName} className="hdr-logo-img" />
            </div>
            <div>
              <div className="adm-sidebar-brand">{storeInfo.storeName}</div>
              <div className="adm-sidebar-subtitle">Panel Admin</div>
            </div>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="adm-sidebar-close">✕</button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="adm-sidebar-nav">
        {NAV.map(item => (
          <button key={item.id} onClick={() => { setSection(item.id); setSidebarOpen(false); }} className={`adm-sidebar-nav-btn ${section === item.id ? 'adm-sidebar-nav-btn--active' : ''}`}>
            {item.icon}{item.label}
          </button>
        ))}
      </nav>

      {/* Exit */}
      <div className="adm-sidebar-exit-wrap">
        {isMobile && (
          <button onClick={() => { setSection('settings'); setSidebarOpen(false); }} className="adm-sidebar-exit-btn adm-sidebar-exit-btn--neutral">
            <svg className="icon icon-15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Configuración
          </button>
        )}
        <button onClick={onExit} className="adm-sidebar-exit-btn">
          <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Volver a la tienda
        </button>
        {isMobile && (
          <button onClick={onLogout} className="adm-sidebar-exit-btn">
            <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
            Cerrar sesión
          </button>
        )}
      </div>
    </>
  );
}

const MONTHLY_SALES = getMonthlySales();

const ORDER_STATUS = {
  completado: { label: 'Completado' },
  enviado:    { label: 'Enviado' },
  procesando: { label: 'Procesando' },
  cancelado:  { label: 'Cancelado' },
};

/* ─── KPI card ─── */
function KpiCard({ label, value, delta, deltaLabel, colorClass = 'adm-kpi-icon-box--brand', icon, prefix = '' }) {
  const up = delta !== undefined && delta >= 0;
  return (
    <div className="adm-card">
      <div className="adm-kpi-header">
        <div className={`adm-kpi-icon-box ${colorClass}`}>{icon}</div>
        {delta !== undefined && (
          <div className={`adm-kpi-delta ${up ? 'adm-kpi-delta--up' : 'adm-kpi-delta--down'}`}>
            {up
              ? <svg className="icon icon-11 icon-sw-3" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
              : <svg className="icon icon-11 icon-sw-3" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            }
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div className="adm-kpi-value">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="adm-kpi-label">{label}</div>
      {deltaLabel && <div className="adm-kpi-delta-label">{deltaLabel}</div>}
    </div>
  );
}

/* ─── Mini sparkline ─── */
function Sparkline({ data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120, h = 40, pad = 4;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  const area = `M${pad},${h} L${pts.replace(/(\d+\.?\d*),(\d+\.?\d*)/g, '$1,$2 L').trimEnd()} L${w - pad},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="adm-sparkline-svg">
      <defs>
        <linearGradient id="adm-spark-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" className="adm-spark-stop-start" />
          <stop offset="100%" className="adm-spark-stop-end" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#adm-spark-gradient)" />
      <polyline points={pts} className="adm-spark-line" />
    </svg>
  );
}

/* ─── Bar chart ─── */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.ventas));
  return (
    <div className="adm-bar-chart">
      {data.map((d, i) => {
        const pct = d.ventas / max;
        const isLast = i === data.length - 1;
        return (
          <div key={d.mes} className="adm-bar-col">
            <div className={`adm-bar-value ${isLast ? 'adm-bar-value--last' : ''}`}>${(d.ventas / 1000).toFixed(0)}k</div>
            <div className={`adm-bar adm-h-${step5(pct * 100)} ${isLast ? 'adm-bar--last' : ''}`} />
            <div className={`adm-bar-label ${isLast ? 'adm-bar-label--last' : ''}`}>{d.mes}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Dashboard ─── */
function Dashboard({ products, discounts, recentOrders }) {
  const lowStock = products.filter(p => p.stock === 'low');
  const outStock = products.filter(p => p.stock === 'out');
  const activeDisc = discounts.filter(d => d.active);
  const totalRevenue = MONTHLY_SALES.reduce((s, m) => s + m.ventas, 0);
  const thisMonth = MONTHLY_SALES[MONTHLY_SALES.length - 1];
  const lastMonth = MONTHLY_SALES[MONTHLY_SALES.length - 2];
  const revDelta = Math.round(((thisMonth.ventas - lastMonth.ventas) / lastMonth.ventas) * 100);
  const ordDelta = Math.round(((thisMonth.ordenes - lastMonth.ordenes) / lastMonth.ordenes) * 100);

  // Category breakdown
  const catMap = {};
  products.forEach(p => {
    if (!catMap[p.category]) catMap[p.category] = { count: 0, revenue: 0 };
    catMap[p.category].count++;
    catMap[p.category].revenue += p.price;
  });
  const cats = Object.entries(catMap).sort((a, b) => b[1].revenue - a[1].revenue);
  const maxCatRev = cats[0]?.[1].revenue ?? 1;

  const conversionRate = 3.8;
  const avgOrder = Math.round(thisMonth.ventas / thisMonth.ordenes);

  return (
    <div className="adm-dash-col">

      {/* Date header */}
      <div className="adm-dash-header">
        <div>
          <h2 className="adm-dash-title">Resumen general</h2>
          <p className="adm-dash-subtitle">Septiembre 2026 · Actualizado hace 5 min</p>
        </div>
        <div className="adm-date-pill">
          <svg className="icon icon-14 icon-stroke-muted" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span className="adm-date-pill-text">Sep 2026</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="adm-kpi-row">
        <KpiCard label="Ingresos del mes" value={thisMonth.ventas} prefix="$" delta={revDelta} deltaLabel="vs. mes anterior" colorClass="adm-kpi-icon-box--brand"
          icon={<svg className="icon icon-20 icon-sw-1_8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <KpiCard label="Órdenes del mes" value={thisMonth.ordenes} delta={ordDelta} deltaLabel="vs. mes anterior" colorClass="adm-kpi-icon-box--blue"
          icon={<svg className="icon icon-20 icon-sw-1_8" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
        />
        <KpiCard label="Ticket promedio" value={`$${avgOrder.toLocaleString()}`} delta={5} deltaLabel="por orden" colorClass="adm-kpi-icon-box--purple"
          icon={<svg className="icon icon-20 icon-sw-1_8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
        />
        <KpiCard label="Tasa de conversión" value={`${conversionRate}%`} delta={0.4} deltaLabel="de visitas a compras" colorClass="adm-kpi-icon-box--green"
          icon={<svg className="icon icon-20 icon-sw-1_8" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
      </div>

      {/* Middle row: chart + alerts */}
      <div className="adm-mid-grid">

        {/* Sales chart */}
        <div className="adm-card">
          <div className="adm-chart-header">
            <div>
              <div className="adm-chart-title">Ventas mensuales</div>
              <div className="adm-chart-subtitle">Últimos 6 meses · Total ${(totalRevenue / 1000).toFixed(0)}k</div>
            </div>
            <div className="adm-legend-item">
              <div className="adm-legend-dot" />
              <span className="adm-legend-text">Ingresos</span>
            </div>
          </div>
          <BarChart data={MONTHLY_SALES} />
          {/* Ordenes sparkline */}
          <div className="adm-orders-trend">
            <div>
              <div className="adm-orders-trend-label">Tendencia de órdenes</div>
              <div className="adm-orders-trend-value">{MONTHLY_SALES.reduce((s, m) => s + m.ordenes, 0)} <span className="adm-orders-trend-suffix">órdenes totales</span></div>
            </div>
            <Sparkline data={MONTHLY_SALES.map(m => m.ordenes)} />
          </div>
        </div>

        {/* Alerts panel */}
        <div className="adm-alerts-col">

          {/* Stock alerts */}
          <div className="adm-alerts-card">
            <div className="adm-alerts-header">
              <div className={`adm-alert-dot ${lowStock.length + outStock.length > 0 ? 'adm-alert-dot--warn' : 'adm-alert-dot--ok'}`} />
              <span className="adm-alerts-title">Alertas de stock</span>
              {(lowStock.length + outStock.length) > 0 && (
                <span className="adm-alerts-count">{lowStock.length + outStock.length}</span>
              )}
            </div>
            {outStock.length > 0 && outStock.map(p => (
              <div key={p.id} className="adm-alert-row">
                <img src={p.image} className="adm-alert-thumb" />
                <div className="adm-flex-fill">
                  <div className="adm-alert-name">{p.name}</div>
                  <span className="adm-alert-tag adm-alert-tag--out">Sin stock</span>
                </div>
              </div>
            ))}
            {lowStock.length > 0 && lowStock.map(p => (
              <div key={p.id} className="adm-alert-row">
                <img src={p.image} className="adm-alert-thumb" />
                <div className="adm-flex-fill">
                  <div className="adm-alert-name">{p.name}</div>
                  <span className="adm-alert-tag adm-alert-tag--low">Stock bajo</span>
                </div>
              </div>
            ))}
            {lowStock.length + outStock.length === 0 && (
              <div className="adm-alerts-empty">Todo el stock está en orden ✓</div>
            )}
          </div>

          {/* Discount usage */}
          <div className="adm-alerts-card">
            <div className="adm-alerts-title adm-alerts-title--block">Cupones activos</div>
            {activeDisc.map(d => {
              const pct = Math.round((d.uses / d.maxUses) * 100);
              const nearLimit = pct >= 80;
              return (
                <div key={d.id} className="adm-coupon-block">
                  <div className="adm-coupon-header">
                    <span className="adm-coupon-code">{d.code}</span>
                    <span className={`adm-coupon-usage ${nearLimit ? 'adm-coupon-usage--near' : ''}`}>{d.uses}/{d.maxUses}</span>
                  </div>
                  <div className="adm-progress-track">
                    <div className={`adm-progress-fill adm-w-${step5(pct)} ${nearLimit ? 'adm-progress-fill--warn' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row: recent orders + top products */}
      <div className="adm-bottom-grid">

        {/* Recent orders */}
        <div className="adm-panel">
          <div className="adm-panel-header">
            <span className="adm-panel-title">Órdenes recientes</span>
            <span className="adm-panel-subtitle">Últimas 6</span>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                {['Orden', 'Cliente', 'Producto', 'Monto', 'Estado', 'Fecha'].map(h => (
                  <th key={h} className="adm-th adm-th--dashboard">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const s = ORDER_STATUS[o.status];
                return (
                  <tr key={o.id} className="adm-td-row">
                    <td className="adm-td adm-order-id-cell">{o.id}</td>
                    <td className="adm-td adm-order-customer-cell">{o.customer}</td>
                    <td className="adm-td adm-order-product-cell">{o.product}</td>
                    <td className="adm-td adm-order-amount-cell">${o.amount.toLocaleString()}</td>
                    <td className="adm-td">
                      <span className={`adm-order-status-badge adm-status--${o.status}`}>{s.label}</span>
                    </td>
                    <td className="adm-td adm-order-date-cell">{o.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top categories by revenue */}
        <div className="adm-alerts-card">
          <div className="adm-cat-revenue-title">Categorías por ingresos</div>
          <div className="adm-cat-revenue-subtitle">Basado en precio de catálogo</div>
          {cats.map(([cat, data], i) => {
            const pct = Math.round((data.revenue / maxCatRev) * 100);
            const colorClass = `adm-cat-color-${i % 7}`;
            return (
              <div key={cat} className="adm-cat-row">
                <div className="adm-cat-row-header">
                  <div className="adm-cat-row-left">
                    <div className={`adm-cat-dot ${colorClass}`} />
                    <span className="adm-cat-name">{cat}</span>
                  </div>
                  <span className="adm-cat-count">{data.count} prod.</span>
                </div>
                <div className="adm-cat-bar-track">
                  <div className={`adm-cat-bar-fill adm-w-${step5(pct)} ${colorClass}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const STOCK_LABEL = { available: 'Disponible', low: 'Stock bajo', out: 'Sin stock' };

function StockBadge({ stock }) {
  return <span className={`adm-stock-badge adm-stock-badge--${stock}`}>{STOCK_LABEL[stock]}</span>;
}

/** Mirrors productsService's stockLevel() threshold, only for the live
 * preview shown next to the quantity input — the real status is always
 * derived server-side (from the same real `stock` number) on reload. */
function previewStockStatus(qty) {
  const n = Number(qty);
  if (n <= 0) return 'out';
  if (n <= 5) return 'low';
  return 'available';
}

/** Applies a free-form accent color (picked via a color input, so it has
 * no fixed set of values) through the CSS custom property App.css reads,
 * set imperatively via ref instead of a JSX style attribute. */
function AccentDot({ color }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.style.setProperty('--accent', color);
  }, [color]);
  return <div ref={ref} className="adm-banner-accent-dot" />;
}

/* ─── Shared UI primitives ─── */
function SectionHeader({ title, action }) {
  return (
    <div className="adm-section-header">
      <h2 className="adm-section-title">{title}</h2>
      {action}
    </div>
  );
}

function AddBtn({ onClick, label = 'Agregar' }) {
  return (
    <button onClick={onClick} className="adm-add-btn">
      <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      {label}
    </button>
  );
}

function IconBtn({ onClick, danger, title, children }) {
  return (
    <button onClick={onClick} title={title} className={`adm-icon-btn ${danger ? 'adm-icon-btn--danger' : ''}`}>{children}</button>
  );
}

function Th({ children }) {
  return <th className="adm-th">{children}</th>;
}

function Td({ children, className = '' }) {
  return <td className={`adm-td ${className}`}>{children}</td>;
}

function FormField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="adm-form-field">
      <label className="adm-form-label">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="adm-form-input" />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} className="adm-modal-overlay" />
      <div className="adm-modal">
        <div className="adm-modal-header">
          <h3 className="adm-modal-title">{title}</h3>
          <button onClick={onClose} className="adm-modal-close">×</button>
        </div>
        <div className="adm-modal-body">{children}</div>
      </div>
    </>
  );
}

function SaveBtn({ label = 'Guardar cambios', disabled }) {
  return (
    <button type="submit" className="adm-save-btn" disabled={disabled}>{label}</button>
  );
}

/* ─── Products Panel ─── */
function ProductsPanel({ products, setProducts }) {
  const [editItem, setEditItem] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [blank] = useState({ name: '', description: '', brand: '', category: '', price: 0, image: '', stockQty: 0 });
  const [draft, setDraft] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const del = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      setFormError(err.message);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);
    setFormError('');
    try {
      const result = await updateProduct(editItem.id, editItem);
      setProducts(products.map(p => p.id === editItem.id ? result : p));
      setEditItem(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const result = await createProduct(draft);
      setProducts([...products, result]);
      setAdding(false);
      setDraft(blank);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title={`Productos (${products.length})`} action={<AddBtn onClick={() => setAdding(true)} label="Nuevo producto" />} />

      {/* Search */}
      <div className="adm-search-wrap">
        <svg className="adm-search-icon icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..." className="adm-search-input" />
      </div>

      <div className="adm-panel">
        <table className="adm-table">
          <thead><tr><Th>Producto</Th><Th>Categoría</Th><Th>Precio</Th><Th>Stock</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className={i > 0 ? 'adm-td-row' : ''}>
                <Td>
                  <div className="adm-cell-thumb-row">
                    <img src={p.image} alt={p.name} className="adm-cell-thumb" />
                    <div>
                      <div className="adm-cell-name">{p.name}</div>
                      <div className="adm-cell-brand">{p.brand}</div>
                    </div>
                  </div>
                </Td>
                <Td className="adm-text-muted">{p.category}</Td>
                <Td><span className="adm-price-main">${p.price.toLocaleString()}</span>{p.originalPrice && <span className="adm-price-original">${p.originalPrice.toLocaleString()}</span>}</Td>
                <Td>
                  <div className="adm-stock-cell">
                    <span className="adm-stock-qty">{p.stockQty} u.</span>
                    <StockBadge stock={p.stock} />
                  </div>
                </Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => setEditItem({ ...p })} title="Editar">
                      <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </IconBtn>
                    <IconBtn onClick={() => del(p.id)} danger title="Eliminar">
                      <svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editItem && (
        <Modal title="Editar producto" onClose={() => setEditItem(null)}>
          <form onSubmit={saveEdit}>
            <FormField label="Nombre" value={editItem.name} onChange={v => setEditItem({ ...editItem, name: v })} />
            <FormField label="Descripción" value={editItem.description ?? ''} onChange={v => setEditItem({ ...editItem, description: v })} />
            <FormField label="Marca" value={editItem.brand} onChange={v => setEditItem({ ...editItem, brand: v })} />
            <FormField label="Categoría" value={editItem.category} onChange={v => setEditItem({ ...editItem, category: v })} />
            <div className="adm-form-grid-2">
              <FormField label="Precio ($)" type="number" value={editItem.price} onChange={v => setEditItem({ ...editItem, price: Number(v) })} />
              <FormField label="Precio original ($)" type="number" value={editItem.originalPrice ?? ''} onChange={v => setEditItem({ ...editItem, originalPrice: v ? Number(v) : undefined })} placeholder="Opcional" />
            </div>
            <FormField label="URL de imagen" value={editItem.image} onChange={v => setEditItem({ ...editItem, image: v })} />
            <div className="adm-form-field">
              <label className="adm-form-label">Stock (unidades)</label>
              <div className="adm-stock-input-row">
                <input type="number" min="0" value={editItem.stockQty} onChange={e => setEditItem({ ...editItem, stockQty: e.target.value })} className="adm-form-input" />
                <StockBadge stock={previewStockStatus(editItem.stockQty)} />
              </div>
            </div>
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setEditItem(null)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Guardando…' : 'Guardar cambios'} />
            </div>
          </form>
        </Modal>
      )}

      {/* Add modal */}
      {adding && (
        <Modal title="Nuevo producto" onClose={() => setAdding(false)}>
          <form onSubmit={saveAdd}>
            <FormField label="Nombre" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
            <FormField label="Descripción" value={draft.description ?? ''} onChange={v => setDraft({ ...draft, description: v })} />
            <FormField label="Marca" value={draft.brand} onChange={v => setDraft({ ...draft, brand: v })} />
            <FormField label="Categoría" value={draft.category} onChange={v => setDraft({ ...draft, category: v })} />
            <div className="adm-form-grid-2">
              <FormField label="Precio ($)" type="number" value={draft.price} onChange={v => setDraft({ ...draft, price: Number(v) })} />
              <FormField label="Precio original ($)" type="number" value={draft.originalPrice ?? ''} onChange={v => setDraft({ ...draft, originalPrice: v ? Number(v) : undefined })} placeholder="Opcional" />
            </div>
            <FormField label="URL de imagen" value={draft.image} onChange={v => setDraft({ ...draft, image: v })} />
            <div className="adm-form-field">
              <label className="adm-form-label">Stock (unidades)</label>
              <div className="adm-stock-input-row">
                <input type="number" min="0" value={draft.stockQty} onChange={e => setDraft({ ...draft, stockQty: e.target.value })} className="adm-form-input" />
                <StockBadge stock={previewStockStatus(draft.stockQty)} />
              </div>
            </div>
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setAdding(false)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Creando…' : 'Crear producto'} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ─── Orders Panel ─── */
function OrdersPanel({ orders, setOrders }) {
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorById, setErrorById] = useState({});

  const handleStatusChange = async (order, newEstado) => {
    setUpdatingId(order.id);
    setErrorById(e => ({ ...e, [order.id]: '' }));
    try {
      await updateOrderStatus(order.id, newEstado);
      setOrders(orders.map(o => o.id === order.id ? { ...o, estado: newEstado } : o));
    } catch (err) {
      setErrorById(e => ({ ...e, [order.id]: err.message }));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <SectionHeader title={`Pedidos (${orders.length})`} />
      <div className="adm-panel">
        <table className="adm-table">
          <thead>
            <tr>
              <Th>Orden</Th><Th>Cliente</Th><Th>Fecha</Th><Th>Total</Th><Th>Estado</Th><Th>Seguimiento</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => {
              const isOpen = expanded === o.id;
              return (
                <Fragment key={o.id}>
                  <tr className={i > 0 ? 'adm-td-row' : ''}>
                    <Td className="adm-order-id-cell">{o.displayId}</Td>
                    <Td>{o.customer}</Td>
                    <Td className="adm-text-muted adm-text-sm">{o.date}</Td>
                    <Td className="adm-order-amount-cell">${o.total.toLocaleString()}</Td>
                    <Td>
                      <div className="adm-order-status-cell">
                        <select
                          value={o.estado}
                          onChange={e => handleStatusChange(o, e.target.value)}
                          disabled={updatingId === o.id}
                          className={`adm-order-status-select adm-status--${statusBucket(o.estado)}`}
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errorById[o.id] && <span className="adm-form-error">{errorById[o.id]}</span>}
                      </div>
                    </Td>
                    <Td className="adm-text-muted adm-text-sm">{o.tracking || '—'}</Td>
                    <Td>
                      <IconBtn onClick={() => setExpanded(isOpen ? null : o.id)} title={isOpen ? 'Ocultar' : 'Ver detalle'}>
                        <svg className={`icon icon-16 icon-sw-2_5 ${isOpen ? 'adm-chevron--open' : ''}`} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                      </IconBtn>
                    </Td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={7} className="adm-order-detail-cell">
                        <div className="adm-order-detail-grid">
                          <div>
                            <div className="adm-order-detail-label">Productos</div>
                            {o.items.length === 0 ? (
                              <div className="adm-text-muted adm-text-sm">Sin líneas de detalle cargadas para este pedido.</div>
                            ) : o.items.map((item, idx) => (
                              <div key={idx} className="adm-order-detail-item">
                                {item.image && <img src={item.image} alt={item.name} className="adm-order-detail-img" />}
                                <span className="adm-flex-fill">{item.name} × {item.qty}</span>
                                <span className="adm-text-muted">${(item.price * item.qty).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div className="adm-order-detail-label">Envío</div>
                            <div className="adm-text-sm">{o.address || '—'}</div>
                            <div className="adm-text-sm adm-text-muted">{o.postalCode}</div>
                            <div className="adm-order-detail-label adm-order-detail-label--spaced">Pago</div>
                            <div className="adm-text-sm">{o.payment}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Categories Panel ─── */
function CategoriesPanel({ categories, setCategories }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', description: '', count: 0, active: true });

  const del = (id) => setCategories(categories.filter(c => c.id !== id));
  const toggle = (id) => setCategories(categories.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const saveEdit = (e) => { e.preventDefault(); if (!editing) return; setCategories(categories.map(c => c.id === editing.id ? editing : c)); setEditing(null); };
  const saveAdd = (e) => {
    e.preventDefault();
    const id = categories.length > 0 ? Math.max(...categories.map(c => Number(c.id))) + 1 : 1;
    setCategories([...categories, { ...draft, id }]);
    setAdding(false);
    setDraft({ name: '', description: '', count: 0, active: true });
  };

  return (
    <div>
      <SectionHeader title={`Categorías (${categories.length})`} action={<AddBtn onClick={() => setAdding(true)} label="Nueva categoría" />} />
      <div className="adm-panel">
        <table className="adm-table">
          <thead><tr><Th>Nombre</Th><Th>Descripción</Th><Th>Productos</Th><Th>Activa</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.id} className={i > 0 ? 'adm-td-row' : ''}>
                <Td><span className="adm-text-strong">{cat.name}</span></Td>
                <Td className="adm-text-muted">{cat.description || '—'}</Td>
                <Td>{cat.count}</Td>
                <Td>
                  <button onClick={() => toggle(cat.id)} className={`adm-toggle ${cat.active ? 'adm-toggle--on' : ''}`}>
                    <div className={`adm-toggle-knob ${cat.active ? 'adm-toggle-knob--on' : ''}`} />
                  </button>
                </Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => setEditing({ ...cat })} title="Editar"><svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
                    <IconBtn onClick={() => del(cat.id)} danger title="Eliminar"><svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Editar categoría" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit}>
            <FormField label="Nombre" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} />
            <FormField label="Descripción" value={editing.description} onChange={v => setEditing({ ...editing, description: v })} />
            <div className="adm-form-actions">
              <button type="button" onClick={() => setEditing(null)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn />
            </div>
          </form>
        </Modal>
      )}
      {adding && (
        <Modal title="Nueva categoría" onClose={() => setAdding(false)}>
          <form onSubmit={saveAdd}>
            <FormField label="Nombre" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
            <FormField label="Descripción" value={draft.description} onChange={v => setDraft({ ...draft, description: v })} />
            <div className="adm-form-actions">
              <button type="button" onClick={() => setAdding(false)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn label="Crear categoría" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ─── Discounts Panel ─── */
function DiscountsPanel({ discounts, setDiscounts }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const blank = { code: '', type: 'porcentaje', value: 10, minOrder: 0, uses: 0, maxUses: 100, active: true, expires: '' };
  const [draft, setDraft] = useState(blank);

  const del = (id) => setDiscounts(discounts.filter(d => d.id !== id));
  const toggle = (id) => setDiscounts(discounts.map(d => d.id === id ? { ...d, active: !d.active } : d));
  const saveEdit = (e) => { e.preventDefault(); if (!editing) return; setDiscounts(discounts.map(d => d.id === editing.id ? editing : d)); setEditing(null); };
  const saveAdd = (e) => {
    e.preventDefault();
    const id = discounts.length > 0 ? Math.max(...discounts.map(d => Number(d.id))) + 1 : 1;
    setDiscounts([...discounts, { ...draft, id }]);
    setAdding(false);
    setDraft(blank);
  };

  return (
    <div>
      <SectionHeader title={`Descuentos (${discounts.length})`} action={<AddBtn onClick={() => setAdding(true)} label="Nuevo cupón" />} />
      <div className="adm-panel">
        <table className="adm-table">
          <thead><tr><Th>Código</Th><Th>Descuento</Th><Th>Mín. compra</Th><Th>Usos</Th><Th>Vence</Th><Th>Estado</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {discounts.map((d, i) => (
              <tr key={d.id} className={i > 0 ? 'adm-td-row' : ''}>
                <Td><code className="adm-discount-code">{d.code}</code></Td>
                <Td><span className="adm-discount-value">{d.type === 'porcentaje' ? `${d.value}%` : `$${d.value}`}</span></Td>
                <Td className="adm-text-muted">{d.minOrder > 0 ? `$${d.minOrder}` : '—'}</Td>
                <Td><span className="adm-text-muted">{d.uses}</span><span className="adm-text-border">/</span><span className="adm-text-strong">{d.maxUses}</span></Td>
                <Td className="adm-text-muted adm-text-sm">{d.expires || '—'}</Td>
                <Td>
                  <button onClick={() => toggle(d.id)} className={`adm-toggle ${d.active ? 'adm-toggle--on-green' : ''}`}>
                    <div className={`adm-toggle-knob ${d.active ? 'adm-toggle-knob--on' : ''}`} />
                  </button>
                </Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => setEditing({ ...d })} title="Editar"><svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
                    <IconBtn onClick={() => del(d.id)} danger title="Eliminar"><svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {[{ show: !!editing, item: editing, onClose: () => setEditing(null), onSave: saveEdit, title: 'Editar cupón' },
        { show: adding, item: draft, onClose: () => setAdding(false), onSave: saveAdd, title: 'Nuevo cupón' }].map(({ show, item, onClose, onSave, title: t }) =>
        show && item ? (
          <Modal key={t} title={t} onClose={onClose}>
            <form onSubmit={onSave}>
              <FormField label="Código" value={item.code} onChange={v => editing ? setEditing({ ...editing, code: v }) : setDraft({ ...draft, code: v.toUpperCase() })} placeholder="PROMO20" />
              <div className="adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-form-label">Tipo</label>
                  <select value={item.type} onChange={e => editing ? setEditing({ ...editing, type: e.target.value }) : setDraft({ ...draft, type: e.target.value })} className="adm-form-input">
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto_fijo">Monto fijo ($)</option>
                  </select>
                </div>
                <FormField label="Valor" type="number" value={item.value} onChange={v => editing ? setEditing({ ...editing, value: Number(v) }) : setDraft({ ...draft, value: Number(v) })} />
              </div>
              <div className="adm-form-grid-2">
                <FormField label="Mín. compra ($)" type="number" value={item.minOrder} onChange={v => editing ? setEditing({ ...editing, minOrder: Number(v) }) : setDraft({ ...draft, minOrder: Number(v) })} />
                <FormField label="Usos máximos" type="number" value={item.maxUses} onChange={v => editing ? setEditing({ ...editing, maxUses: Number(v) }) : setDraft({ ...draft, maxUses: Number(v) })} />
              </div>
              <FormField label="Fecha de vencimiento" type="date" value={item.expires} onChange={v => editing ? setEditing({ ...editing, expires: v }) : setDraft({ ...draft, expires: v })} />
              <div className="adm-form-actions">
                <button type="button" onClick={onClose} className="adm-btn-secondary">Cancelar</button>
                <SaveBtn label={editing ? 'Guardar cambios' : 'Crear cupón'} />
              </div>
            </form>
          </Modal>
        ) : null
      )}
    </div>
  );
}

/* ─── Banners Panel ─── */
// MockAPI's real request body ceiling is much smaller than it looks —
// confirmed empirically: a 99KB body succeeds, 100KB comes back
// "413 Request Entity Too Large". A raw photo's base64 (33% bigger than
// the file itself) blows past that instantly, which is what the 413 in
// the screenshot was. Budgeting well under that ceiling, and leaving
// room for the banner's other fields, means the image itself has to be
// resized + recompressed client-side before it's ever sent.
const MAX_BANNER_IMAGE_PAYLOAD_CHARS = 70 * 1024;
const BANNER_IMAGE_MAX_WIDTH = 960;
const BANNER_IMAGE_MAX_HEIGHT = 360;

/** Downscales + recompresses (JPEG) in a <canvas> until the resulting
 * data URL fits the budget, shrinking further each attempt if it doesn't. */
function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, BANNER_IMAGE_MAX_WIDTH / img.width, BANNER_IMAGE_MAX_HEIGHT / img.height);
      let width = Math.round(img.width * scale);
      let height = Math.round(img.height * scale);

      for (let attempt = 0; attempt < 8; attempt++) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const quality = Math.max(0.3, 0.8 - attempt * 0.1);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrl.length <= MAX_BANNER_IMAGE_PAYLOAD_CHARS) {
          resolve(dataUrl);
          return;
        }
        width = Math.round(width * 0.85);
        height = Math.round(height * 0.85);
      }
      reject(new Error('No se pudo comprimir la imagen lo suficiente. Probá con una imagen más simple o de menor resolución.'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen.'));
    };
    img.src = objectUrl;
  });
}

function BannersPanel({ banners, setBanners }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const blank = { title: '', subtitle: '', cta: 'Ver ahora', link: '', image: '', accent: '#5B2A86' };
  const [draft, setDraft] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [imageError, setImageError] = useState('');
  const [resizingImage, setResizingImage] = useState(false);

  const del = async (id) => {
    try {
      await deleteBanner(id);
      setBanners(banners.filter(b => b.id !== id));
    } catch (err) {
      setFormError(err.message);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError('');
    try {
      const result = await updateBanner(editing.id, editing);
      setBanners(banners.map(b => b.id === editing.id ? result : b));
      setEditing(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const result = await createBanner({ ...draft, order: banners.length });
      setBanners([...banners, result]);
      setAdding(false);
      setDraft(blank);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const move = async (id, dir) => {
    const idx = banners.findIndex(b => b.id === id);
    const next = idx + dir;
    if (next < 0 || next >= banners.length) return;
    const arr = [...banners];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setBanners(arr);
    try {
      await Promise.all([
        updateBanner(arr[idx].id, { order: idx }),
        updateBanner(arr[next].id, { order: next }),
      ]);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const toggleActive = async (b) => {
    try {
      const result = await updateBanner(b.id, { active: !b.active });
      setBanners(banners.map(x => x.id === b.id ? result : x));
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleImageFile = async (file, isEdit) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('El archivo debe ser una imagen.');
      return;
    }
    setImageError('');
    setResizingImage(true);
    try {
      const dataUrl = await resizeImageFile(file);
      if (isEdit) setEditing(item => ({ ...item, image: dataUrl }));
      else setDraft(item => ({ ...item, image: dataUrl }));
    } catch (err) {
      setImageError(err.message);
    } finally {
      setResizingImage(false);
    }
  };

  return (
    <div>
      <SectionHeader title={`Anuncios del carrusel (${banners.length})`} action={<AddBtn onClick={() => { setFormError(''); setImageError(''); setAdding(true); }} label="Nuevo anuncio" />} />
      <div className="adm-banner-list">
        {banners.map((b, i) => (
          <div key={b.id} className="adm-banner-card">
            {/* Order controls */}
            <div className="adm-banner-order-controls">
              <IconBtn onClick={() => move(b.id, -1)} title="Subir"><svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg></IconBtn>
              <span className="adm-banner-order-num">{i + 1}</span>
              <IconBtn onClick={() => move(b.id, 1)} title="Bajar"><svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></IconBtn>
            </div>
            {/* Image preview */}
            <div className="adm-banner-image-wrap">
              <img src={b.image} alt={b.title} className="adm-banner-image" />
              <div className="adm-banner-image-fade" />
              <AccentDot color={b.accent} />
            </div>
            {/* Info */}
            <div className="adm-banner-info">
              <div className="adm-banner-title">{b.title}</div>
              <div className="adm-banner-subtitle">{b.subtitle}</div>
              <span className="adm-banner-cta-tag">CTA: {b.cta} → {b.link || '—'}</span>
            </div>
            {/* Active toggle */}
            <button onClick={() => toggleActive(b)} title={b.active ? 'Activo' : 'Inactivo'} className={`adm-toggle ${b.active ? 'adm-toggle--on' : ''}`}>
              <div className={`adm-toggle-knob ${b.active ? 'adm-toggle-knob--on' : ''}`} />
            </button>
            {/* Actions */}
            <div className="adm-banner-actions">
              <IconBtn onClick={() => { setFormError(''); setImageError(''); setEditing({ ...b }); }} title="Editar"><svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
              <IconBtn onClick={() => del(b.id)} danger title="Eliminar"><svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title="Editar anuncio" onClose={() => setEditing(null)}>
          <BannerForm
            item={editing}
            onClose={() => setEditing(null)}
            onSave={saveEdit}
            onChange={(field, value) => setEditing(prev => ({ ...prev, [field]: value }))}
            onImageFile={file => handleImageFile(file, true)}
            imageError={imageError}
            formError={formError}
            saving={saving}
            resizingImage={resizingImage}
            isEdit
          />
        </Modal>
      )}
      {adding && (
        <Modal title="Nuevo anuncio" onClose={() => setAdding(false)}>
          <BannerForm
            item={draft}
            onClose={() => setAdding(false)}
            onSave={saveAdd}
            onChange={(field, value) => setDraft(prev => ({ ...prev, [field]: value }))}
            onImageFile={file => handleImageFile(file, false)}
            imageError={imageError}
            formError={formError}
            saving={saving}
            resizingImage={resizingImage}
            isEdit={false}
          />
        </Modal>
      )}
    </div>
  );
}

/**
 * Top-level, not defined inside BannersPanel — a component declared
 * inside another component's body gets a new identity every render, so
 * React remounts its DOM (losing input focus) on every keystroke that
 * updates the parent's state. That's what made the banner name/subtitle
 * fields only accept one character at a time before this was pulled out.
 */
function BannerForm({ item, onClose, onSave, onChange, onImageFile, imageError, formError, saving, resizingImage, isEdit }) {
  return (
    <form onSubmit={onSave}>
      <FormField label="Título" value={item.title} onChange={v => onChange('title', v)} />
      <FormField label="Subtítulo" value={item.subtitle} onChange={v => onChange('subtitle', v)} />
      <FormField label="Texto del botón CTA" value={item.cta} onChange={v => onChange('cta', v)} />
      <FormField label="URL de destino del botón" value={item.link ?? ''} onChange={v => onChange('link', v)} placeholder="/categoria/laptops" />
      <div className="adm-form-field">
        <label className="adm-form-label">Imagen</label>
        <input
          type="file"
          accept="image/*"
          disabled={resizingImage}
          onChange={e => onImageFile(e.target.files?.[0])}
          className="adm-form-input"
        />
        <p className="adm-form-hint">Se redimensiona y comprime automáticamente al subirla — MockAPI rechaza registros de más de ~100KB.</p>
        {resizingImage && <p className="adm-form-hint">Procesando imagen…</p>}
        {imageError && <p className="adm-form-error">{imageError}</p>}
      </div>
      <div className="adm-form-field">
        <label className="adm-form-label">Color de acento</label>
        <div className="adm-color-field-row">
          <input type="color" value={item.accent} onChange={e => onChange('accent', e.target.value)} className="adm-color-swatch" />
          <span className="adm-color-value">{item.accent}</span>
        </div>
      </div>
      {item.image && (
        <div className="adm-banner-preview">
          <img src={item.image} alt="preview" className="adm-banner-preview-img" onError={e => { e.target.style.display = 'none'; }} />
        </div>
      )}
      {formError && <p className="adm-form-error">{formError}</p>}
      <div className="adm-form-actions">
        <button type="button" onClick={onClose} className="adm-btn-secondary">Cancelar</button>
        <SaveBtn disabled={saving || resizingImage} label={saving ? 'Guardando…' : (isEdit ? 'Guardar cambios' : 'Crear anuncio')} />
      </div>
    </form>
  );
}

/* ─── Page Info Panel ─── */
const BLANK_PAGE_INFO = { storeName: '', tagline: '', email: '', phone: '', address: '', hours: '', whatsapp: '', facebook: '', instagram: '' };

function PageInfoPanel({ info, setInfo }) {
  const [draft, setDraft] = useState(info ?? BLANK_PAGE_INFO);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = info ? await updatePageInfo(info.id, draft) : await createPageInfo(draft);
      setInfo(result);
      setDraft(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (v) => setDraft(d => ({ ...d, [key]: v }));

  return (
    <div>
      <SectionHeader title="Información de la tienda" />
      {!info && (
        <div className="adm-status">Todavía no hay información guardada. Completá el formulario y guardá para crearla.</div>
      )}
      <form onSubmit={handleSave}>
        <div className="adm-page-info-grid">
          {/* General */}
          <div className="adm-page-info-card">
            <div className="adm-page-info-card-title">General</div>
            <FormField label="Nombre de la tienda" value={draft.storeName} onChange={set('storeName')} />
            <FormField label="Eslogan" value={draft.tagline} onChange={set('tagline')} />
            <FormField label="Email de contacto" type="email" value={draft.email} onChange={set('email')} />
          </div>
          {/* Contact */}
          <div className="adm-page-info-card">
            <div className="adm-page-info-card-title">Contacto</div>
            <FormField label="Teléfono" value={draft.phone} onChange={set('phone')} />
            <FormField label="Dirección" value={draft.address} onChange={set('address')} />
            <FormField label="Horario de atención" value={draft.hours} onChange={set('hours')} />
          </div>
          {/* Social */}
          <div className="adm-page-info-card adm-page-info-card--full">
            <div className="adm-page-info-card-title">Redes sociales</div>
            <div className="adm-page-info-social-grid">
              <FormField label="WhatsApp (número)" value={draft.whatsapp} onChange={set('whatsapp')} placeholder="5491112345678" />
              <FormField label="Facebook (@usuario)" value={draft.facebook} onChange={set('facebook')} placeholder="techmarket" />
              <FormField label="Instagram (@usuario)" value={draft.instagram} onChange={set('instagram')} placeholder="techmarket.ar" />
            </div>
          </div>
        </div>

        <div className="adm-page-info-save-row">
          <SaveBtn label={saving ? 'Guardando…' : 'Guardar cambios'} disabled={saving} />
          {saved && (
            <span className="adm-saved-msg">
              <svg className="icon icon-16 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Cambios guardados
            </span>
          )}
          {error && <span className="adm-form-error">{error}</span>}
        </div>
      </form>
    </div>
  );
}

/* ─── Settings Panel ─── */
function SettingsPanel({ adminId }) {
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await changeAdminPassword(adminId, passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Configuración" />
      <form onSubmit={handleChangePassword} className="adm-page-info-card adm-settings-card">
        <div className="adm-page-info-card-title">Cambiar contraseña</div>
        <FormField label="Contraseña actual" type="password" value={passwords.current} onChange={v => setPasswords(p => ({ ...p, current: v }))} />
        <FormField label="Nueva contraseña" type="password" value={passwords.next} onChange={v => setPasswords(p => ({ ...p, next: v }))} placeholder="Mín. 8 caracteres" />
        <FormField label="Confirmar contraseña" type="password" value={passwords.confirm} onChange={v => setPasswords(p => ({ ...p, confirm: v }))} placeholder="Repetí la nueva contraseña" />
        <div className="adm-page-info-save-row">
          <SaveBtn label={saving ? 'Cambiando…' : 'Cambiar contraseña'} disabled={saving} />
          {saved && (
            <span className="adm-saved-msg">
              <svg className="icon icon-16 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Contraseña actualizada
            </span>
          )}
          {error && <span className="adm-form-error">{error}</span>}
        </div>
      </form>
    </div>
  );
}
