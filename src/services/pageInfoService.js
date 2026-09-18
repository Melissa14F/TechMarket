import { apiFetch } from './api';

/**
 * The real configured schema (confirmed 2026-09-17 once a record finally
 * existed to inspect) is nombre/telefono/direccion/horario/correo — not
 * the nombre_tienda/email guess this service shipped with in Paso 6,
 * before the resource had any data to check against. eslogan/whatsapp/
 * facebook/instagram aren't part of that schema, but MockAPI still stores
 * them as loose extra properties since PageInfoPanel's form collects
 * them — harmless, just not schema-enforced.
 */
function mapPageInfo(i) {
  return {
    id: i.id,
    storeName: i.nombre,
    tagline: i.eslogan,
    email: i.correo,
    phone: i.telefono,
    address: i.direccion,
    hours: i.horario,
    whatsapp: i.whatsapp,
    facebook: i.facebook,
    instagram: i.instagram,
  };
}

/**
 * There's only ever one row. Returns null (not an error) when the
 * resource has no record yet — that's a legitimate "not configured yet"
 * state, distinct from a real fetch failure, and it's up to the caller to
 * offer creating the first record.
 */
export async function getPageInfo() {
  const raw = await apiFetch('/informacion');
  const [info] = raw;
  return info ? mapPageInfo(info) : null;
}

export async function createPageInfo(fields = {}) {
  const raw = await apiFetch('/informacion', {
    method: 'POST',
    body: JSON.stringify({
      nombre: fields.storeName ?? '',
      eslogan: fields.tagline ?? '',
      correo: fields.email ?? '',
      telefono: fields.phone ?? '',
      direccion: fields.address ?? '',
      horario: fields.hours ?? '',
      whatsapp: fields.whatsapp ?? '',
      facebook: fields.facebook ?? '',
      instagram: fields.instagram ?? '',
    }),
  });
  return mapPageInfo(raw);
}

export async function updatePageInfo(id, fields = {}) {
  const body = {};
  if (fields.storeName !== undefined) body.nombre = fields.storeName;
  if (fields.tagline !== undefined) body.eslogan = fields.tagline;
  if (fields.email !== undefined) body.correo = fields.email;
  if (fields.phone !== undefined) body.telefono = fields.phone;
  if (fields.address !== undefined) body.direccion = fields.address;
  if (fields.hours !== undefined) body.horario = fields.hours;
  if (fields.whatsapp !== undefined) body.whatsapp = fields.whatsapp;
  if (fields.facebook !== undefined) body.facebook = fields.facebook;
  if (fields.instagram !== undefined) body.instagram = fields.instagram;

  const raw = await apiFetch(`/informacion/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapPageInfo(raw);
}
