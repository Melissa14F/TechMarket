import { apiFetch, ApiError } from './api';

// Convierte un favorito crudo de MockAPI a la forma que usa la app.
// Nota: "cliente" y "producto" son el NOMBRE (no el id), igual que en
// otras relaciones de este backend (por ejemplo orden.cliente).
function mapFavorito(f) {
  return {
    id: f.id,
    cliente: f.cliente,
    producto: f.producto,
    fecha: f.fecha,
  };
}

// Trae los favoritos de un cliente puntual, filtrando por su nombre.
export async function getByCliente(clienteName) {
  try {
    const raw = await apiFetch('/favorito', { params: { cliente: clienteName } });
    return raw.map(mapFavorito);
  } catch (err) {
    // MockAPI devuelve 404 cuando el filtro no encuentra nada — se trata
    // como "sin favoritos todavía", no como un error real.
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

// Marca un producto como favorito de un cliente.
export async function add(clienteName, productoName) {
  const raw = await apiFetch('/favorito', {
    method: 'POST',
    body: JSON.stringify({ cliente: clienteName, producto: productoName }),
  });
  return mapFavorito(raw);
}

// Quita un favorito.
export async function remove(id) {
  return apiFetch(`/favorito/${id}`, { method: 'DELETE' });
}
