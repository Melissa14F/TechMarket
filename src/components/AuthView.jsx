import { useState } from 'react';
import { useIsMobile } from '../hooks/useBreakpoint';
import { login as authLogin } from '../services/authService';
import { createCliente } from '../services/clienteService';
import logo from '../imports/gato_sin_fondo-1.svg';
import '../styles/AuthView.css';

// Pantalla de autenticación: alterna entre "Iniciar sesión" y "Registrarse"
// dentro de la misma tarjeta. Sirve tanto para administradores como clientes.
export default function AuthView({ onBack, onSuccess }) {
  const handleSuccess = onSuccess ?? (() => onBack());
  const [mode, setMode] = useState('login');
  const isMobile = useIsMobile();

  return (
    <div className="av-page">
      <div className="av-card">

        {/* Panel izquierdo — presentación de la marca (oculto en mobile) */}
        {!isMobile && <div className="av-brand-panel">
          {/* círculos decorativos */}
          <div className="av-circle-1" />
          <div className="av-circle-2" />

          <div className="av-brand-content">
            <button onClick={onBack} className="av-back-btn">
              <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24">
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
              { icon: <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>, text: 'Gestión completa de productos' },
              { icon: <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, text: 'Administración de cupones y descuentos' },
              { icon: <svg className="icon icon-15" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, text: 'Control de anuncios y carrusel' },
            ].map((b) => (
              <div key={b.text} className="av-benefit-row">
                <div className="av-benefit-icon-box">{b.icon}</div>
                <span className="av-benefit-text">{b.text}</span>
              </div>
            ))}
          </div>
        </div>}

        {/* Panel derecho — formulario */}
        <div className="av-form-panel">

          {/* Botón de volver, solo en mobile (el desktop lo tiene dentro del panel de marca) */}
          {isMobile && (
            <button onClick={onBack} className="av-mobile-back-btn">
              <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Volver a la tienda
            </button>
          )}

          {/* Logo, solo en mobile */}
          {isMobile && (
            <div className="av-mobile-logo-row">
              <div className="av-mobile-logo-box">
                <img src={logo} alt="TechMarket" className="hdr-logo-img" />
              </div>
              <span className="av-mobile-brand">Tech<span className="hdr-brand-accent">Market</span></span>
            </div>
          )}

          {/* Selector de modo: iniciar sesión / registrarse */}
          <div className="av-toggle-wrap">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} className={`av-toggle-btn ${mode === m ? 'av-toggle-btn--active' : ''}`}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {mode === 'login'
            ? <LoginForm onSuccess={handleSuccess} />
            : <RegisterForm onSuccess={(id, name, email) => handleSuccess('client', id, name, email)} />
          }
        </div>
      </div>
    </div>
  );
}

/* ── campo de formulario compartido ── */
// Input reutilizable con label y, opcionalmente, un botón para mostrar/ocultar la contraseña.
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
              <svg className="icon icon-16" viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg className="icon icon-16" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Botón principal de envío del formulario.
function PrimaryBtn({ children, disabled }) {
  return (
    <button type="submit" className="av-primary-btn" disabled={disabled}>{children}</button>
  );
}

// Separador visual "o continuá con" entre el formulario y el botón de Google.
function Divider() {
  return (
    <div className="av-divider-wrap">
      <div className="av-divider-line" />
      <span className="av-divider-text">o continuá con</span>
      <div className="av-divider-line" />
    </div>
  );
}

// Botón decorativo de "Continuar con Google" (no tiene funcionalidad real conectada).
function GoogleBtn() {
  return (
    <button type="button" className="av-google-btn">
      <svg className="icon icon-18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continuar con Google
    </button>
  );
}

/* ── Formulario de inicio de sesión ── */
// Login por correo y contraseña; delega la verificación al servicio authService.login.
function LoginForm({ onSuccess }) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Intenta iniciar sesión y, si funciona, pasa el rol/id/nombre/permisos al padre.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await authLogin(email, password);
      setError('');
      onSuccess(result.role, result.id, result.name, result.email, { isPrincipal: result.isPrincipal, permissions: result.permissions });
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setSubmitting(false);
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
              ? <svg className="icon icon-16" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg className="icon icon-16" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>
      </div>

      {error && (
        <div className="av-error-box">
          <svg className="av-error-icon icon icon-15 icon-sw-2_5 icon-stroke-danger" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span className="av-error-text">{error}</span>
        </div>
      )}

      <div className="av-forgot-row">
        <button type="button" className="av-forgot-btn">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <PrimaryBtn disabled={submitting}>{submitting ? 'Verificando…' : 'Iniciar sesión →'}</PrimaryBtn>

      {/* Credenciales de prueba visibles para facilitar la demo/pruebas */}
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

/* ── Formulario de registro ── */
// Registro de una cuenta de cliente nueva; valida contraseña localmente antes de llamar a createCliente.
function RegisterForm({ onSuccess }) {
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Valida largo mínimo y coincidencia de contraseñas, luego crea la cuenta.
  // createCliente ya rechaza correos duplicados (normalizado, ver clienteService.js).
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await createCliente({ name: firstName, lastName, email, password });
      onSuccess(result.id, `${result.name} ${result.lastName}`, result.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="av-form">
      <div className="av-name-grid">
        <Field label="Nombre" placeholder="Juan" autoComplete="given-name" value={firstName} onChange={v => { setFirstName(v); setError(''); }} />
        <Field label="Apellido" placeholder="García" autoComplete="family-name" value={lastName} onChange={v => { setLastName(v); setError(''); }} />
      </div>
      <Field label="Correo electrónico" type="email" placeholder="tu@email.com" autoComplete="email" value={email} onChange={v => { setEmail(v); setError(''); }} />
      <Field label="Contraseña" placeholder="Mín. 8 caracteres" showToggle show={showPass} onToggle={() => setShowPass(v => !v)} autoComplete="new-password" value={password} onChange={v => { setPassword(v); setError(''); }} />
      <Field label="Confirmar contraseña" placeholder="Repetí tu contraseña" showToggle show={showPass2} onToggle={() => setShowPass2(v => !v)} autoComplete="new-password" value={confirmPassword} onChange={v => { setConfirmPassword(v); setError(''); }} />

      {error && (
        <div className="av-error-box">
          <svg className="av-error-icon icon icon-15 icon-sw-2_5 icon-stroke-danger" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span className="av-error-text">{error}</span>
        </div>
      )}

      <label className="av-terms-label">
        <input type="checkbox" required className="av-terms-checkbox" />
        <span className="av-terms-text">
          Acepto los{' '}
          <span className="av-terms-link">Términos y condiciones</span>
          {' '}y la{' '}
          <span className="av-terms-link">Política de privacidad</span>
        </span>
      </label>

      <PrimaryBtn disabled={submitting}>{submitting ? 'Creando cuenta…' : 'Crear mi cuenta →'}</PrimaryBtn>
      <Divider />
      <GoogleBtn />
    </form>
  );
}
