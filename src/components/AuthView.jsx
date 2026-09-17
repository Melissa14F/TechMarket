import { useState } from 'react';
import { useIsMobile } from '../hooks/useBreakpoint';
import { login as authLogin, register as authRegister } from '../services/authService';
import logo from '../imports/gato_sin_fondo-1.svg';

export default function AuthView({ onBack, onSuccess }) {
  const handleSuccess = onSuccess ?? (() => onBack());
  const [mode, setMode] = useState('login');
  const isMobile = useIsMobile();

  return (
    <div className="av-page">
      <div className="av-card">

        {/* Left panel — brand (hidden on mobile) */}
        {!isMobile && <div className="av-brand-panel">
          {/* decorative circles */}
          <div className="av-circle-1" />
          <div className="av-circle-2" />

          <div className="av-brand-content">
            <button onClick={onBack} className="av-back-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Volver a la tienda
            </button>

            <div className="av-brand-logo-row">
              <div className="av-brand-logo-box">
                <img src={logo} alt="TechMarket" className="hdr-logo-img" />
              </div>
              <span className="av-brand-name">TechMarket</span>
            </div>

            <h2 className="av-brand-title">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Creá tu cuenta'}
            </h2>
            <p className="av-brand-desc">
              {mode === 'login'
                ? 'Ingresá para acceder al panel de administración y gestionar tu tienda.'
                : 'Creá tu cuenta de administrador para gestionar productos, categorías y más.'}
            </p>
          </div>

          <div className="av-benefits-wrap">
            {[
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>, text: 'Gestión completa de productos' },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, text: 'Administración de cupones y descuentos' },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, text: 'Control de anuncios y carrusel' },
            ].map((b) => (
              <div key={b.text} className="av-benefit-row">
                <div className="av-benefit-icon-box">{b.icon}</div>
                <span className="av-benefit-text">{b.text}</span>
              </div>
            ))}
          </div>
        </div>}

        {/* Right panel — form */}
        <div className="av-form-panel">

          {/* Mobile back button */}
          {isMobile && (
            <button onClick={onBack} className="av-mobile-back-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Volver a la tienda
            </button>
          )}

          {/* Logo on mobile */}
          {isMobile && (
            <div className="av-mobile-logo-row">
              <div className="av-mobile-logo-box">
                <img src={logo} alt="TechMarket" className="hdr-logo-img" />
              </div>
              <span className="av-mobile-brand">Tech<span className="hdr-brand-accent">Market</span></span>
            </div>
          )}

          {/* Toggle switch */}
          <div className="av-toggle-wrap">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} className={`av-toggle-btn ${mode === m ? 'av-toggle-btn--active' : ''}`}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {mode === 'login'
            ? <LoginForm onSuccess={handleSuccess} />
            : <RegisterForm onSuccess={(name, email) => handleSuccess('client', name, email)} />
          }
        </div>
      </div>
    </div>
  );
}

/* ── shared field ── */
function Field({ label, type = 'text', placeholder, showToggle, show, onToggle, autoComplete, value, onChange }) {
  return (
    <div className="av-field-wrap">
      <label className="av-field-label">
        {label}
      </label>
      <div className="av-field-input-wrap">
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange ? e => onChange(e.target.value) : undefined}
          className={`av-field-input ${showToggle ? 'av-field-input--toggle' : ''}`}
        />
        {showToggle && (
          <button type="button" onClick={onToggle} className="av-field-toggle-btn">
            {show ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function PrimaryBtn({ children }) {
  return (
    <button type="submit" className="av-primary-btn">{children}</button>
  );
}

function Divider() {
  return (
    <div className="av-divider-wrap">
      <div className="av-divider-line" />
      <span className="av-divider-text">o continuá con</span>
      <div className="av-divider-line" />
    </div>
  );
}

function GoogleBtn() {
  return (
    <button type="button" className="av-google-btn">
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continuar con Google
    </button>
  );
}

/* ── Login form ── */
function LoginForm({ onSuccess }) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const result = authLogin(email, password);
      setError('');
      onSuccess(result.role, result.name, result.email);
    } catch {
      setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="av-form">
      <div className="av-field-wrap">
        <label className="av-field-label">Correo electrónico</label>
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="tu@email.com" autoComplete="email"
          className={`av-field-input ${error ? 'av-field-input--error' : ''}`}
        />
      </div>

      <div className="av-field-wrap">
        <label className="av-field-label">Contraseña</label>
        <div className="av-field-input-wrap">
          <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" autoComplete="current-password"
            className={`av-field-input av-field-input--toggle ${error ? 'av-field-input--error' : ''}`}
          />
          <button type="button" onClick={() => setShowPass(v => !v)} className="av-field-toggle-btn">
            {showPass
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>
      </div>

      {error && (
        <div className="av-error-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="av-error-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span className="av-error-text">{error}</span>
        </div>
      )}

      <div className="av-forgot-row">
        <button type="button" className="av-forgot-btn">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <PrimaryBtn>Iniciar sesión →</PrimaryBtn>

      <div className="av-demo-box">
        <div className="av-demo-title">Credenciales de prueba</div>
        <div className="av-demo-text">
          <span className="av-demo-label">Email:</span> admin@techmarket.com<br />
          <span className="av-demo-label">Pass:</span> admin123
        </div>
      </div>
    </form>
  );
}

/* ── Register form ── */
function RegisterForm({ onSuccess }) {
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); const result = authRegister(firstName, email); onSuccess(result.name, result.email); }} className="av-form">
      <div className="av-name-grid">
        <Field label="Nombre" placeholder="Juan" autoComplete="given-name" value={firstName} onChange={setFirstName} />
        <Field label="Apellido" placeholder="García" autoComplete="family-name" />
      </div>
      <Field label="Correo electrónico" type="email" placeholder="tu@email.com" autoComplete="email" value={email} onChange={setEmail} />
      <Field label="Contraseña" placeholder="Mín. 8 caracteres" showToggle show={showPass} onToggle={() => setShowPass(v => !v)} autoComplete="new-password" />
      <Field label="Confirmar contraseña" placeholder="Repetí tu contraseña" showToggle show={showPass2} onToggle={() => setShowPass2(v => !v)} autoComplete="new-password" />

      <label className="av-terms-label">
        <input type="checkbox" required className="av-terms-checkbox" />
        <span className="av-terms-text">
          Acepto los{' '}
          <span className="av-terms-link">Términos y condiciones</span>
          {' '}y la{' '}
          <span className="av-terms-link">Política de privacidad</span>
        </span>
      </label>

      <PrimaryBtn>Crear mi cuenta →</PrimaryBtn>
      <Divider />
      <GoogleBtn />
    </form>
  );
}
