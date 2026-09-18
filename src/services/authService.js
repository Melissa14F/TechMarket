import { apiFetch } from './api';

/**
 * SHA-256 of a string, hex-encoded. Web Crypto is native to every browser
 * (no new dependency) and works in any secure context (https, or
 * localhost in dev). It is NOT a real password-hashing algorithm — no
 * salt, no work factor, so a leaked hash is fast to brute-force — but
 * it's the strongest thing reachable with no server compute at all:
 * MockAPI can't hash anything itself, and adding bcrypt/argon2 here would
 * mean a new dependency this step wasn't asked to add. Good enough to
 * stop comparing plain text; not a substitute for a real auth backend.
 */
export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Finds the first active record whose `identifierField` matches
 * `identifier` and whose `contrasena` equals the SHA-256 of `password`.
 * The password itself is never compared as plain text.
 */
async function matchCredentials(records, identifierField, identifier, password) {
  const record = records.find(r => r.estado !== false && r[identifierField] === identifier);
  if (!record) return null;
  const hash = await sha256Hex(password);
  return hash === record.contrasena ? record : null;
}

/**
 * `identifier` is checked against admin.correo first, then cliente.correo
 * — both resources use the same field, matching the single "Correo
 * electrónico" input the login form offers for either role. Both paths
 * throw the same generic error, so a failed attempt never reveals which
 * identifier existed.
 */
export async function login(identifier, password) {
  const [admins, clientes] = await Promise.all([
    apiFetch('/admin'),
    apiFetch('/cliente'),
  ]);

  const admin = await matchCredentials(admins, 'correo', identifier, password);
  if (admin) return { role: 'admin', id: admin.id, name: admin.nombre, email: admin.correo };

  const cliente = await matchCredentials(clientes, 'correo', identifier, password);
  if (cliente) return { role: 'client', id: cliente.id, name: `${cliente.nombre} ${cliente.apellido}`, email: cliente.correo };

  throw new Error('Correo o contraseña incorrectos.');
}

/**
 * NOT wired to MockAPI yet — still a local stand-in, same as before this
 * step. This pass only covers login; creating a real cliente record here
 * (hashing the chosen password, POSTing it) is its own follow-up.
 */
export function register(firstName, email) {
  return { role: 'client', name: firstName, email };
}

/**
 * Same pattern as clienteService.changePassword: verifies the current
 * password against the stored hash server-side before writing the new
 * one. The raw record (with contrasena) never leaves this function.
 */
export async function changeAdminPassword(id, currentPassword, newPassword) {
  const raw = await apiFetch(`/admin/${id}`);
  const currentHash = await sha256Hex(currentPassword);
  if (currentHash !== raw.contrasena) {
    throw new Error('La contraseña actual no es correcta.');
  }
  const newHash = await sha256Hex(newPassword);
  await apiFetch(`/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ contrasena: newHash }),
  });
}
