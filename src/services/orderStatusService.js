import { apiFetch } from './api';

// Convierte un estado de pedido crudo de MockAPI a la forma que usa el
// panel de admin "Estados de pedido".
function mapOrderStatus(e) {
  return {
    id: e.id,
    name: e.nombre,
    description: e.descripcion,
    color: e.color,
    active: e.estado !== false,
  };
}

// Trae el catálogo completo de estados posibles para un pedido.
export async function getOrderStatuses() {
  const raw = await apiFetch('/estado_orden');
  return raw.map(mapOrderStatus);
}

// Crea un estado nuevo (por ejemplo "En aduana"), activo por defecto.
export async function createOrderStatus({ name, description, color }) {
  const raw = await apiFetch('/estado_orden', {
    method: 'POST',
    body: JSON.stringify({
      nombre: name,
      descripcion: description ?? '',
      color: color ?? '#5B2A86',
      estado: true,
    }),
  });
  return mapOrderStatus(raw);
}

// Actualiza un estado existente (edición parcial).
export async function updateOrderStatus(id, { name, description, color, active } = {}) {
  const body = {};
  if (name !== undefined) body.nombre = name;
  if (description !== undefined) body.descripcion = description;
  if (color !== undefined) body.color = color;
  if (active !== undefined) body.estado = active;

  const raw = await apiFetch(`/estado_orden/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapOrderStatus(raw);
}

// Activa o desactiva un estado (atajo sobre updateOrderStatus).
export async function toggleOrderStatus(id, active) {
  return updateOrderStatus(id, { active });
}

// Elimina un estado del catálogo.
export async function deleteOrderStatus(id) {
  return apiFetch(`/estado_orden/${id}`, { method: 'DELETE' });
}
