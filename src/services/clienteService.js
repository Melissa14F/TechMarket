import { apiFetch } from './api';
import { sha256Hex } from './authService';

/**
 * MockAPI cliente -> safe shape for the frontend. `contrasena` is
 * deliberately left out of this mapping (an allowlist, not a delete) so
 * it can never leak through getAll/getById into a component or the
 * console — the only place allowed to read it is authService, for
 * verifying a login.
 */
function mapCliente(c) {
  return {
    id: c.id,
    name: c.nombre,
    lastName: c.apellido,
    email: c.correo,
    phone: c.telefono,
    address: c.direccion,
    active: c.estado !== false,
  };
}

export async function getAll() {
  const raw = await apiFetch('/cliente');
  return raw.map(mapCliente);
}

export async function getById(id) {
  const raw = await apiFetch(`/cliente/${id}`);
  return mapCliente(raw);
}

export async function updateCliente(id, fields = {}) {
  const body = {};
  if (fields.name !== undefined) body.nombre = fields.name;
  if (fields.lastName !== undefined) body.apellido = fields.lastName;
  if (fields.email !== undefined) body.correo = fields.email;
  if (fields.phone !== undefined) body.telefono = fields.phone;
  if (fields.address !== undefined) body.direccion = fields.address;

  const raw = await apiFetch(`/cliente/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapCliente(raw);
}

/**
 * Verifies `currentPassword` against the stored hash server-side before
 * writing the new one — never trusts a caller's claim that they know the
 * old password. The raw record (with contrasena) never leaves this
 * function; mapCliente's allowlist still applies everywhere else.
 */
export async function changePassword(id, currentPassword, newPassword) {
  const raw = await apiFetch(`/cliente/${id}`);
  const currentHash = await sha256Hex(currentPassword);
  if (currentHash !== raw.contrasena) {
    throw new Error('La contraseña actual no es correcta.');
  }
  const newHash = await sha256Hex(newPassword);
  await apiFetch(`/cliente/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ contrasena: newHash }),
  });
}
