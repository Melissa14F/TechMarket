import { apiFetch } from './api';
import { sha256Hex } from './authService';

// Convierte un cliente crudo de MockAPI a la forma segura que usa la app.
// Ojo: "contrasena" queda afuera a propósito, para que nunca se filtre al
// resto de la app (solo authService la lee, para verificar el login).
function mapCliente(c) {
  return {
    id: c.id,
    name: c.nombre,
    lastName: c.apellido,
    email: c.correo,
    phone: c.telefono,
    address: c.direccion,
    postalCode: c.codigo_postal ?? '',
    active: c.estado !== false,
  };
}

// Registro real de un cliente nuevo: primero verifica que el correo no
// esté usado, y recién ahí crea la cuenta con la contraseña hasheada
// (nunca en texto plano). Teléfono y dirección arrancan vacíos — el
// cliente los completa después desde "Mi perfil".
export async function createCliente({ name, lastName, email, password }) {
  const existing = await apiFetch('/cliente');
  // Compara sin importar mayúsculas/minúsculas ni espacios de más, para
  // que "Juan@Gmail.com" y "juan@gmail.com " no se traten como cuentas distintas.
  const normalized = email.trim().toLowerCase();
  if (existing.some(c => (c.correo ?? '').trim().toLowerCase() === normalized)) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }

  const contrasena = await sha256Hex(password);
  const raw = await apiFetch('/cliente', {
    method: 'POST',
    body: JSON.stringify({
      nombre: name,
      apellido: lastName,
      correo: email,
      telefono: '',
      direccion: '',
      codigo_postal: '',
      estado: true,
      contrasena,
    }),
  });
  return mapCliente(raw);
}

// Trae todos los clientes (para el panel de admin).
export async function getAll() {
  const raw = await apiFetch('/cliente');
  return raw.map(mapCliente);
}

// Trae un cliente puntual por su id.
export async function getById(id) {
  const raw = await apiFetch(`/cliente/${id}`);
  return mapCliente(raw);
}

// Devuelve la dirección/código postal guardados del cliente, solo si YA
// completó ambos datos alguna vez — si no, devuelve null. El checkout usa
// esto para pedir los datos de envío solo la primera vez.
export async function getSavedShippingInfo(id) {
  const cliente = await getById(id);
  return (cliente.address && cliente.postalCode)
    ? { address: cliente.address, postalCode: cliente.postalCode }
    : null;
}

// Actualiza los datos de un cliente (edición parcial: solo cambia los
// campos que se le pasen).
export async function updateCliente(id, fields = {}) {
  const body = {};
  if (fields.name !== undefined) body.nombre = fields.name;
  if (fields.lastName !== undefined) body.apellido = fields.lastName;
  if (fields.email !== undefined) body.correo = fields.email;
  if (fields.phone !== undefined) body.telefono = fields.phone;
  if (fields.address !== undefined) body.direccion = fields.address;
  if (fields.postalCode !== undefined) body.codigo_postal = fields.postalCode;
  if (fields.active !== undefined) body.estado = fields.active;

  const raw = await apiFetch(`/cliente/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapCliente(raw);
}

// Activa o desactiva un cliente (atajo sobre updateCliente).
export async function toggleCliente(id, active) {
  return updateCliente(id, { active });
}

// Elimina un cliente.
export async function deleteCliente(id) {
  return apiFetch(`/cliente/${id}`, { method: 'DELETE' });
}

// Cambia la contraseña de un cliente: primero verifica que la actual sea
// correcta (comparando el hash), y solo si coincide guarda la nueva.
export async function changePassword(id, currentPassword, newPassword) {
  const raw = await apiFetch(`/cliente/${id}`); // trae el registro completo, con la contraseña hasheada
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
