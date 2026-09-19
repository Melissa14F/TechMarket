import { apiFetch } from './api';

// Convierte una categoría cruda de MockAPI a la forma que usa la app.
// "count" (cantidad de productos) no viene guardado en MockAPI — se
// calcula acá mismo, contando cuántos productos tienen esa categoría.
function mapCategory(c, productCounts) {
  return {
    id: c.id,
    name: c.nombre,
    description: c.descripcion,
    active: c.estado !== false,
    count: productCounts[c.nombre] ?? 0,
  };
}

// Trae todas las categorías, ya con la cantidad real de productos de cada una.
export async function getCategories() {
  // Trae categorías y productos en paralelo.
  const [rawCategories, rawProducts] = await Promise.all([
    apiFetch('/categoria'),
    apiFetch('/producto'),
  ]);

  // Cuenta cuántos productos hay por cada nombre de categoría.
  const productCounts = {};
  for (const p of rawProducts) {
    productCounts[p.categoria] = (productCounts[p.categoria] ?? 0) + 1;
  }

  return rawCategories.map((c) => mapCategory(c, productCounts));
}

// Crea una categoría nueva, activa por defecto.
export async function createCategory({ name, description }) {
  const raw = await apiFetch('/categoria', {
    method: 'POST',
    body: JSON.stringify({
      nombre: name,
      descripcion: description ?? '',
      estado: true,
    }),
  });
  return mapCategory(raw, {}); // recién creada, todavía no tiene productos (count = 0)
}

// Actualiza una categoría existente (edición parcial).
export async function updateCategory(id, { name, description, active } = {}) {
  const body = {};
  if (name !== undefined) body.nombre = name;
  if (description !== undefined) body.descripcion = description;
  if (active !== undefined) body.estado = active;

  const raw = await apiFetch(`/categoria/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapCategory(raw, {});
}

// Activa o desactiva una categoría (atajo sobre updateCategory).
export async function toggleCategory(id, active) {
  return updateCategory(id, { active });
}

// Elimina una categoría.
export async function deleteCategory(id) {
  return apiFetch(`/categoria/${id}`, { method: 'DELETE' });
}
