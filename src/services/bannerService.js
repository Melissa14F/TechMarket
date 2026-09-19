import { apiFetch } from './api';

// Convierte un banner crudo de MockAPI a la forma que usa el Hero (carrusel)
// y el panel de admin. Si no tiene texto de botón guardado, usa "Ver ahora"
// como valor por defecto.
function mapBanner(b) {
  return {
    id: b.id,
    title: b.titulo,
    subtitle: b.subtitulo,
    cta: b.boton_texto || 'Ver ahora',
    link: b.boton_link,
    image: b.imagen,
    accent: b.color_boton,
    order: b.orden ?? 0,
    active: b.estado !== false,
  };
}

// Convierte los campos del formulario (en inglés/camelCase) al formato que
// espera MockAPI (en español) — solo incluye los campos que realmente
// vengan definidos, para no pisar datos al hacer una edición parcial.
function buildBannerBody(fields = {}) {
  const body = {};
  if (fields.title !== undefined) body.titulo = fields.title;
  if (fields.subtitle !== undefined) body.subtitulo = fields.subtitle;
  if (fields.cta !== undefined) body.boton_texto = fields.cta;
  if (fields.link !== undefined) body.boton_link = fields.link;
  if (fields.image !== undefined) body.imagen = fields.image;
  if (fields.accent !== undefined) body.color_boton = fields.accent;
  if (fields.order !== undefined) body.orden = Number(fields.order);
  if (fields.active !== undefined) body.estado = fields.active;
  return body;
}

// Trae solo los banners activos, ordenados por su posición — es lo que
// muestra el carrusel de la portada (Hero.jsx).
export async function getBanners() {
  const raw = await apiFetch('/banner');
  return raw
    .filter(b => b.estado !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map(mapBanner);
}

// Trae TODOS los banners (activos e inactivos) — la usa el panel de admin,
// para poder ver y reactivar un banner que esté desactivado.
export async function getAllBanners() {
  const raw = await apiFetch('/banner');
  return raw
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map(mapBanner);
}

// Crea un banner nuevo, activo por defecto.
export async function createBanner(fields) {
  const raw = await apiFetch('/banner', {
    method: 'POST',
    body: JSON.stringify({ ...buildBannerBody(fields), estado: true }),
  });
  return mapBanner(raw);
}

// Actualiza un banner existente (edición parcial: solo cambia los campos
// que se le pasen).
export async function updateBanner(id, fields) {
  const raw = await apiFetch(`/banner/${id}`, {
    method: 'PUT',
    body: JSON.stringify(buildBannerBody(fields)),
  });
  return mapBanner(raw);
}

// Elimina un banner.
export async function deleteBanner(id) {
  return apiFetch(`/banner/${id}`, { method: 'DELETE' });
}
