import { apiFetch } from './api';
import { sha256Hex } from './authService';

// Convierte un registro "admin" crudo de MockAPI a la forma que usa
// UsersPanel. Ojo: la contraseña (contrasena) se deja afuera a propósito,
// para que nunca llegue al resto de la app.
function mapAdminUser(a) {
  return {
    id: a.id,
    name: a.nombre,
    email: a.correo,
    active: a.estado !== false,
    isPrincipal: a.esPrincipal === true,
    permissions: a.permisos ?? [],
  };
}

// Trae todas las cuentas admin (para la tabla del panel "Usuarios").
export async function getAdminUsers() {
  const raw = await apiFetch('/admin');
  return raw.map(mapAdminUser);
}

// Crea una cuenta admin nueva (nunca principal — eso solo puede existir
// una vez y no se asigna desde este formulario). Antes de crear, revisa
// que no exista ya otra cuenta con el mismo correo.
export async function createAdminUser({ name, email, password, permissions = [] }) {
  const existing = await apiFetch('/admin');
  // Compara sin importar mayúsculas/minúsculas ni espacios de más.
  const normalized = email.trim().toLowerCase();
  if (existing.some(a => (a.correo ?? '').trim().toLowerCase() === normalized)) {
    throw new Error('Ya existe una cuenta admin con ese correo.');
  }

  const contrasena = await sha256Hex(password); // nunca se guarda la contraseña en texto plano
  const raw = await apiFetch('/admin', {
    method: 'POST',
    body: JSON.stringify({
      nombre: name,
      correo: email,
      contrasena,
      estado: true,
      esPrincipal: false, // las cuentas creadas acá nunca son principales
      permisos: permissions,
    }),
  });
  return mapAdminUser(raw);
}

// Actualiza los datos de una cuenta admin (nombre, correo, activo,
// permisos). No permite tocar "esPrincipal" a propósito.
export async function updateAdminUser(id, { name, email, active, permissions } = {}) {
  const body = {};
  if (name !== undefined) body.nombre = name;
  if (email !== undefined) body.correo = email;
  if (active !== undefined) body.estado = active;
  if (permissions !== undefined) body.permisos = permissions;

  const raw = await apiFetch(`/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapAdminUser(raw);
}

// Activa o desactiva una cuenta admin (atajo sobre updateAdminUser).
export async function toggleAdminUser(id, active) {
  return updateAdminUser(id, { active });
}

// Elimina una cuenta admin.
export async function deleteAdminUser(id) {
  return apiFetch(`/admin/${id}`, { method: 'DELETE' });
}
