import { useState, useEffect } from 'react';
import { useIsMobile } from './hooks/useBreakpoint';
import { useFavorites } from './hooks/useFavorites';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import CategoryView from './components/CategoryView';
import CartDrawer from './components/CartDrawer';
import AuthView from './components/AuthView';
import AdminView from './components/AdminView';
import ClientAccount from './components/ClientAccount';
import { getFeaturedProducts, getBestSellers, getRecommendedProducts, incrementarVisita, decrementStock, getProductById } from './services/productsService';
import { getPageInfo } from './services/pageInfoService';
import { createOrder } from './services/ordersService';
import { incrementUsage as incrementDiscountUsage } from './services/discountsService';
import './styles/global.css';
import './styles/App.css';

/** Used only while pageInfo is loading, or if the "informacion" record
 * hasn't been created in MockAPI yet — keeps Header/Footer from showing
 * blank contact info on a first run. */
const DEFAULT_PAGE_INFO = {
  storeName: 'TechMarket',
  tagline: 'Tu tienda de tecnología de confianza',
  email: 'hola@techmarket.com',
  phone: '+54 11 4567-8900',
  address: 'Av. Tecnología 1234, Piso 3',
  hours: 'Lun–Vie 9:00–18:00 · Sáb 10:00–14:00',
  whatsapp: '1234567890',
  facebook: 'techmarket',
  instagram: 'techmarket.ar',
};

