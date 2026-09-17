const ADMIN_EMAIL = 'admin@techmarket.com';
const ADMIN_PASS = 'admin123';

/** Mock rules to be replaced by real calls to the backend once it's live. */
export function login(email, password) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    return { role: 'admin', name: 'Administrador', email };
  }
  if (email && password.length >= 6) {
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return { role: 'client', name, email };
  }
  throw new Error('Correo o contraseña incorrectos.');
}

export function register(firstName, email) {
  return { role: 'client', name: firstName, email };
}
