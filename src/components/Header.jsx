import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '../hooks/useBreakpoint';
import { getCategories } from '../services/categoriesService';
import logo from '../imports/gato_sin_fondo-1.svg';
import '../styles/Header.css';

// Cabecera de la tienda: logo, buscador, navegación por categorías y
// accesos a cuenta/carrito. Tiene dos layouts completamente distintos
// (mobile con menú hamburguesa, desktop con barra de navegación).
export default function Header({ info, cartCount, onCartOpen, onAccountOpen, onCategorySelect, onHome, searchQuery, onSearch, onSearchSubmit, isLoggedIn, onLogout, hideNav }) {
  const whatsappUrl = `https://wa.me/${info.whatsapp}`;
  const [megaOpen, setMegaOpen] = useState(false); // menú desplegable "Catálogo" (desktop)
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // menú lateral (mobile)
  const [searchOpen, setSearchOpen] = useState(false); // barra de búsqueda desplegada (mobile)
  const [categories, setCategories] = useState([]);
  const megaRef = useRef(null);
  const isMobile = useIsMobile();
  const topCats = categories.slice(0, 3); // las primeras 3 categorías se muestran directo en la barra de navegación

  // Carga las categorías activas una sola vez al montar.
  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then(data => { if (!cancelled) setCategories(data.filter(c => c.active)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Cierra el menú "Catálogo" al hacer clic fuera de él.
  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cierra el menú y la búsqueda mobile si la pantalla pasa a tamaño desktop.
  useEffect(() => {
    if (!isMobile) { setMenuOpen(false); setSearchOpen(false); }
  }, [isMobile]);

  // Bloquea el scroll del body mientras el menú mobile está abierto.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className="hdr-root">
      {isMobile ? (
        /* ─── CABECERA MOBILE ─── */
        <>
          <div className="hdr-mobile-bar">
            {/* Logo */}
            <button onClick={() => { onHome(); setMenuOpen(false); }} className="hdr-mobile-logo-btn">
              <div className="hdr-logo-box">
                <img src={logo} alt={info.storeName} className="hdr-logo-img" />
              </div>
              <BrandName name={info.storeName} className="hdr-brand-mobile" />
            </button>

            {/* Ícono de búsqueda */}
            <button onClick={() => setSearchOpen(v => !v)} className="hdr-icon-btn">
              <svg className="icon icon-16 icon-sw-2_5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Carrito */}
            <button onClick={onCartOpen} className="hdr-icon-btn hdr-icon-btn--cart">
              <svg className="icon icon-18" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span className="hdr-cart-badge">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Botón hamburguesa */}
            <button onClick={() => setMenuOpen(v => !v)} className={`hdr-hamburger ${menuOpen ? 'hdr-hamburger--open' : ''}`}>
              <span className={`hdr-hamburger-bar ${menuOpen ? 'hdr-hamburger-bar--top-open' : ''}`} />
              <span className={`hdr-hamburger-bar ${menuOpen ? 'hdr-hamburger-bar--mid-open' : ''}`} />
              <span className={`hdr-hamburger-bar ${menuOpen ? 'hdr-hamburger-bar--bot-open' : ''}`} />
            </button>
          </div>

          {/* Barra de búsqueda mobile (solo si se abrió) */}
          {searchOpen && (
            <div className="hdr-mobile-search-wrap">
              <div className="hdr-mobile-search-inner">
                <svg className="hdr-search-icon icon icon-15 icon-sw-2_5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text" autoFocus placeholder="Buscar productos..."
                  value={searchQuery} onChange={e => onSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { onSearchSubmit?.(); setSearchOpen(false); } }}
                  className="hdr-mobile-search-input"
                />
              </div>
            </div>
          )}

          {/* Menú lateral deslizable (mobile) */}
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} className="hdr-menu-overlay" />
              <div className="hdr-menu-panel">
                {/* Encabezado del menú */}
                <div className="hdr-menu-header">
                  <span className="hdr-menu-title">Menú</span>
                  <button onClick={() => setMenuOpen(false)} className="hdr-menu-close">✕</button>
                </div>

                {/* Fila de cuenta: login o acceso a "Mi cuenta" + cerrar sesión */}
                <div className={`hdr-menu-account-row ${isLoggedIn ? 'hdr-menu-account-row--logged' : ''}`}>
                  {isLoggedIn ? (
                    <div className="hdr-menu-account-flex">
                      <button onClick={() => { onAccountOpen(); setMenuOpen(false); }} className="hdr-menu-account-info">
                        <div className="hdr-menu-avatar">
                          <svg className="icon icon-18 icon-stroke-white" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <span className="hdr-menu-account-label">Mi cuenta</span>
                      </button>
                      <button onClick={() => { onLogout(); setMenuOpen(false); }} className="hdr-menu-logout-link">Cerrar sesión</button>
                    </div>
                  ) : (
                    <button onClick={() => { onAccountOpen(); setMenuOpen(false); }} className="hdr-menu-login-btn">
                      Iniciar sesión
                    </button>
                  )}
                </div>

                {/* Enlaces de navegación: inicio + las 3 categorías principales */}
                <div className="hdr-menu-nav-group">
                  <MobileMenuItem icon="🏠" label="Inicio" onClick={() => { onHome(); setMenuOpen(false); }} />
                  {topCats.map(cat => (
                    <MobileMenuItem key={cat.id} icon="›" label={cat.name} onClick={() => { onCategorySelect(cat.name); setMenuOpen(false); }} />
                  ))}
                </div>

                {/* Todas las categorías (catálogo completo) */}
                <div className="hdr-menu-nav-group hdr-menu-nav-group--bordered">
                  <div className="hdr-menu-catalog-label">Catálogo</div>
                  {categories.map(cat => (
                    <MobileMenuItem key={cat.id} icon="" label={cat.name} onClick={() => { onCategorySelect(cat.name); setMenuOpen(false); }} indent />
                  ))}
                </div>

                {/* Enlace a WhatsApp */}
                <div className="hdr-menu-nav-group hdr-menu-nav-group--bordered">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hdr-menu-whatsapp">
                    <span className="hdr-menu-emoji">💬</span> WhatsApp
                  </a>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        /* ─── CABECERA DESKTOP ─── */
        <>
          <div className="hdr-desktop-container">
            <div className="hdr-desktop-row">
              {/* IZQUIERDA — Logo */}
              <button onClick={onHome} className="hdr-desktop-logo-btn">
                <div className="hdr-logo-box hdr-logo-box--lg">
                  <img src={logo} alt={info.storeName} className="hdr-logo-img" />
                </div>
                <BrandName name={info.storeName} className="hdr-brand-desktop" />
              </button>

              {/* CENTRO — Buscador */}
              <div className="hdr-search-wrap">
                <svg className="hdr-search-icon hdr-search-icon--desktop icon icon-16 icon-sw-2_5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar productos, marcas, categorías..."
                  value={searchQuery}
                  onChange={e => onSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') onSearchSubmit?.(); }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`hdr-search-input ${searchFocused ? 'hdr-search-input--focused' : ''}`}
                />
              </div>

              {/* DERECHA — Cuenta + Carrito */}
              <div className="hdr-right-actions">
                {/* Always opens the account view (or the login screen when
                    logged out) — signing out lives inside the account page
                    itself, not here, so this never doubles as a logout. */}
                <button onClick={onAccountOpen} className="hdr-account-btn">
                  <div className="hdr-account-dot-wrap">
                    <svg className="icon icon-20" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    {isLoggedIn && <div className="hdr-account-online-dot" />}
                  </div>
                  <span className={`hdr-account-label ${isLoggedIn ? 'hdr-account-label--active' : ''}`}>Mi cuenta</span>
                </button>

                <div className="hdr-divider-v" />

                <button onClick={onCartOpen} className="hdr-account-btn">
                  <div className="hdr-account-dot-wrap">
                    <svg className="icon icon-20" viewBox="0 0 24 24">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    {cartCount > 0 && (
                      <span className="hdr-cart-badge hdr-cart-badge--desktop">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hdr-account-label">Carrito</span>
                </button>
              </div>
            </div>
          </div>

          {/* Nivel 2: barra de navegación por categorías */}
          {!hideNav && (
            <div className="hdr-nav-bar">
              <div className="hdr-nav-inner">
                <nav className="hdr-nav">
                  <NavBtn onClick={onHome} icon={
                    <svg className="icon icon-13 icon-sw-2_5" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  }>Inicio</NavBtn>

                  <div className="hdr-nav-sep" />

                  {topCats.map((cat, i) => (
                    <span key={cat.id} className="hdr-nav-cat">
                      <NavBtn onClick={() => onCategorySelect(cat.name)}>{cat.name}</NavBtn>
                      {i < topCats.length - 1 && <div className="hdr-nav-sep" />}
                    </span>
                  ))}

                  <div className="hdr-nav-sep" />

                  {/* Menú desplegable "Catálogo" con todas las categorías */}
                  <div ref={megaRef} className="hdr-mega-wrap">
                    <button onClick={() => setMegaOpen(v => !v)} className={`hdr-mega-trigger ${megaOpen ? 'hdr-mega-trigger--open' : ''}`}>
                      <svg className="icon icon-13 icon-sw-2_5" viewBox="0 0 24 24">
                        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                      </svg>
                      Catálogo
                      <svg className="`hdr-mega-chevron ${megaOpen ? 'hdr-mega-chevron--open' : '' icon icon-12 icon-sw-2_5" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {megaOpen && (
                      <div className="hdr-mega-panel">
                        {categories.map(cat => (
                          <button key={cat.id} onClick={() => { onCategorySelect(cat.name); setMegaOpen(false); }} className="hdr-mega-link">{cat.name}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </nav>

                {/* Enlaces de la derecha: contacto + WhatsApp */}
                <div className="hdr-right-links">
                  <NavBtn onClick={() => document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' })}>Contáctenos</NavBtn>
                  <div className="hdr-nav-sep" />
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hdr-whatsapp-link">
                    <svg className="icon-fill icon-14 icon-whatsapp-dark" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.25.625 4.35 1.71 6.136L0 24l5.996-1.674A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.535-5.375-1.462l-.386-.228-3.996 1.115 1.072-3.9-.25-.4A9.945 9.945 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </header>
  );
}

/** Keeps the two-tone logo look (last word in accent color) for any
 * store name, not just the literal "Tech" + "Market" split it replaces. */
// Separa el nombre de la tienda en dos partes para pintar la última palabra con el color de acento.
function BrandName({ name, className }) {
  const words = name.trim().split(' ');
  const last = words.pop();
  const rest = words.join(' ');
  return (
    <span className={className}>
      {rest && `${rest} `}<span className="hdr-brand-accent">{last}</span>
    </span>
  );
}

// Ítem individual del menú lateral mobile.
function MobileMenuItem({ icon, label, onClick, indent }) {
  return (
    <button onClick={onClick} className={`hdr-menu-item ${indent ? 'hdr-menu-item--indent' : ''}`}>
      {icon && <span className="hdr-menu-item-icon">{icon}</span>}
      {label}
    </button>
  );
}

// Botón de navegación del desktop (con ícono opcional).
function NavBtn({ children, onClick, icon }) {
  return (
    <button onClick={onClick} className="hdr-nav-btn">
      {icon}{children}
    </button>
  );
}
