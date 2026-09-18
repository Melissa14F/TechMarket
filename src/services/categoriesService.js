import { apiFetch } from './api';

/**
 * `count` is never stored in MockAPI — it's derived here by counting how
 * many products (active or not; this view is for admins managing
 * inventory, not the public catalog) carry this category's name.
 */
function mapCategory(c, productCounts) {
  return {
    id: c.id,
    name: c.nombre,
    description: c.descripcion,
    active: c.estado !== false,
    count: productCounts[c.nombre] ?? 0,
  };
}

export async function getCategories() {
  const [rawCategories, rawProducts] = await Promise.all([
    apiFetch('/categoria'),
    apiFetch('/producto'),
  ]);

  const productCounts = {};
  for (const p of rawProducts) {
    productCounts[p.categoria] = (productCounts[p.categoria] ?? 0) + 1;
  }

  return rawCategories.map((c) => mapCategory(c, productCounts));
}

export async function createCategory({ name, description }) {
  const raw = await apiFetch('/categoria', {
    method: 'POST',
    body: JSON.stringify({
      nombre: name,
      descripcion: description ?? '',
      estado: true,
    }),
  });
  return mapCategory(raw, {});
}

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

export async function toggleCategory(id, active) {
  return updateCategory(id, { active });
}

export async function deleteCategory(id) {
  return apiFetch(`/categoria/${id}`, { method: 'DELETE' });
}
