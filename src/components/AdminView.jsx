import { useState } from 'react';
import { useIsMobile } from '../hooks/useBreakpoint';
import { getProducts, getBanners } from '../services/productsService';
import { getCategories, getDiscounts, getPageInfo, getMonthlySales, getRecentOrders } from '../services/adminService';
import logo from '../imports/gato_sin_fondo-1.svg';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: 'products', label: 'Productos', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { id: 'categories', label: 'Categorías', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  { id: 'discounts', label: 'Descuentos', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  { id: 'banners', label: 'Anuncios', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { id: 'pageinfo', label: 'Info de la tienda', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
];

export default function AdminView({ onExit }) {
  const [section, setSection] = useState('dashboard');
  const [products, setProducts] = useState(getProducts());
  const [categories, setCategories] = useState(getCategories());
  const [discounts, setDiscounts] = useState(getDiscounts());
  const [banners, setBanners] = useState(getBanners());
  const [pageInfo, setPageInfo] = useState(getPageInfo());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="adm-sidebar-logo-wrap">
        <div className="adm-sidebar-logo-row">
          <div className="adm-sidebar-logo-info">
            <div className="adm-sidebar-logo-box">
              <img src={logo} alt="TechMarket" className="hdr-logo-img" />
            </div>
            <div>
              <div className="adm-sidebar-brand">TechMarket</div>
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
        <button onClick={onExit} className="adm-sidebar-exit-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Volver a la tienda
        </button>
      </div>
    </>
  );

  return (
    <div className="adm-root">
      {/* Sidebar — sticky on desktop, slide-over on mobile */}
      {!isMobile && (
        <aside className="adm-sidebar">
          <SidebarContent />
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} className="adm-sidebar-overlay" />
          <aside className="adm-sidebar adm-sidebar--mobile">
            <SidebarContent />
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
              {NAV.find(n => n.id === section)?.label}
            </h1>
          </div>
          {!isMobile && (
            <div className="adm-topbar-user">
              <div className="adm-topbar-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <div className="adm-topbar-user-name">Administrador</div>
                <div className="adm-topbar-user-email">admin@techmarket.com</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`adm-content ${isMobile ? 'adm-content--mobile' : ''}`}>
          {section === 'dashboard' && <Dashboard products={products} discounts={discounts} />}
          {section === 'products' && <ProductsPanel products={products} setProducts={setProducts} />}
          {section === 'categories' && <CategoriesPanel categories={categories} setCategories={setCategories} />}
          {section === 'discounts' && <DiscountsPanel discounts={discounts} setDiscounts={setDiscounts} />}
          {section === 'banners' && <BannersPanel banners={banners} setBanners={setBanners} />}
          {section === 'pageinfo' && <PageInfoPanel info={pageInfo} setInfo={setPageInfo} />}
        </div>
      </div>
    </div>
  );
}

const MONTHLY_SALES = getMonthlySales();
const RECENT_ORDERS = getRecentOrders();

const ORDER_STATUS = {
  completado: { label: 'Completado', color: '#16A34A', bg: '#DCFCE7' },
  enviado:    { label: 'Enviado',    color: '#2563EB', bg: '#DBEAFE' },
  procesando: { label: 'Procesando', color: '#D97706', bg: '#FEF3C7' },
  cancelado:  { label: 'Cancelado',  color: '#DC2626', bg: '#FEE2E2' },
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
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
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
function Sparkline({ data, color = '#5B2A86' }) {
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
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
            <div className={`adm-bar ${isLast ? 'adm-bar--last' : ''}`} style={{ '--h': `${pct * 100}%` }} />
            <div className={`adm-bar-label ${isLast ? 'adm-bar-label--last' : ''}`}>{d.mes}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Dashboard ─── */
function Dashboard({ products, discounts }) {
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span className="adm-date-pill-text">Sep 2026</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="adm-kpi-row">
        <KpiCard label="Ingresos del mes" value={thisMonth.ventas} prefix="$" delta={revDelta} deltaLabel="vs. mes anterior" colorClass="adm-kpi-icon-box--brand"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <KpiCard label="Órdenes del mes" value={thisMonth.ordenes} delta={ordDelta} deltaLabel="vs. mes anterior" colorClass="adm-kpi-icon-box--blue"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
        />
        <KpiCard label="Ticket promedio" value={`$${avgOrder.toLocaleString()}`} delta={5} deltaLabel="por orden" colorClass="adm-kpi-icon-box--purple"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
        />
        <KpiCard label="Tasa de conversión" value={`${conversionRate}%`} delta={0.4} deltaLabel="de visitas a compras" colorClass="adm-kpi-icon-box--green"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
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
            <Sparkline data={MONTHLY_SALES.map(m => m.ordenes)} color="#2563EB" />
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
                    <div className={`adm-progress-fill ${nearLimit ? 'adm-progress-fill--warn' : ''}`} style={{ '--w': `${pct}%` }} />
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
              {RECENT_ORDERS.map((o) => {
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
                  <div className={`adm-cat-bar-fill ${colorClass}`} style={{ '--w': `${pct}%` }} />
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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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

function SaveBtn({ label = 'Guardar cambios' }) {
  return (
    <button type="submit" className="adm-save-btn">{label}</button>
  );
}

/* ─── Products Panel ─── */
function ProductsPanel({ products, setProducts }) {
  const [editItem, setEditItem] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [blank] = useState({ name: '', brand: '', category: '', price: 0, image: '', rating: 5, reviews: 0, stock: 'available' });
  const [draft, setDraft] = useState(blank);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const del = (id) => setProducts(products.filter(p => p.id !== id));

  const saveEdit = (e) => {
    e.preventDefault();
    if (!editItem) return;
    setProducts(products.map(p => p.id === editItem.id ? editItem : p));
    setEditItem(null);
  };

  const saveAdd = (e) => {
    e.preventDefault();
    const newId = Math.max(...products.map(p => p.id)) + 1;
    setProducts([...products, { ...draft, id: newId }]);
    setAdding(false);
    setDraft(blank);
  };

  return (
    <div>
      <SectionHeader title={`Productos (${products.length})`} action={<AddBtn onClick={() => setAdding(true)} label="Nuevo producto" />} />

      {/* Search */}
      <div className="adm-search-wrap">
        <svg className="adm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
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
                <Td><StockBadge stock={p.stock} /></Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => setEditItem({ ...p })} title="Editar">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </IconBtn>
                    <IconBtn onClick={() => del(p.id)} danger title="Eliminar">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
            <FormField label="Marca" value={editItem.brand} onChange={v => setEditItem({ ...editItem, brand: v })} />
            <FormField label="Categoría" value={editItem.category} onChange={v => setEditItem({ ...editItem, category: v })} />
            <div className="adm-form-grid-2">
              <FormField label="Precio ($)" type="number" value={editItem.price} onChange={v => setEditItem({ ...editItem, price: Number(v) })} />
              <FormField label="Precio original ($)" type="number" value={editItem.originalPrice ?? ''} onChange={v => setEditItem({ ...editItem, originalPrice: v ? Number(v) : undefined })} placeholder="Opcional" />
            </div>
            <FormField label="URL de imagen" value={editItem.image} onChange={v => setEditItem({ ...editItem, image: v })} />
            <div className="adm-form-field">
              <label className="adm-form-label">Stock</label>
              <select value={editItem.stock} onChange={e => setEditItem({ ...editItem, stock: e.target.value })} className="adm-form-input">
                <option value="available">Disponible</option>
                <option value="low">Stock bajo</option>
                <option value="out">Sin stock</option>
              </select>
            </div>
            <div className="adm-form-actions">
              <button type="button" onClick={() => setEditItem(null)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn />
            </div>
          </form>
        </Modal>
      )}

      {/* Add modal */}
      {adding && (
        <Modal title="Nuevo producto" onClose={() => setAdding(false)}>
          <form onSubmit={saveAdd}>
            <FormField label="Nombre" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
            <FormField label="Marca" value={draft.brand} onChange={v => setDraft({ ...draft, brand: v })} />
            <FormField label="Categoría" value={draft.category} onChange={v => setDraft({ ...draft, category: v })} />
            <div className="adm-form-grid-2">
              <FormField label="Precio ($)" type="number" value={draft.price} onChange={v => setDraft({ ...draft, price: Number(v) })} />
              <FormField label="Precio original ($)" type="number" value={draft.originalPrice ?? ''} onChange={v => setDraft({ ...draft, originalPrice: v ? Number(v) : undefined })} placeholder="Opcional" />
            </div>
            <FormField label="URL de imagen" value={draft.image} onChange={v => setDraft({ ...draft, image: v })} />
            <div className="adm-form-actions">
              <button type="button" onClick={() => setAdding(false)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn label="Crear producto" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ─── Categories Panel ─── */
function CategoriesPanel({ categories, setCategories }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', parent: '', count: 0, visible: true });

  const del = (id) => setCategories(categories.filter(c => c.id !== id));
  const toggle = (id) => setCategories(categories.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  const saveEdit = (e) => { e.preventDefault(); if (!editing) return; setCategories(categories.map(c => c.id === editing.id ? editing : c)); setEditing(null); };
  const saveAdd = (e) => { e.preventDefault(); const id = Math.max(...categories.map(c => c.id)) + 1; setCategories([...categories, { ...draft, id }]); setAdding(false); setDraft({ name: '', parent: '', count: 0, visible: true }); };

  return (
    <div>
      <SectionHeader title={`Categorías (${categories.length})`} action={<AddBtn onClick={() => setAdding(true)} label="Nueva categoría" />} />
      <div className="adm-panel">
        <table className="adm-table">
          <thead><tr><Th>Nombre</Th><Th>Categoría padre</Th><Th>Productos</Th><Th>Visible</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.id} className={i > 0 ? 'adm-td-row' : ''}>
                <Td><span className="adm-text-strong">{cat.name}</span></Td>
                <Td className="adm-text-muted">{cat.parent || '—'}</Td>
                <Td>{cat.count}</Td>
                <Td>
                  <button onClick={() => toggle(cat.id)} className={`adm-toggle ${cat.visible ? 'adm-toggle--on' : ''}`}>
                    <div className={`adm-toggle-knob ${cat.visible ? 'adm-toggle-knob--on' : ''}`} />
                  </button>
                </Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => setEditing({ ...cat })} title="Editar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
                    <IconBtn onClick={() => del(cat.id)} danger title="Eliminar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
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
            <FormField label="Categoría padre" value={editing.parent} onChange={v => setEditing({ ...editing, parent: v })} placeholder="Dejar vacío si es raíz" />
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
            <FormField label="Categoría padre" value={draft.parent} onChange={v => setDraft({ ...draft, parent: v })} placeholder="Dejar vacío si es raíz" />
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
  const blank = { code: '', type: 'percent', value: 10, minOrder: 0, uses: 0, maxUses: 100, active: true, expires: '' };
  const [draft, setDraft] = useState(blank);

  const del = (id) => setDiscounts(discounts.filter(d => d.id !== id));
  const toggle = (id) => setDiscounts(discounts.map(d => d.id === id ? { ...d, active: !d.active } : d));
  const saveEdit = (e) => { e.preventDefault(); if (!editing) return; setDiscounts(discounts.map(d => d.id === editing.id ? editing : d)); setEditing(null); };
  const saveAdd = (e) => { e.preventDefault(); const id = Math.max(...discounts.map(d => d.id)) + 1; setDiscounts([...discounts, { ...draft, id }]); setAdding(false); setDraft(blank); };

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
                <Td><span className="adm-discount-value">{d.type === 'percent' ? `${d.value}%` : `$${d.value}`}</span></Td>
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
                    <IconBtn onClick={() => setEditing({ ...d })} title="Editar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
                    <IconBtn onClick={() => del(d.id)} danger title="Eliminar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
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
                    <option value="percent">Porcentaje (%)</option>
                    <option value="fixed">Monto fijo ($)</option>
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
function BannersPanel({ banners, setBanners }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const blank = { title: '', subtitle: '', cta: 'Ver ahora', image: '', accent: '#5B2A86' };
  const [draft, setDraft] = useState(blank);

  const del = (id) => setBanners(banners.filter(b => b.id !== id));
  const saveEdit = (e) => { e.preventDefault(); if (!editing) return; setBanners(banners.map(b => b.id === editing.id ? editing : b)); setEditing(null); };
  const saveAdd = (e) => { e.preventDefault(); const id = Math.max(...banners.map(b => b.id)) + 1; setBanners([...banners, { ...draft, id }]); setAdding(false); setDraft(blank); };
  const move = (id, dir) => {
    const idx = banners.findIndex(b => b.id === id);
    const next = idx + dir;
    if (next < 0 || next >= banners.length) return;
    const arr = [...banners];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setBanners(arr);
  };

  const BannerForm = ({ item, onClose, onSave, isEdit }) => (
    <form onSubmit={onSave}>
      <FormField label="Título" value={item.title} onChange={v => isEdit ? setEditing({ ...editing, title: v }) : setDraft({ ...draft, title: v })} />
      <FormField label="Subtítulo" value={item.subtitle} onChange={v => isEdit ? setEditing({ ...editing, subtitle: v }) : setDraft({ ...draft, subtitle: v })} />
      <FormField label="Texto del botón CTA" value={item.cta} onChange={v => isEdit ? setEditing({ ...editing, cta: v }) : setDraft({ ...draft, cta: v })} />
      <FormField label="URL de imagen" value={item.image} onChange={v => isEdit ? setEditing({ ...editing, image: v }) : setDraft({ ...draft, image: v })} placeholder="https://..." />
      <div className="adm-form-field">
        <label className="adm-form-label">Color de acento</label>
        <div className="adm-color-field-row">
          <input type="color" value={item.accent} onChange={e => isEdit ? setEditing({ ...editing, accent: e.target.value }) : setDraft({ ...draft, accent: e.target.value })} className="adm-color-swatch" />
          <span className="adm-color-value">{item.accent}</span>
        </div>
      </div>
      {item.image && (
        <div className="adm-banner-preview">
          <img src={item.image} alt="preview" className="adm-banner-preview-img" onError={e => { e.target.style.display = 'none'; }} />
        </div>
      )}
      <div className="adm-form-actions">
        <button type="button" onClick={onClose} className="adm-btn-secondary">Cancelar</button>
        <SaveBtn label={isEdit ? 'Guardar cambios' : 'Crear anuncio'} />
      </div>
    </form>
  );

  return (
    <div>
      <SectionHeader title={`Anuncios del carrusel (${banners.length})`} action={<AddBtn onClick={() => setAdding(true)} label="Nuevo anuncio" />} />
      <div className="adm-banner-list">
        {banners.map((b, i) => (
          <div key={b.id} className="adm-banner-card">
            {/* Order controls */}
            <div className="adm-banner-order-controls">
              <IconBtn onClick={() => move(b.id, -1)} title="Subir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg></IconBtn>
              <span className="adm-banner-order-num">{i + 1}</span>
              <IconBtn onClick={() => move(b.id, 1)} title="Bajar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></IconBtn>
            </div>
            {/* Image preview */}
            <div className="adm-banner-image-wrap">
              <img src={b.image} alt={b.title} className="adm-banner-image" />
              <div className="adm-banner-image-fade" />
              <div className="adm-banner-accent-dot" style={{ '--accent': b.accent }} />
            </div>
            {/* Info */}
            <div className="adm-banner-info">
              <div className="adm-banner-title">{b.title}</div>
              <div className="adm-banner-subtitle">{b.subtitle}</div>
              <span className="adm-banner-cta-tag">CTA: {b.cta}</span>
            </div>
            {/* Actions */}
            <div className="adm-banner-actions">
              <IconBtn onClick={() => setEditing({ ...b })} title="Editar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
              <IconBtn onClick={() => del(b.id)} danger title="Eliminar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
            </div>
          </div>
        ))}
      </div>

      {editing && <Modal title="Editar anuncio" onClose={() => setEditing(null)}><BannerForm item={editing} onClose={() => setEditing(null)} onSave={saveEdit} isEdit /></Modal>}
      {adding && <Modal title="Nuevo anuncio" onClose={() => setAdding(false)}><BannerForm item={draft} onClose={() => setAdding(false)} onSave={saveAdd} isEdit={false} /></Modal>}
    </div>
  );
}

/* ─── Page Info Panel ─── */
function PageInfoPanel({ info, setInfo }) {
  const [draft, setDraft] = useState(info);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setInfo(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (key) => (v) => setDraft(d => ({ ...d, [key]: v }));

  return (
    <div>
      <SectionHeader title="Información de la tienda" />
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
          <SaveBtn label="Guardar cambios" />
          {saved && (
            <span className="adm-saved-msg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Cambios guardados
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
