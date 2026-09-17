import { useState } from 'react';
import { useIsMobile } from './hooks/useBreakpoint';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import CategoryView from './components/CategoryView';
import CartDrawer from './components/CartDrawer';
import AuthView from './components/AuthView';
import AdminView from './components/AdminView';
import ClientAccount from './components/ClientAccount';
import { getFeaturedProducts, getBestSellers, getRecommendedProducts } from './services/productsService';
import './App.css';

export default function App() {
  const [view, setView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('Todos los productos');
  const [searchQuery, setSearchQuery] = useState('');
  const { userRole, userName, userEmail, isLoggedIn, login, logout } = useAuth();
  const { cartItems, cartOpen, cartCount, addToCart, removeFromCart, changeQty, openCart, closeCart } = useCart();

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    setView('category');
  };

  const handleSearchSubmit = () => {
    setActiveCategory('Resultados de búsqueda');
    setView('category');
  };

  const handleLogout = () => {
    logout();
    setView('home');
  };

  const featured = getFeaturedProducts();
  const bestSellers = getBestSellers();
  const recommended = getRecommendedProducts();

  return (
    <div className="app-root">
      {view === 'admin' ? <AdminView onExit={() => setView('home')} /> : (<>
      <Header
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
            onSuccess={(role, name, email) => {
              login(role, name, email);
              setView(role === 'admin' ? 'admin' : 'account');
            }}
          />
        ) : view === 'account' ? (
          <ClientAccount
            userName={userName}
            userEmail={userEmail}
            cartItems={cartItems}
            onChangeQty={changeQty}
            onRemove={removeFromCart}
            onBack={() => setView('home')}
            onLogout={handleLogout}
          />
        ) : view === 'home' ? (
          <>
            <Hero onShop={() => setView('category')} />

            <ProductSection title="Productos Destacados" subtitle="Selección especial de nuestros expertos" onSeeAll={() => setView('category')}>
              <ProductGrid products={featured} onAdd={addToCart} />
            </ProductSection>

            <ProductSection title="Lo Más Vendido" subtitle="Los favoritos de nuestra comunidad" onSeeAll={() => setView('category')} alt>
              <ProductGrid products={bestSellers} onAdd={addToCart} />
            </ProductSection>

            <ProductSection title="Recomendados para Ti" subtitle="Basado en tendencias y mejores valoraciones" onSeeAll={() => setView('category')}>
              <ProductGrid products={recommended} onAdd={addToCart} />
            </ProductSection>

            {/* Trust bar */}
            <div className="app-trust-bar">
              <div className="app-trust-inner">
                <TrustItem icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>} title="Envío rápido" desc="Entrega en 24–72 hs a todo el país" />
                <TrustItem icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>} title="Garantía oficial" desc="Todos los productos con garantía de fábrica" />
                <TrustItem icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>} title="Hasta 12 cuotas" desc="Sin interés con tarjetas seleccionadas" />
                <TrustItem icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>} title="Devolución fácil" desc="30 días para cambios sin preguntas" />
              </div>
            </div>
          </>
        ) : (
          <CategoryView category={activeCategory} searchQuery={activeCategory === 'Resultados de búsqueda' ? searchQuery : ''} onAddToCart={addToCart} onView={() => {}} />
        )}
      </main>

      <Footer />
      </>)}

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={closeCart}
        onRemove={removeFromCart}
        onChangeQty={changeQty}
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

function ProductGrid({ products, onAdd }) {
  return (
    <div className="app-product-grid">
      {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAdd} onView={() => {}} />)}
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