export default function App() {
  const [view, setView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('Todos los productos');
  const [searchQuery, setSearchQuery] = useState('');
  const { userRole, userId, userName, userEmail, isLoggedIn, isPrincipal, permissions, login, logout } = useAuth();
  const { cartItems, cartOpen, cartCount, addToCart, removeFromCart, changeQty, clearCart, openCart, closeCart } = useCart();
  const clienteName = userRole === 'client' ? userName : null;
  const { favorites, isFavorite, toggleFavorite } = useFavorites(clienteName);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [previousView, setPreviousView] = useState('home');

  const handleToggleFavorite = (product) => {
    if (!clienteName) { setView('auth'); return; }
    toggleFavorite(product);
  };

  // The heart button itself is hidden for guests, not just gated on click —
  // ProductCard/ProductDetail only render it when this is truthy.
  const favoriteHandler = clienteName ? handleToggleFavorite : undefined;

  const handleViewProduct = (product) => {
    incrementarVisita(product.id).catch(() => {});
    setSelectedProduct(product);
    setPreviousView(view);
    setView('product');
  };

  const handleAddToCart = (product, qty = 1) => {
    if (!clienteName) { setView('auth'); return; }
    addToCart(product, qty);
  };

  /** "Volver a comprar" — re-adds a past order's items to the cart.
   * Items without a resolved `id` (their product was renamed/deleted
   * since) are skipped rather than guessed at. */
  const handleReorder = (items) => {
    items.filter(item => item.id).forEach(item => addToCart(item, item.qty));
  };

  /** Shared by checkout (whole cart) and buy-now (a single item): re-checks
   * real stock right before ordering (it can change between adding an item
   * to the cart and actually checking out — another purchase, an admin
   * adjustment), then creates the order + its lines in MockAPI and
   * decrements stock per item. `orderDetails` (address/postalCode/
   * paymentMethod) comes from CheckoutModal — the client confirms or edits
   * them right before the order is placed, instead of it silently reusing
   * whatever's saved on the profile. `discountId`, when a coupon was
   * applied, gets its usage counter bumped — best-effort, fire-and-forget:
   * a failure here shouldn't make an otherwise-successful order look
   * failed to the client, it would just mean that coupon's use count is
   * one behind reality. */
  const placeOrder = async (items, discountAmount, orderDetails, discountId) => {
    const freshProducts = await Promise.all(items.map(item => getProductById(item.id)));
    const shortIndex = freshProducts.findIndex((p, i) => p.stockQty < items[i].qty);
    if (shortIndex !== -1) {
      const short = freshProducts[shortIndex];
      throw new Error(
        short.stockQty > 0
          ? `Solo quedan ${short.stockQty} unidades de "${short.name}". Ajustá la cantidad para continuar.`
          : `"${short.name}" ya no tiene stock disponible.`
      );
    }

    await createOrder({ clienteName, items, ...orderDetails, discountAmount });
    await Promise.all(items.map(item => decrementStock(item.id, item.qty)));
    if (discountId) incrementDiscountUsage(discountId).catch(() => {});
  };

  /**
   * `discountAmount`/`discountId` come from CartTab's applied coupon when
   * checking out from the account page; the header cart drawer has no
   * coupon UI, so they're always undefined/0 there. Lands on "Mis
   * pedidos" so the new order is right there.
   */
  const handleCheckout = async (discountAmount = 0, orderDetails, discountId) => {
    if (!clienteName) { setView('auth'); return; }
    await placeOrder(cartItems, discountAmount, orderDetails, discountId);
    clearCart();
    closeCart();
    setView('account');
  };

  /** Buy-now bypasses the cart entirely — a single-item order for
   * whatever quantity was picked on the product page. */
  const handleBuyNow = async (product, qty, orderDetails) => {
    if (!clienteName) { setView('auth'); return; }
    await placeOrder([{ ...product, qty }], 0, orderDetails);
    setView('account');
  };

  const [bannerOnlyPromo, setBannerOnlyPromo] = useState(false);
  const [homeSort, setHomeSort] = useState('relevance');

  const handleCategory = (cat) => {
    setBannerOnlyPromo(false);
    setHomeSort('relevance');
    setActiveCategory(cat);
    setView('category');
  };

  const handleSearchSubmit = () => {
    setBannerOnlyPromo(false);
    setHomeSort('relevance');
    setActiveCategory('Resultados de búsqueda');
    setView('category');
  };

  /** The home page's "Ver todo" buttons — each one's `sort` is the real
   * criteria that section itself is ranked by (see productsService
   * getFeaturedProducts/getBestSellers/getRecommendedProducts), so "Ver
   * todo" always lands on the same ranking the carousel just showed a
   * preview of, not just the generic catalog. */
  const handleSeeAll = (sort) => {
    setBannerOnlyPromo(false);
    setHomeSort(sort);
    setActiveCategory('Todos los productos');
    setView('category');
  };

  /**
   * Each banner's real `link` (from MockAPI's boton_link, e.g.
   * "/categoria/laptops", "/promociones/black-friday") is a URL path this
   * app has no router for — it's translated into the equivalent in-app
   * navigation instead of being followed literally. Unrecognized patterns
   * fall back to the generic catalog, same as the old always-onShop
   * behavior.
   */
  const handleBannerClick = (banner) => {
    const link = banner?.link || '';

    const categoriaMatch = link.match(/^\/categoria\/([\w-]+)/);
    if (categoriaMatch) {
      const categoryName = categoriaMatch[1]
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      handleCategory(categoryName);
      return;
    }

    if (link.startsWith('/promociones')) {
      setBannerOnlyPromo(true);
      setHomeSort('relevance');
      setActiveCategory('Promociones');
      setView('category');
      return;
    }

    setBannerOnlyPromo(false);
    setHomeSort('relevance');
    setView('category');
  };

  const handleLogout = () => {
    logout();
    setView('home');
    refreshStorefrontData();
  };

  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [bestSellersError, setBestSellersError] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [recommendedError, setRecommendedError] = useState(null);

  const [pageInfo, setPageInfo] = useState(null);

  /**
   * Each home section fetches independently, on purpose — they used to
   * share one Promise.all, so a transient failure in just one of the
   * three (e.g. a slow/dropped request right after login, when the login
   * calls and these three fire close together) blanked out all three
   * sections until a reload. Now a failure in one never affects the
   * other two.
   *
   * These, plus pageInfo, are fetched here in App — the one component
   * that's always mounted for the whole session and never remounts when
   * `view` changes — unlike Header/Hero, which fetch their own data and
   * naturally refresh because they get unmounted while `view === 'admin'`
   * and remounted on the way back out. Without refreshStorefrontData()
   * below, saving a change in the admin panel (a product, "Info de la
   * tienda") and clicking "Volver a la tienda" would keep showing
   * whatever App fetched once at the very start of the session.
   */
  const fetchFeatured = () => {
    getFeaturedProducts()
      .then(data => setFeatured(data))
      .catch(err => setFeaturedError(err.message))
      .finally(() => setFeaturedLoading(false));
  };

  const fetchBestSellers = () => {
    getBestSellers()
      .then(data => setBestSellers(data))
      .catch(err => setBestSellersError(err.message))
      .finally(() => setBestSellersLoading(false));
  };

  const fetchRecommended = () => {
    getRecommendedProducts()
      .then(data => setRecommended(data))
      .catch(err => setRecommendedError(err.message))
      .finally(() => setRecommendedLoading(false));
  };

  const fetchPageInfo = () => {
    getPageInfo().then(data => setPageInfo(data)).catch(() => {});
  };

  /** Re-pulls everything the storefront shows that an admin could have
   * just changed — called when leaving the admin panel, not only once. */
  const refreshStorefrontData = () => {
    fetchFeatured();
    fetchBestSellers();
    fetchRecommended();
    fetchPageInfo();
  };

  useEffect(() => {
    refreshStorefrontData();
  }, []);

  const storeInfo = pageInfo ?? DEFAULT_PAGE_INFO;

  return (
    <div className="app-root">
      {view === 'admin' ? <AdminView onExit={() => { setView('home'); refreshStorefrontData(); }} onLogout={handleLogout} adminId={userId} adminName={userName} adminEmail={userEmail} isPrincipal={isPrincipal} permissions={permissions} storeInfo={storeInfo} /> : (<>
      <Header
        info={storeInfo}
        cartCount={cartCount}
        onCartOpen={openCart}
        onAccountOpen={() => {
          if (userRole === 'admin') setView('admin');
          else if (userRole === 'client') setView('account');
          else setView('auth');
        }}
        onCategorySelect={handleCategory}
        onHome={() => setView('home')}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        hideNav={view === 'account'}
      />

      <main className="app-main">
        {view === 'auth' ? (
          <AuthView
            onBack={() => setView('home')}
            onSuccess={(role, id, name, email, extra) => {
              login(role, id, name, email, extra);
              setView(role === 'admin' ? 'admin' : 'account');
            }}
          />
        ) : view === 'account' ? (
          <ClientAccount
            userId={userId}
            userName={userName}
            userEmail={userEmail}
            cartItems={cartItems}
            onChangeQty={changeQty}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
            onReorder={handleReorder}
            onView={handleViewProduct}
            favorites={favorites}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setView('home')}
            onLogout={handleLogout}
          />
        ) : view === 'home' ? (
          <>
            <Hero onCtaClick={handleBannerClick} />

            <ProductSection title="Productos Destacados" subtitle="Selección especial de nuestros expertos" onSeeAll={() => handleSeeAll('rating')}>
              {featuredLoading ? <div className="app-status">Cargando productos…</div> :
               featuredError ? <div className="app-status app-status--error">No se pudieron cargar los productos destacados.</div> :
               <ProductGrid products={featured} onView={handleViewProduct} isFavorite={isFavorite} onToggleFavorite={favoriteHandler} />}
            </ProductSection>

            <ProductSection title="Lo Más Vendido" subtitle="Los favoritos de nuestra comunidad" onSeeAll={() => handleSeeAll('bestsellers')} alt>
              {bestSellersLoading ? <div className="app-status">Cargando productos…</div> :
               bestSellersError ? <div className="app-status app-status--error">No se pudo cargar lo más vendido.</div> :
               <ProductGrid products={bestSellers} onView={handleViewProduct} isFavorite={isFavorite} onToggleFavorite={favoriteHandler} />}
            </ProductSection>

            <ProductSection title="Recomendados para Ti" subtitle="Basado en tendencias y mejores valoraciones" onSeeAll={() => handleSeeAll('visitas')}>
              {recommendedLoading ? <div className="app-status">Cargando productos…</div> :
               recommendedError ? <div className="app-status app-status--error">No se pudieron cargar los recomendados.</div> :
               <ProductGrid products={recommended} onView={handleViewProduct} isFavorite={isFavorite} onToggleFavorite={favoriteHandler} />}
            </ProductSection>

            {/* Trust bar */}
            <div className="app-trust-bar">
              <div className="app-trust-inner">
                <TrustItem icon={<svg className="icon icon-22 icon-sw-1_8" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>} title="Envío rápido" desc="Entrega en 24–72 hs a todo el país" />
                <TrustItem icon={<svg className="icon icon-22 icon-sw-1_8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>} title="Garantía oficial" desc="Todos los productos con garantía de fábrica" />
                <TrustItem icon={<svg className="icon icon-22 icon-sw-1_8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>} title="Hasta 12 cuotas" desc="Sin interés con tarjetas seleccionadas" />
                <TrustItem icon={<svg className="icon icon-22 icon-sw-1_8" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>} title="Devolución fácil" desc="30 días para cambios sin preguntas" />
              </div>
            </div>
          </>
        ) : view === 'product' && selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            userId={userId}
            onBack={() => setView(previousView)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isFavorite={isFavorite(selectedProduct.name)}
            onToggleFavorite={favoriteHandler}
          />
        ) : (
          <CategoryView category={activeCategory} searchQuery={activeCategory === 'Resultados de búsqueda' ? searchQuery : ''} initialOnlyPromo={bannerOnlyPromo} initialSort={homeSort} onView={handleViewProduct} isFavorite={isFavorite} onToggleFavorite={favoriteHandler} />
        )}
      </main>

      <Footer info={storeInfo} />
      </>)}

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        userId={userId}
        onClose={closeCart}
        onRemove={removeFromCart}
        onChangeQty={changeQty}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

function ProductSection({ title, subtitle, onSeeAll, alt, children }) {
  const isMobile = useIsMobile();
  return (
    <section className={`app-section ${alt ? 'app-section--alt' : ''}`}>
      <div className="app-section-inner">
        <div className="app-section-header">
          <div>
            <h2 className="app-section-title">{title}</h2>
            {!isMobile && <p className="app-section-subtitle">{subtitle}</p>}
          </div>
          <button onClick={onSeeAll} className="app-see-all-btn">Ver todo →</button>
        </div>
        {children}
      </div>
    </section>
  );
}

function ProductGrid({ products, onView, isFavorite, onToggleFavorite }) {
  return (
    <div className="app-product-grid">
      {products.map(p => (
        <ProductCard key={p.id} product={p} onView={onView}
          isFavorite={isFavorite(p.name)} onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

function TrustItem({ icon, title, desc }) {
  return (
    <div className="app-trust-item">
      <div className="app-trust-icon-box">
        {icon}
      </div>
      <div>
        <div className="app-trust-title">{title}</div>
        <div className="app-trust-desc">{desc}</div>
      </div>
    </div>
  );
}
