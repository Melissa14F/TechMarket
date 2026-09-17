import { useState, useMemo } from 'react';
import { getProducts } from '../services/productsService';
import ProductCard from './ProductCard';
import { useIsMobile } from '../hooks/useBreakpoint';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'rating', label: 'Más valorados' },
];

export default function CategoryView({ category, searchQuery = '', onAddToCart, onView }) {
  const [sort, setSort] = useState('relevance');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const PRODUCTS = getProducts();

  const brands = [...new Set(PRODUCTS.map(p => p.brand))].sort();

  const filtered = useMemo(() => {
    let list = PRODUCTS;
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    if (priceMin) list = list.filter(p => p.price >= Number(priceMin));
    if (priceMax) list = list.filter(p => p.price <= Number(priceMax));
    if (selectedBrands.length > 0) list = list.filter(p => selectedBrands.includes(p.brand));
    if (onlyPromo) list = list.filter(p => p.originalPrice);
    switch (sort) {
      case 'price-asc': return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating': return [...list].sort((a, b) => b.rating - a.rating);
      default: return list;
    }
  }, [searchQuery, priceMin, priceMax, selectedBrands, onlyPromo, sort]);

  const toggleBrand = (brand) =>
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  const activeFilterCount = (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + selectedBrands.length + (onlyPromo ? 1 : 0);

  const FiltersContent = () => (
    <>
      <div className="cv-filters-header">
        <span className="cv-filters-title">Filtros</span>
        <button onClick={() => { setPriceMin(''); setPriceMax(''); setSelectedBrands([]); setOnlyPromo(false); }} className="cv-clear-btn">
          Limpiar
        </button>
      </div>

      <FilterSection title="Precio">
        <div className="cv-price-row">
          <input type="number" placeholder="Mín" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="cv-price-input" />
          <span className="cv-price-sep">—</span>
          <input type="number" placeholder="Máx" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="cv-price-input" />
        </div>
      </FilterSection>

      <FilterSection title="Marca">
        <div className="cv-brand-list">
          {brands.map(brand => (
            <label key={brand} className="cv-checkbox-label">
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="cv-checkbox" />
              {brand}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Ofertas">
        <label className="cv-checkbox-label">
          <input type="checkbox" checked={onlyPromo} onChange={e => setOnlyPromo(e.target.checked)} className="cv-checkbox" />
          Solo con descuento
        </label>
      </FilterSection>
    </>
  );

  return (
    <div className="cv-container">
      {/* Mobile: top bar with filter button */}
      {isMobile && (
        <div className="cv-mobile-topbar">
          <div>
            <h2 className="cv-mobile-title">{category}</h2>
            <p className="cv-mobile-count">{filtered.length} productos</p>
          </div>
          <div className="cv-mobile-actions">
            <button onClick={() => setFilterDrawerOpen(true)} className={`cv-filter-btn ${activeFilterCount > 0 ? 'cv-filter-btn--active' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
            <select value={sort} onChange={e => setSort(e.target.value)} className="cv-sort-select">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Mobile filter drawer */}
      {isMobile && filterDrawerOpen && (
        <>
          <div onClick={() => setFilterDrawerOpen(false)} className="cv-drawer-overlay" />
          <div className="cv-drawer-panel">
            <div className="cv-drawer-handle" />
            <FiltersContent />
            <button onClick={() => setFilterDrawerOpen(false)} className="cv-drawer-cta">
              Ver {filtered.length} resultados
            </button>
          </div>
        </>
      )}

      {isMobile ? (
        /* Mobile: full-width grid only */
        filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="cv-grid--mobile">
            {filtered.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onView={onView} />)}
          </div>
        )
      ) : (
        /* Desktop: sidebar + grid */
        <div className="cv-desktop-grid">
          <aside className="cv-sidebar">
            <FiltersContent />
          </aside>

          <main>
            <div className="cv-main-header">
              <div>
                <h2 className="cv-main-title">{category}</h2>
                <p className="cv-main-count">{filtered.length} productos</p>
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)} className="cv-sort-select cv-sort-select--desktop">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="cv-grid--desktop">
                {filtered.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onView={onView} />)}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="cv-empty">
      <div className="cv-empty-icon-box">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <div className="cv-empty-title">Sin resultados</div>
      <div className="cv-empty-sub">Prueba ajustando los filtros</div>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="cv-filter-section">
      <div className="cv-filter-section-title">{title}</div>
      {children}
    </div>
  );
}
