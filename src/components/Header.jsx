import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '../hooks/useBreakpoint';
import logo from '../imports/gato_sin_fondo-1.svg';

const CATEGORIES = [
  { name: 'Computadoras', sub: ['Laptops', 'Desktops', 'All-in-One', 'Workstations'] },
  { name: 'Smartphones', sub: ['Android', 'iPhone', 'Básicos', 'Reacondicionados'] },
  { name: 'Audio', sub: ['Auriculares', 'Parlantes', 'Micrófonos', 'Soundbars'] },
  { name: 'Gaming', sub: ['Consolas', 'Teclados', 'Ratones', 'Sillas Gamer', 'Monitores'] },
  { name: 'Accesorios', sub: ['Cables', 'Hubs USB', 'Fundas', 'Cargadores'] },
  { name: 'Redes', sub: ['Routers', 'Switches', 'Access Points', 'Cámaras IP'] },
];

const TOP_CATS = ['Laptops', 'Gaming', 'Smartphones'];

export default function Header({ cartCount, onCartOpen, onAccountOpen, onCategorySelect, onHome, searchQuery, onSearch, onSearchSubmit, isLoggedIn, onLogout, hideNav }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const megaRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    if (!isMobile) { setMenuOpen(false); setSearchOpen(false); }
  }, [isMobile]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className="hdr-root">
      {isMobile ? (
        /* ─── MOBILE HEADER ─── */
        <>
          <div className="hdr-mobile-bar">
            {/* Logo */}
            <button onClick={() => { onHome(); setMenuOpen(false); }} className="hdr-mobile-logo-btn">
              <div className="hdr-logo-box">
                <img src={logo} alt="TechMarket" className="hdr-logo-img" />
              </div>
              <span className="hdr-brand-mobile">
                Tech<span className="hdr-brand-accent">Market</span>
              </span>
            </button>

            {/* Search icon */}
            <button onClick={() => setSearchOpen(v => !v)} className="hdr-icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Cart */}
            <button onClick={onCartOpen} className="hdr-icon-btn hdr-icon-btn--cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span className="hdr-cart-badge">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(v => !v)} className={`hdr-hamburger ${menuOpen ? 'hdr-hamburger--open' : ''}`}>
              <span className={`hdr-hamburger-bar ${menuOpen ? 'hdr-hamburger-bar--top-open' : ''}`} />
              <span className={`hdr-hamburger-bar ${menuOpen ? 'hdr-hamburger-bar--mid-open' : ''}`} />
              <span className={`hdr-hamburger-bar ${menuOpen ? 'hdr-hamburger-bar--bot-open' : ''}`} />
            </button>
          </div>

          {/* Mobile search bar */}
          {searchOpen && (
            <div className="hdr-mobile-search-wrap">
              <div className="hdr-mobile-search-inner">
                <svg className="hdr-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Mobile slide-out menu */}
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} className="hdr-menu-overlay" />
              <div className="hdr-menu-panel">
                {/* Menu header */}
                <div className="hdr-menu-header">
                  <span className="hdr-menu-title">Menú</span>
                  <button onClick={() => setMenuOpen(false)} className="hdr-menu-close">✕</button>
                </div>

                {/* Account row */}
                <div className={`hdr-menu-account-row ${isLoggedIn ? 'hdr-menu-account-row--logged' : ''}`}>
                  {isLoggedIn ? (
                    <div className="hdr-menu-account-flex">
                      <div className="hdr-menu-account-info">
                        <div className="hdr-menu-avatar">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <span className="hdr-menu-account-label">Mi cuenta</span>
                      </div>
                      <button onClick={() => { onLogout(); setMenuOpen(false); }} className="hdr-menu-logout-link">Cerrar sesión</button>
                    </div>
                  ) : (
                    <button onClick={() => { onAccountOpen(); setMenuOpen(false); }} className="hdr-menu-login-btn">
                      Iniciar sesión
                    </button>
                  )}
                </div>

                {/* Nav links */}
                <div className="hdr-menu-nav-group">
                  <MobileMenuItem icon="🏠" label="Inicio" onClick={() => { onHome(); setMenuOpen(false); }} />
                  {TOP_CATS.map(cat => (
                    <MobileMenuItem key={cat} icon="›" label={cat} onClick={() => { onCategorySelect(cat); setMenuOpen(false); }} />
                  ))}
                </div>

                <div className="hdr-menu-nav-group hdr-menu-nav-group--bordered">
                  <div className="hdr-menu-catalog-label">Catálogo</div>
                  {CATEGORIES.map(cat => (
                    <div key={cat.name}>
                      <div className="hdr-menu-cat-heading">{cat.name}</div>
                      {cat.sub.map(s => (
                        <MobileMenuItem key={s} icon="" label={s} onClick={() => { onCategorySelect(s); setMenuOpen(false); }} indent />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="hdr-menu-nav-group hdr-menu-nav-group--bordered">
                  <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="hdr-menu-whatsapp">
                    <span className="hdr-menu-emoji">💬</span> WhatsApp
                  </a>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        /* ─── DESKTOP HEADER ─── */
        <>
          <div className="hdr-desktop-container">
            <div className="hdr-desktop-row">
              {/* LEFT — Logo */}
              <button onClick={onHome} className="hdr-desktop-logo-btn">
                <div className="hdr-logo-box hdr-logo-box--lg">
                  <img src={logo} alt="TechMarket" className="hdr-logo-img" />
                </div>
                <span className="hdr-brand-desktop">
                  Tech<span className="hdr-brand-accent">Market</span>
                </span>
              </button>

              {/* CENTER — Search */}
              <div className="hdr-search-wrap">
                <svg className="hdr-search-icon hdr-search-icon--desktop" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

              {/* RIGHT — Account + Cart */}
              <div className="hdr-right-actions">
                {isLoggedIn ? (
                  <button onClick={onLogout} className="hdr-account-btn">
                    <div className="hdr-account-dot-wrap">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      <div className="hdr-account-online-dot" />
                    </div>
                    <span className="hdr-account-label hdr-account-label--active">Mi cuenta</span>
                  </button>
                ) : (
                  <button onClick={onAccountOpen} className="hdr-account-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="hdr-account-label">Mi cuenta</span>
                  </button>
                )}

                <div className="hdr-divider-v" />

                <button onClick={onCartOpen} className="hdr-account-btn">
                  <div className="hdr-account-dot-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Level 2: Navigation */}
          {!hideNav && (
            <div className="hdr-nav-bar">
              <div className="hdr-nav-inner">
                <nav className="hdr-nav">
                  <NavBtn onClick={onHome} icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  }>Inicio</NavBtn>

                  <div className="hdr-nav-sep" />

                  {TOP_CATS.map((cat, i) => (
                    <span key={cat} className="hdr-nav-cat">
                      <NavBtn onClick={() => onCategorySelect(cat)}>{cat}</NavBtn>
                      {i < TOP_CATS.length - 1 && <div className="hdr-nav-sep" />}
                    </span>
                  ))}

                  <div className="hdr-nav-sep" />

                  <div ref={megaRef} className="hdr-mega-wrap">
                    <button onClick={() => setMegaOpen(v => !v)} className={`hdr-mega-trigger ${megaOpen ? 'hdr-mega-trigger--open' : ''}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                      </svg>
                      Catálogo
                      <svg className={`hdr-mega-chevron ${megaOpen ? 'hdr-mega-chevron--open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {megaOpen && (
                      <div className="hdr-mega-panel">
                        {CATEGORIES.map(cat => (
                          <div key={cat.name}>
                            <div className="hdr-mega-col-title">{cat.name}</div>
                            {cat.sub.map(s => (
                              <button key={s} onClick={() => { onCategorySelect(s); setMegaOpen(false); }} className="hdr-mega-link">{s}</button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </nav>

                <div className="hdr-right-links">
                  <NavBtn onClick={() => {}}>Contáctenos</NavBtn>
                  <div className="hdr-nav-sep" />
                  <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="hdr-whatsapp-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#16A34A">
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

function MobileMenuItem({ icon, label, onClick, indent }) {
  return (
    <button onClick={onClick} className={`hdr-menu-item ${indent ? 'hdr-menu-item--indent' : ''}`}>
      {icon && <span className="hdr-menu-item-icon">{icon}</span>}
      {label}
    </button>
  );
}

function NavBtn({ children, onClick, icon }) {
  return (
    <button onClick={onClick} className="hdr-nav-btn">
      {icon}{children}
    </button>
  );
}
