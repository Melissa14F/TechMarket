import { apiFetch, ApiError } from './api';

/**
 * MockAPI's `favorito` resource has no seed data (empty), so its exact
 * shape couldn't be read off live records like every other service here —
 * a test write/read/delete round-trip (2026-09-17) confirmed `cliente` and
 * `producto` are accepted and persist, and that MockAPI auto-fills a
 * `fecha` timestamp on create. `cliente`/`producto` are plain name
 * strings, matching how orden.cliente and detalle_orden.producto already
 * reference records by name rather than id in this backend.
 */
function mapFavorito(f) {
  return {
    id: f.id,
    cliente: f.cliente,
    producto: f.producto,
    fecha: f.fecha,
  };
}

export async function getByCliente(clienteName) {
  try {
    const raw = await apiFetch('/favorito', { params: { cliente: clienteName } });
    return raw.map(mapFavorito);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function add(clienteName, productoName) {
  const raw = await apiFetch('/favorito', {
    method: 'POST',
    body: JSON.stringify({ cliente: clienteName, producto: productoName }),
  });
  return mapFavorito(raw);
}

export async function remove(id) {
  return apiFetch(`/favorito/${id}`, { method: 'DELETE' });
}
