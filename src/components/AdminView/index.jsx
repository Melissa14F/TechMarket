import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { getProducts } from '../../services/productsService';
import { getAllBanners } from '../../services/bannerService';
import { getCategories } from '../../services/categoriesService';
import { getDiscounts } from '../../services/discountsService';
import { getPageInfo } from '../../services/pageInfoService';
import { getRecentOrders as fetchRecentOrders, getAllOrders } from '../../services/adminService';
import { getOrderStatuses } from '../../services/orderStatusService';
import { getAll as getAllClientes } from '../../services/clienteService';
import { getAdminUsers } from '../../services/adminUsersService';
import { NAV, SidebarContent, getVisibleNav } from './Sidebar';
import { Toast } from './shared';
import Dashboard from './Dashboard';
import ProductsPanel from './ProductsPanel';
import OrdersPanel from './OrdersPanel';
import CategoriesPanel from './CategoriesPanel';
import DiscountsPanel from './DiscountsPanel';
import BannersPanel from './BannersPanel';
import OrderStatusPanel from './OrderStatusPanel';
import ClientesPanel from './ClientesPanel';
import UsersPanel from './UsersPanel';
import PageInfoPanel from './PageInfoPanel';
import SettingsPanel from './SettingsPanel';
import '../../styles/AdminView.css';

export default function AdminView({ onExit, onLogout, adminId, adminName, adminEmail, isPrincipal, permissions, storeInfo }) {
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
  const [statuses, setStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(true);
  const [statusesError, setStatusesError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [clientesLoading, setClientesLoading] = useState(true);
  const [clientesError, setClientesError] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const userMenuRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const isMobile = useIsMobile();
  const visibleNav = getVisibleNav({ isPrincipal, permissions });
  const allowedSections = new Set(['dashboard', 'settings', ...visibleNav.map(n => n.id)]);

  /** Every panel gets this as a prop — called right after a create/update/
   * delete/toggle succeeds, so the admin always sees explicit confirmation
   * of what just happened instead of only a silent row change in a table. */
  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => () => clearTimeout(toastTimeoutRef.current), []);

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

  useEffect(() => {
    let cancelled = false;
    getOrderStatuses()
      .then(data => { if (!cancelled) setStatuses(data); })
      .catch(err => { if (!cancelled) setStatusesError(err.message); })
      .finally(() => { if (!cancelled) setStatusesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAllClientes()
      .then(data => { if (!cancelled) setClientes(data); })
      .catch(err => { if (!cancelled) setClientesError(err.message); })
      .finally(() => { if (!cancelled) setClientesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Only the principal manages admin accounts — a regular admin never
  // needs this list, so it's not even fetched for them.
  useEffect(() => {
    if (!isPrincipal) { setUsersLoading(false); return; }
    let cancelled = false;
    getAdminUsers()
      .then(data => { if (!cancelled) setUsers(data); })
      .catch(err => { if (!cancelled) setUsersError(err.message); })
      .finally(() => { if (!cancelled) setUsersLoading(false); });
    return () => { cancelled = true; };
  }, [isPrincipal]);


  return (
    <div className="adm-root">
      {/* Sidebar — sticky on desktop, slide-over on mobile */}
      {!isMobile && (
        <aside className="adm-sidebar">
          <SidebarContent isMobile={isMobile} setSidebarOpen={setSidebarOpen} storeInfo={storeInfo} section={section} setSection={setSection} onExit={onExit} onLogout={onLogout} isPrincipal={isPrincipal} permissions={permissions} />
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} className="adm-sidebar-overlay" />
          <aside className="adm-sidebar adm-sidebar--mobile">
            <SidebarContent isMobile={isMobile} setSidebarOpen={setSidebarOpen} storeInfo={storeInfo} section={section} setSection={setSection} onExit={onExit} onLogout={onLogout} isPrincipal={isPrincipal} permissions={permissions} />
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
          {!allowedSections.has(section) ? (
            <div className="adm-status adm-status--error">No tenés permiso para acceder a esta sección.</div>
          ) : <>
          {section === 'dashboard' && (
            (productsLoading || discountsLoading || recentOrdersLoading) ? <div className="adm-status">Cargando panel…</div> :
            (productsError || discountsError || recentOrdersError) ? <div className="adm-status adm-status--error">No se pudo cargar el dashboard.</div> :
            <Dashboard products={products} discounts={discounts} recentOrders={recentOrders} />
          )}
          {section === 'products' && (
            productsLoading ? <div className="adm-status">Cargando productos…</div> :
            productsError ? <div className="adm-status adm-status--error">No se pudieron cargar los productos.</div> :
            <ProductsPanel products={products} setProducts={setProducts} categories={categories} showToast={showToast} />
          )}
          {section === 'orders' && (
            ordersLoading ? <div className="adm-status">Cargando pedidos…</div> :
            ordersError ? <div className="adm-status adm-status--error">No se pudieron cargar los pedidos.</div> :
            <OrdersPanel orders={orders} setOrders={setOrders} statuses={statuses} showToast={showToast} />
          )}
          {section === 'orderstatus' && (
            statusesLoading ? <div className="adm-status">Cargando estados de pedido…</div> :
            statusesError ? <div className="adm-status adm-status--error">No se pudieron cargar los estados de pedido.</div> :
            <OrderStatusPanel statuses={statuses} setStatuses={setStatuses} showToast={showToast} />
          )}
          {section === 'clientes' && (
            clientesLoading ? <div className="adm-status">Cargando clientes…</div> :
            clientesError ? <div className="adm-status adm-status--error">No se pudieron cargar los clientes.</div> :
            <ClientesPanel clientes={clientes} setClientes={setClientes} showToast={showToast} />
          )}
          {section === 'categories' && (
            categoriesLoading ? <div className="adm-status">Cargando categorías…</div> :
            categoriesError ? <div className="adm-status adm-status--error">No se pudieron cargar las categorías.</div> :
            <CategoriesPanel categories={categories} setCategories={setCategories} showToast={showToast} />
          )}
          {section === 'discounts' && (
            discountsLoading ? <div className="adm-status">Cargando descuentos…</div> :
            discountsError ? <div className="adm-status adm-status--error">No se pudieron cargar los descuentos.</div> :
            <DiscountsPanel discounts={discounts} setDiscounts={setDiscounts} showToast={showToast} />
          )}
          {section === 'banners' && (
            bannersLoading ? <div className="adm-status">Cargando anuncios…</div> :
            bannersError ? <div className="adm-status adm-status--error">No se pudieron cargar los anuncios.</div> :
            <BannersPanel banners={banners} setBanners={setBanners} showToast={showToast} />
          )}
          {section === 'pageinfo' && (
            pageInfoLoading ? <div className="adm-status">Cargando información de la tienda…</div> :
            pageInfoError ? <div className="adm-status adm-status--error">No se pudo cargar la información de la tienda.</div> :
            <PageInfoPanel info={pageInfo} setInfo={setPageInfo} showToast={showToast} />
          )}
          {section === 'usuarios' && isPrincipal && (
            usersLoading ? <div className="adm-status">Cargando usuarios…</div> :
            usersError ? <div className="adm-status adm-status--error">No se pudieron cargar los usuarios.</div> :
            <UsersPanel users={users} setUsers={setUsers} showToast={showToast} />
          )}
          {section === 'settings' && <SettingsPanel adminId={adminId} showToast={showToast} />}
          </>}
        </div>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
