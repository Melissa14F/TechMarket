import { useState, useEffect } from 'react';
import { getBanners } from '../services/productsService';
import { useIsMobile } from '../hooks/useBreakpoint';
import '../styles/Hero.css';

export default function Hero({ onCtaClick }) {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    let cancelled = false;
    getBanners()
      .then(data => { if (!cancelled) setBanners(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const b = banners[current];

  return (
    <div className="hero-root">
      {loading && <div className="hero-status">Cargando banners…</div>}
      {!loading && error && <div className="hero-status hero-status--error">No se pudieron cargar los banners.</div>}

      {!loading && !error && b && (
        <>
          {banners.map((banner, i) => (
            <div key={banner.id} className={`hero-slide ${i === current ? 'hero-slide--active' : ''}`}>
              <img src={banner.image} alt={banner.title} className="hero-slide-img" />
              <div className="hero-slide-overlay" />
            </div>
          ))}

          <div className="hero-content">
            <div className="hero-inner">
              <div className="hero-badge">
                Oferta destacada
              </div>
              <h1 className="hero-title">
                {b.title}
              </h1>
              {!isMobile && (
                <p className="hero-subtitle">
                  {b.subtitle}
                </p>
              )}
              <button onClick={() => onCtaClick(b)} className="hero-cta-btn">
                {b.cta} →
              </button>
            </div>
          </div>

          {/* Arrows — hidden on mobile */}
          {!isMobile && (
            <>
              <button onClick={() => setCurrent(c => (c - 1 + banners.length) % banners.length)} className="hero-arrow hero-arrow--left">‹</button>
              <button onClick={() => setCurrent(c => (c + 1) % banners.length)} className="hero-arrow hero-arrow--right">›</button>
            </>
          )}

          {/* Dots */}
          <div className="hero-dots">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`hero-dot ${i === current ? 'hero-dot--active' : ''}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
