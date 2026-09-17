import { useState, useEffect } from 'react';
import { getBanners } from '../services/productsService';
import { useIsMobile } from '../hooks/useBreakpoint';

export default function Hero({ onShop }) {
  const [current, setCurrent] = useState(0);
  const isMobile = useIsMobile();
  const BANNERS = getBanners();

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const b = BANNERS[current];

  return (
    <div className="hero-root">
      {BANNERS.map((banner, i) => (
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
          <button onClick={onShop} className="hero-cta-btn">
            {b.cta} →
          </button>
        </div>
      </div>

      {/* Arrows — hidden on mobile */}
      {!isMobile && (
        <>
          <button onClick={() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length)} className="hero-arrow hero-arrow--left">‹</button>
          <button onClick={() => setCurrent(c => (c + 1) % BANNERS.length)} className="hero-arrow hero-arrow--right">›</button>
        </>
      )}

      {/* Dots */}
      <div className="hero-dots">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`hero-dot ${i === current ? 'hero-dot--active' : ''}`} />
        ))}
      </div>
    </div>
  );
}
